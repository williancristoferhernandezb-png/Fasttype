import express from "express";
import cors from "cors";
import { pool } from "./db";

const app = express();
const PUERTO = 3000;

app.use(cors());
app.use(express.json());

app.get("/api/salud", (_req, res) => {
  res.json({ mensaje: "El servidor funciona" });
});

app.get("/api/db", async (_req, res) => {
  const resultado = await pool.query("SELECT NOW()");
  res.json({ hora: resultado.rows[0].now });
});

app.listen(PUERTO, () => {
  console.log(`Servidor escuchando en http://localhost:${PUERTO}`);
});