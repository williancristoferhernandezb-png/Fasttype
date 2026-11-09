import { useState } from "react";
import { entrar, entrarConGoogle } from "./api";

export default function Login({
  onEntrar,
}: {
  onEntrar: (nombre: string) => void;
}) {
  const [modo, setModo] = useState<"login" | "registro">("login");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      const usuario = await entrar(modo, nombre.trim(), email.trim(), contrasena);
      onEntrar(usuario);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión");
    } finally {
      setCargando(false);
    }
  }

  async function google() {
    setError("");
    setCargando(true);
    try {
      await entrarConGoogle();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo conectar con Google");
      setCargando(false);
    }
  }

  return (
    <main className="auth-screen">
      <div className="auth-glow auth-glow-one" />
      <div className="auth-glow auth-glow-two" />

      <section className="auth-card">
        <a className="auth-brand" href="/">
          FAST<span>TYPE</span><i>_</i>
        </a>

        <div className="auth-kicker"><span /> UNLOCK YOUR SPEED</div>
        <h1>{modo === "login" ? "VUELVE A" : "ÚNETE A"} <span>{modo === "login" ? "ROMPER LÍMITES." : "FASTTYPE."}</span></h1>
        <p className="auth-subtitle">
          {modo === "login"
            ? "Inicia sesión y continúa superando tu velocidad."
            : "Crea tu cuenta y empieza a entrenar tu velocidad."}
        </p>

        <button
          type="button"
          className="auth-google"
          onClick={google}
          disabled={cargando}
        >
          <svg viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.9c-.58 2.96-2.26 5.48-4.75 7.18l7.73 6C44.39 37.98 46.98 31.93 46.98 24.55Z"/>
            <path fill="#FBBC05" d="M10.53 28.59A14.4 14.4 0 0 1 9.75 24c0-1.59.27-3.13.76-4.59l-7.98-6.19A23.9 23.9 0 0 0 0 24c0 3.87.93 7.52 2.56 10.78l7.97-6.19Z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.73-6c-2.14 1.45-4.88 2.3-8.17 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"/>
          </svg>
          Continuar con Google
        </button>

        <div className="auth-divider"><span /> O CON TU CORREO <span /></div>

        <form className="auth-form" onSubmit={enviar}>
          {modo === "registro" && (
            <label>
              NOMBRE
              <input
                autoComplete="name"
                placeholder="Cómo te llamas"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                maxLength={80}
              />
            </label>
          )}

          <label>
            CORREO ELECTRÓNICO
            <input
              type="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            CONTRASEÑA
            <input
              type="password"
              autoComplete={modo === "login" ? "current-password" : "new-password"}
              placeholder="Mínimo 8 caracteres"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
              minLength={8}
            />
          </label>

          {error && <p className="auth-error" role="alert">{error}</p>}

          <button className="auth-submit" type="submit" disabled={cargando}>
            {cargando
              ? "PROCESANDO..."
              : modo === "login"
                ? "INICIAR SESIÓN"
                : "CREAR CUENTA"}
            <span>↗</span>
          </button>
        </form>

        <p className="auth-switch">
          {modo === "login" ? "¿Todavía no tienes cuenta?" : "¿Ya tienes una cuenta?"}
          <button
            type="button"
            onClick={() => {
              setModo(modo === "login" ? "registro" : "login");
              setError("");
            }}
          >
            {modo === "login" ? "Regístrate" : "Inicia sesión"}
          </button>
        </p>

        <div className="auth-foot">FASTTYPE <b>•</b> TRAIN. IMPROVE. DOMINATE.</div>
      </section>
    </main>
  );
}
