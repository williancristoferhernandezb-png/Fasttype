import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface PeticionAutenticada extends Request {
  usuario?: { id: number; nombre: string };
}

export function verificarToken(
  req: PeticionAutenticada,
  res: Response,
  next: NextFunction
) {
  const cabecera = req.headers.authorization;
  const token = cabecera?.startsWith("Bearer ") ? cabecera.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: "Falta el token" });
    return;
  }

  try {
    const datos = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: number;
      nombre: string;
    };
    req.usuario = { id: datos.id, nombre: datos.nombre };
    next();
  } catch {
    res.status(401).json({ error: "Token inválido o vencido" });
  }
}