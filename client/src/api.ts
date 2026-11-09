const API = "http://localhost:3000/api";

type UsuarioAuth = {
  id: string;
  name: string;
  email: string;
};

async function respuestaAuth<T>(res: Response): Promise<T> {
  const datos = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      datos.message || datos.error || "No se pudo completar la solicitud"
    );
  }
  return datos as T;
}

export async function obtenerSesion(): Promise<UsuarioAuth | null> {
  const res = await fetch(`${API}/auth/get-session`, {
    method: "GET",
    credentials: "include",
  });
  const datos = await respuestaAuth<{
    user?: UsuarioAuth;
  } | null>(res);
  return datos?.user ?? null;
}

export async function entrar(
  modo: "login" | "registro",
  nombre: string,
  email: string,
  contrasena: string
): Promise<string> {
  const endpoint =
    modo === "registro" ? "sign-up/email" : "sign-in/email";

  const body =
    modo === "registro"
      ? { name: nombre, email, password: contrasena }
      : { email, password: contrasena };

  const res = await fetch(`${API}/auth/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const datos = await respuestaAuth<{ user: UsuarioAuth }>(res);
  return datos.user.name;
}

export async function entrarConGoogle(): Promise<void> {
  const res = await fetch(`${API}/auth/sign-in/social`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      provider: "google",
      callbackURL: window.location.origin,
    }),
  });

  const datos = await respuestaAuth<{ url?: string }>(res);
  if (!datos.url) {
    throw new Error("Google no devolvió una dirección de autenticación");
  }

  window.location.assign(datos.url);
}

export async function cerrarSesion(): Promise<void> {
  const res = await fetch(`${API}/auth/sign-out`, {
    method: "POST",
    credentials: "include",
  });
  await respuestaAuth(res);
}

export async function guardarResultado(
  wpm: number,
  precision: number,
  segundos: number
) {
  const res = await fetch(`${API}/resultados`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ wpm, precision, segundos }),
  });
  await respuestaAuth(res);
}

export async function pedirHistorial() {
  const res = await fetch(`${API}/resultados/historial`, {
    credentials: "include",
  });
  return (await respuestaAuth<{
    id: number;
    wpm: number;
    precision: number;
    segundos: number;
    creado_en: string;
  }[]>(res));
}

export async function pedirRanking() {
  const res = await fetch(`${API}/resultados/ranking`);
  return await respuestaAuth<{
    nombre: string;
    mejor_wpm: number;
  }[]>(res);
}
