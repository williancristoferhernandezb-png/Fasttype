import { Router } from "express";
import { verificarToken, type PeticionAutenticada } from "./verificarToken";

export const entrenadorRouter = Router();

const CATEGORIAS_VALIDAS = new Set(["letras", "puntuacion", "numeros", "operaciones"]);

entrenadorRouter.post("/texto", verificarToken, async (req: PeticionAutenticada, res) => {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      res.status(503).json({ error: "El entrenador IA todavía no está configurado en el servidor." });
      return;
    }

    const categorias = req.body?.categorias;
    const teclas = req.body?.teclas;
    const longitud = Number(req.body?.longitud ?? 700);

    if (
      !Array.isArray(categorias) ||
      categorias.length < 1 ||
      categorias.length > 4 ||
      categorias.some((c: unknown) => typeof c !== "string" || !CATEGORIAS_VALIDAS.has(c)) ||
      !Number.isInteger(longitud) ||
      longitud < 250 ||
      longitud > 1800 ||
      !Array.isArray(teclas) ||
      teclas.length > 8
    ) {
      res.status(400).json({ error: "La configuración del ejercicio no es válida." });
      return;
    }

    const teclasDebiles = teclas
      .filter((t: any) =>
        typeof t?.etiqueta === "string" &&
        Number.isInteger(t?.precision) &&
        Number.isInteger(t?.intentos) &&
        t.intentos >= 10 &&
        t.precision >= 0 &&
        t.precision < 90
      )
      .slice(0, 8)
      .map((t: any) => ({ etiqueta: t.etiqueta.slice(0, 4), precision: t.precision, intentos: t.intentos }));

    const nombres: Record<string, string> = {
      letras: "letras y palabras",
      puntuacion: "letras con signos de puntuación",
      numeros: "dígitos y secuencias numéricas",
      operaciones: "operaciones matemáticas y sus símbolos"
    };

    const instrucciones = [
      "Eres el generador de ejercicios de mecanografía de Fasttype.",
      "Escribe un único texto de práctica en español, natural, coherente, variado y fácil de leer.",
      "Devuelve únicamente el texto, sin título, introducción, comillas, viñetas ni explicaciones.",
      "Respeta estrictamente las categorías seleccionadas: " + categorias.map((c: string) => nombres[c]).join("; ") + ".",
      categorias.includes("letras") && !categorias.includes("puntuacion")
        ? "Para la modalidad solo letras, usa letras y espacios; evita signos de puntuación y números."
        : "",
      categorias.includes("puntuacion")
        ? "Incluye signos de puntuación variados de forma natural: comas, puntos, dos puntos, punto y coma, interrogaciones y exclamaciones."
        : "",
      categorias.includes("numeros")
        ? "Incluye suficientes dígitos y grupos numéricos reales; no los sustituyas por palabras escritas."
        : "",
      categorias.includes("operaciones")
        ? "Incluye expresiones matemáticas con +, -, *, / y =, además de números."
        : "",
      teclasDebiles.length
        ? "Refuerza de manera natural estas teclas débiles, sin crear secuencias artificiales: " + teclasDebiles.map((t: any) => t.etiqueta + " (" + t.precision + "% de precisión en " + t.intentos + " intentos)").join(", ") + "."
        : "No se proporcionaron teclas con una muestra suficiente de dificultad; prioriza un texto equilibrado.",
      "Longitud aproximada: " + longitud + " caracteres.",
      "Cambia el tema y la redacción respecto a ejercicios típicos; evita repetir frases genéricas."
    ].filter(Boolean).join("\n");

    const respuesta = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-6-astra",
        instructions,
        input: "Genera el siguiente ejercicio de mecanografía.",
        max_output_tokens: 650
      }),
      signal: AbortSignal.timeout(30000)
    });

    const datos: any = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok) {
      console.error("Error del proveedor IA:", respuesta.status, datos?.error?.message ?? "sin detalle");
      res.status(502).json({ error: "No se pudo generar el texto inteligente." });
      return;
    }

    const texto = typeof datos.output_text === "string"
      ? datos.output_text.trim()
      : (datos.output ?? [])
          .flatMap((item: any) => item.content ?? [])
          .filter((item: any) => item.type === "output_text" && typeof item.text === "string")
          .map((item: any) => item.text)
          .join("\n")
          .trim();

    if (!texto || texto.length < 80) {
      res.status(502).json({ error: "La IA no devolvió un ejercicio suficientemente largo." });
      return;
    }

    res.json({ texto: texto.slice(0, 4000) });
  } catch (error) {
    console.error("Error generando ejercicio inteligente:", error);
    res.status(500).json({ error: "Ocurrió un error al generar el ejercicio." });
  }
});
