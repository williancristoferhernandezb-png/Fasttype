import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "./db";

export const authRouter = Router();

authRouter.post("/registro", async (req, res) => {
  const { nombre, contrasena } = req.body;

  if (!nombre || !contrasena || contrasena.length < 6) {
    res.status(400).json({ error: "Nombre y contraseña (mínimo 6 caracteres) son obligatorios" });
    return;
  }

  const existe = await pool.query("SELECT id FROM usuarios WHERE nombre = $1", [nombre]);
  if (existe.rows.length > 0) {
    res.status(409).json({ error: "Ese nombre ya está en uso" });
    return;
  }

  const hash = await bcrypt.hash(contrasena, 10);
  const nuevo = await pool.query(
    "INSERT INTO usuarios (nombre, contrasena_hash) VALUES ($1, $2) RETURNING id, nombre",
    [nombre, hash]
  );

  res.status(201).json(nuevo.rows[0]);
});

authRouter.post("/login", async (req, res) => {
  const { nombre, contrasena } = req.body;

  const resultado = await pool.query("SELECT * FROM usuarios WHERE nombre = $1", [nombre]);
  const usuario = resultado.rows[0];

  if (!usuario || !(await bcrypt.compare(contrasena ?? "", usuario.contrasena_hash))) {
    res.status(401).json({ error: "Nombre o contraseña incorrectos" });
    return;
  }

  const token = jwt.sign(
    { id: usuario.id, nombre: usuario.nombre },
    process.env.JWT_SECRET as string,
    { expiresIn: "7d" }
  );

  res.json({ token, nombre: usuario.nombre });
});