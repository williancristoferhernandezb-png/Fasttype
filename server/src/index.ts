import express from "express";
import cors from "cors";
import { pool } from "./db";
import { authRouter } from "./auth";
import { resultadosRouter } from "./resultados";

const app = express();
const PUERTO = 3000;

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRouter);
app.use("/api/resultados", resultadosRouter);

app.get("/api/salud", (_req, res) => {
  res.json({ mensaje: "El servidor funciona" });
});



app.listen(PUERTO, () => {
  console.log(`Servidor escuchando en http://localhost:${PUERTO}`);
});