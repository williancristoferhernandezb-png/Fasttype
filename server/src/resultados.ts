import { Router } from "express";
import { pool } from "./db";
import { verificarToken, type PeticionAutenticada } from "./verificarToken";

export const resultadosRouter = Router();

// La tabla resultados ya existe; se conserva para no perder el historial previo.
export async function prepararTablaResultados() {
  return;
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
      `INSERT INTO resultados (usuario_id, wpm, precision, segundos)
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
       FROM resultados WHERE usuario_id = $1`,
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
       FROM resultados
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

// Actividad diaria para el calendario y la evolución del perfil (últimos 90 días).
resultadosRouter.get("/actividad", verificarToken, async (req: PeticionAutenticada, res) => {
  try {
    const resultado = await pool.query(
      `SELECT DATE(creado_en AT TIME ZONE 'UTC')::text AS fecha,
              COUNT(*)::int AS practicas,
              ROUND(AVG(wpm))::int AS promedio_wpm,
              MAX(wpm)::int AS mejor_wpm
       FROM resultados
       WHERE usuario_id = $1
         AND creado_en >= NOW() - INTERVAL '90 days'
       GROUP BY DATE(creado_en AT TIME ZONE 'UTC')
       ORDER BY fecha ASC`,
      [req.usuario!.id]
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error("Error obteniendo actividad:", error);
    res.status(500).json({ error: "No se pudo obtener la actividad" });
  }
});

// Ranking por mejor velocidad registrada.
resultadosRouter.get("/ranking", async (_req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT u.name AS nombre, MAX(r.wpm)::int AS mejor_wpm
      FROM resultados r
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
