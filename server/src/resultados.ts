import { Router } from "express";
import { pool } from "./db";
import { verificarToken, type PeticionAutenticada } from "./verificarToken";

export const resultadosRouter = Router();

// La tabla propia evita depender del esquema antiguo de usuarios.
export async function prepararTablaResultados() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS resultados_perfil (
      id BIGSERIAL PRIMARY KEY,
      usuario_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      wpm INTEGER NOT NULL CHECK (wpm >= 0 AND wpm <= 400),
      precision INTEGER NOT NULL CHECK (precision >= 0 AND precision <= 100),
      segundos INTEGER NOT NULL CHECK (segundos >= 1 AND segundos <= 3600),
      creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_resultados_perfil_usuario_fecha
      ON resultados_perfil (usuario_id, creado_en DESC);
    CREATE INDEX IF NOT EXISTS idx_resultados_perfil_wpm
      ON resultados_perfil (wpm DESC);
  `);
}

// Guardar una prueba terminada del usuario autenticado.
resultadosRouter.post("/", verificarToken, async (req: PeticionAutenticada, res) => {
  try {
    const { wpm, precision, segundos } = req.body;
    if (
      !Number.isInteger(wpm) || wpm < 0 || wpm > 400 ||
      !Number.isInteger(precision) || precision < 0 || precision > 100 ||
      !Number.isInteger(segundos) || segundos < 1 || segundos > 3600
    ) {
      res.status(400).json({ error: "Datos inválidos" });
      return;
    }

    const nuevo = await pool.query(
      `INSERT INTO resultados_perfil (usuario_id, wpm, precision, segundos)
       VALUES ($1, $2, $3, $4)
       RETURNING id, wpm, precision, segundos, creado_en`,
      [req.usuario!.id, wpm, precision, segundos]
    );
    res.status(201).json(nuevo.rows[0]);
  } catch (error) {
    console.error("Error guardando resultado:", error);
    res.status(500).json({ error: "No se pudo guardar el resultado" });
  }
});

// Resumen de todas las pruebas del usuario autenticado.
resultadosRouter.get("/resumen", verificarToken, async (req: PeticionAutenticada, res) => {
  try {
    const resultado = await pool.query(
      `SELECT
         COUNT(*)::int AS practicas,
         COALESCE(ROUND(AVG(wpm)), 0)::int AS promedio_wpm,
         COALESCE(MAX(wpm), 0)::int AS mejor_wpm,
         COALESCE(ROUND(AVG(precision)), 0)::int AS promedio_precision,
         COALESCE(SUM(segundos), 0)::bigint AS segundos_totales
       FROM resultados_perfil WHERE usuario_id = $1`,
      [req.usuario!.id]
    );
    res.json(resultado.rows[0]);
  } catch (error) {
    console.error("Error obteniendo resumen:", error);
    res.status(500).json({ error: "No se pudo obtener el resumen" });
  }
});

// Historial personal; solo devuelve datos del usuario autenticado.
resultadosRouter.get("/historial", verificarToken, async (req: PeticionAutenticada, res) => {
  try {
    const resultado = await pool.query(
      `SELECT id, wpm, precision, segundos, creado_en
       FROM resultados_perfil
       WHERE usuario_id = $1
       ORDER BY creado_en DESC LIMIT 50`,
      [req.usuario!.id]
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error("Error obteniendo historial:", error);
    res.status(500).json({ error: "No se pudo obtener el historial" });
  }
});

// Ranking por mejor velocidad registrada.
resultadosRouter.get("/ranking", async (_req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT u.name AS nombre, MAX(r.wpm)::int AS mejor_wpm
      FROM resultados_perfil r
      JOIN "user" u ON u.id = r.usuario_id
      GROUP BY u.id, u.name
      ORDER BY mejor_wpm DESC, u.name ASC
      LIMIT 10
    `);
    res.json(resultado.rows);
  } catch (error) {
    console.error("Error obteniendo ranking:", error);
    res.status(500).json({ error: "No se pudo obtener el ranking" });
  }
});
