const API = "http://localhost:3000/api";

export function obtenerToken() {
  return localStorage.getItem("token");
}

export function obtenerNombre() {
  return localStorage.getItem("nombre");
}

export function cerrarSesion() {
  localStorage.removeItem("token");
  localStorage.removeItem("nombre");
}

async function enviar(ruta: string, nombre: string, contrasena: string) {
  const res = await fetch(`${API}/auth/${ruta}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, contrasena }),
  });
  const datos = await res.json();
  if (!res.ok) throw new Error(datos.error ?? "Error desconocido");
  return datos;
}

export async function entrar(
  modo: "login" | "registro",
  nombre: string,
  contrasena: string
) {
  if (modo === "registro") {
    await enviar("registro", nombre, contrasena);
  }
  const datos = await enviar("login", nombre, contrasena);
  localStorage.setItem("token", datos.token);
  localStorage.setItem("nombre", datos.nombre);
  return datos.nombre as string;
}

export async function guardarResultado(
  wpm: number,
  precision: number,
  segundos: number
) {
  const res = await fetch(`${API}/resultados`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${obtenerToken()}`,
    },
    body: JSON.stringify({ wpm, precision, segundos }),
  });
  if (!res.ok) throw new Error("No se pudo guardar el resultado");
}

export async function pedirHistorial() {
  const res = await fetch(`${API}/resultados/historial`, {
    headers: { Authorization: `Bearer ${obtenerToken()}` },
  });
  return (await res.json()) as {
    id: number;
    wpm: number;
    precision: number;
    segundos: number;
    creado_en: string;
  }[];
}

export async function pedirRanking() {
  const res = await fetch(`${API}/resultados/ranking`);
  return (await res.json()) as { nombre: string; mejor_wpm: number }[];
}