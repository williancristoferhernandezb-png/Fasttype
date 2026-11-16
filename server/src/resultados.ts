import { Router } from "express";
import { pool } from "./db";
import { verificarToken, type PeticionAutenticada } from "./verificarToken";

export const resultadosRouter = Router();

// La tabla resultados ya existe; se conserva para no perder el historial previo.
export async function prepararTablaResultados() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS confianza_teclas_v2 (
      usuario_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      codigo TEXT NOT NULL,
      etiqueta TEXT NOT NULL,
      aciertos INTEGER NOT NULL DEFAULT 0 CHECK (aciertos >= 0),
      intentos INTEGER NOT NULL DEFAULT 0 CHECK (intentos >= aciertos),
      actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (usuario_id, codigo)
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS confianza_teclas (
      usuario_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      codigo TEXT NOT NULL,
      etiqueta TEXT NOT NULL,
      aciertos INTEGER NOT NULL DEFAULT 0 CHECK (aciertos >= 0),
      intentos INTEGER NOT NULL DEFAULT 0 CHECK (intentos >= aciertos),
      actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (usuario_id, codigo)
    );
  `);
}


 // Guardar el resumen acumulado de precisión por tecla.
resultadosRouter.post("/teclas", verificarToken, async (req: PeticionAutenticada, res) => {
  try {
    const teclas = req.body?.teclas;
    if (!Array.isArray(teclas) || teclas.length > 100) {
      res.status(400).json({ error: "Datos de teclas inválidos" });
      return;
    }
    for (const t of teclas) {
      if (
        typeof t.codigo !== "string" || !/^[A-Za-z0-9]+$/.test(t.codigo) ||
        typeof t.etiqueta !== "string" || t.etiqueta.length > 4 ||
        !Number.isInteger(t.aciertos) || !Number.isInteger(t.intentos) ||
        t.aciertos < 0 || t.intentos < t.aciertos || t.intentos > 100000
      ) {
        res.status(400).json({ error: "Registro de tecla inválido" });
        return;
      }
    }
    for (const t of teclas) {
      if (t.intentos === 0) continue;
      await pool.query(
        `INSERT INTO confianza_teclas_v2 (usuario_id, codigo, etiqueta, aciertos, intentos)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (usuario_id, codigo) DO UPDATE SET
           etiqueta = EXCLUDED.etiqueta,
           aciertos = confianza_teclas_v2.aciertos + EXCLUDED.aciertos,
           intentos = confianza_teclas_v2.intentos + EXCLUDED.intentos,
           actualizado_en = NOW()`,
        [req.usuario!.id, t.codigo, t.etiqueta, t.aciertos, t.intentos]
      );
    }
    res.json({ guardadas: teclas.length });
  } catch (error) {
    console.error("Error guardando confianza de teclas:", error);
    res.status(500).json({ error: "No se pudo guardar la confianza de teclas" });
  }
});

// Estadísticas acumuladas por tecla del usuario autenticado.
resultadosRouter.get("/teclas", verificarToken, async (req: PeticionAutenticada, res) => {
  try {
    const resultado = await pool.query(
      `SELECT codigo, etiqueta, aciertos, intentos,
              CASE WHEN intentos = 0 THEN 0
                   ELSE ROUND(aciertos * 100.0 / intentos)::int END AS precision
       FROM confianza_teclas_v2
       WHERE usuario_id = $1
       ORDER BY codigo ASC`,
      [req.usuario!.id]
    );
    res.json(resultado.rows);
  } catch (error) {
    console.error("Error obteniendo confianza de teclas:", error);
    res.status(500).json({ error: "No se pudo obtener la confianza de teclas" });
  }
});

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
