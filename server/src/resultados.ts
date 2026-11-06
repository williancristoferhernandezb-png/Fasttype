import { Router } from "express";
import { pool } from "./db";
import { verificarToken, type PeticionAutenticada } from "./verificarToken";

export const resultadosRouter = Router();

resultadosRouter.post("/", verificarToken, async (req: PeticionAutenticada, res) => {
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
    "INSERT INTO resultados (usuario_id, wpm, precision, segundos) VALUES ($1, $2, $3, $4) RETURNING *",
    [req.usuario!.id, wpm, precision, segundos]
  );
  res.status(201).json(nuevo.rows[0]);
});

resultadosRouter.get("/historial", verificarToken, async (req: PeticionAutenticada, res) => {
  const resultado = await pool.query(
    "SELECT id, wpm, precision, segundos, creado_en FROM resultados WHERE usuario_id = $1 ORDER BY creado_en DESC LIMIT 50",
    [req.usuario!.id]
  );
  res.json(resultado.rows);
});

resultadosRouter.get("/ranking", async (_req, res) => {
  const resultado = await pool.query(`
    SELECT u.nombre, MAX(r.wpm) AS mejor_wpm
    FROM resultados r
    JOIN usuarios u ON u.id = r.usuario_id
    GROUP BY u.nombre
    ORDER BY mejor_wpm DESC
    LIMIT 10
  `);
  res.json(resultado.rows);
});