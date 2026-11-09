
import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";

import { pool } from "./db";
import { auth } from "./betterAuth";
import { resultadosRouter } from "./resultados";

const app = express();
const PUERTO = 3000;

// Permitir que React se comunique con el servidor
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// Better Auth debe procesar las solicitudes antes de express.json()
app.all("/api/auth/{*any}", toNodeHandler(auth));

// Procesamiento de JSON para las demás rutas
app.use(express.json());

// Rutas de resultados
app.use("/api/resultados", resultadosRouter);

// Comprobar que el servidor funciona
app.get("/api/salud", (_req, res) => {
  res.json({ mensaje: "El servidor funciona" });
});

app.listen(PUERTO, () => {
  console.log(`Servidor escuchando en http://localhost:${PUERTO}`);
});
