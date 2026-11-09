import { Router } from "express";
import { pool } from "./db";
import {
  verificarToken,
  type PeticionAutenticada,
} from "./verificarToken";

export const resultadosRouter = Router();

// Guardar un resultado asociado al usuario autenticado con Better Auth.
resultadosRouter.post(
  "/",
  verificarToken,
  async (req: PeticionAutenticada, res) => {
    try {
      const { wpm, precision, segundos } = req.body;

      if (
        !Number.isInteger(wpm) || wpm < 0 || wpm > 400 ||
        !Number.isInteger(precision) || precision < 0 || precision > 100 ||
        !Number.isInteger(segundos) || segundos < 1 || segundos > 30
      ) {
        res.status(400).json({ error: "Datos inválidos" });
        return;
      }

      const nuevo = await pool.query(
        `INSERT INTO resultados
          (usuario_id, wpm, precision, segundos)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [req.usuario!.id, wpm, precision, segundos]
      );

      res.status(201).json(nuevo.rows[0]);
    } catch (error) {
      console.error("Error guardando resultado:", error);
      res.status(500).json({
        error: "No se pudo guardar el resultado",
      });
    }
  }
);

// Devolver únicamente el historial del usuario autenticado.
resultadosRouter.get(
  "/historial",
  verificarToken,
  async (req: PeticionAutenticada, res) => {
    try {
      const resultado = await pool.query(
        `SELECT id, wpm, precision, segundos, creado_en
         FROM resultados
         WHERE usuario_id = $1
         ORDER BY creado_en DESC
         LIMIT 50`,
        [req.usuario!.id]
      );

      res.json(resultado.rows);
    } catch (error) {
      console.error("Error obteniendo historial:", error);
      res.status(500).json({
        error: "No se pudo obtener el historial",
      });
    }
  }
);

// Ranking general usando la tabla de usuarios de Better Auth.
resultadosRouter.get("/ranking", async (_req, res) => {
  try {
    const resultado = await pool.query(`
      SELECT
        u.name AS nombre,
        MAX(r.wpm) AS mejor_wpm
      FROM resultados r
      JOIN "user" u ON u.id = r.usuario_id
      GROUP BY u.id, u.name
      ORDER BY mejor_wpm DESC
      LIMIT 10
    `);

    res.json(resultado.rows);
  } catch (error) {
    console.error("Error obteniendo ranking:", error);
    res.status(500).json({
      error: "No se pudo obtener el ranking",
    });
  }
});
