import { useState } from "react";
import { entrar } from "./api";

export default function Login({
  onEntrar,
}: {
  onEntrar: (nombre: string) => void;
}) {
  const [modo, setModo] = useState<"login" | "registro">("login");
  const [nombre, setNombre] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const usuario = await entrar(modo, nombre, contrasena);
      onEntrar(usuario);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    }
  }

  return (
    <div>
      <h1>Fasttype</h1>
      <h2>{modo === "login" ? "Iniciar sesión" : "Crear cuenta"}</h2>
      <form onSubmit={enviar}>
        <p>
          <input
            placeholder="Nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </p>
        <p>
          <input
            type="password"
            placeholder="Contraseña (mínimo 6)"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
          />
        </p>
        <button type="submit">
          {modo === "login" ? "Entrar" : "Registrarme"}
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <p>
        <button onClick={() => setModo(modo === "login" ? "registro" : "login")}>
          {modo === "login"
            ? "¿No tienes cuenta? Regístrate"
            : "¿Ya tienes cuenta? Inicia sesión"}
        </button>
      </p>
    </div>
  );
}