import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "./betterAuth";

export interface PeticionAutenticada extends Request {
  usuario?: {
    id: string;
    nombre: string;
    email: string;
  };
}

export async function verificarToken(
  req: PeticionAutenticada,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      res.status(401).json({
        error: "No has iniciado sesión o tu sesión ha expirado",
      });
      return;
    }

    req.usuario = {
      id: session.user.id,
      nombre: session.user.name,
      email: session.user.email,
    };

    next();
  } catch (error) {
    console.error("Error verificando sesión:", error);
    res.status(500).json({
      error: "Error al verificar la sesión",
    });
  }
}
