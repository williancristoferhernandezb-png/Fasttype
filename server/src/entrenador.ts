import { Router } from "express";
import { verificarToken, type PeticionAutenticada } from "./verificarToken";
import { pool } from "./db";

export const entrenadorRouter = Router();

const CATEGORIAS_VALIDAS = new Set(["letras", "puntuacion", "numeros", "operaciones"]);

entrenadorRouter.post("/texto", verificarToken, async (req: PeticionAutenticada, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(503).json({ error: "El entrenador IA todavía no está configurado en el servidor." });
      return;
    }

    const categorias = req.body?.categorias;
    const longitud = Number(req.body?.longitud ?? 700);

    if (
      !Array.isArray(categorias) ||
      categorias.length < 1 ||
      categorias.length > 4 ||
      categorias.some((c: unknown) => typeof c !== "string" || !CATEGORIAS_VALIDAS.has(c)) ||
      !Number.isInteger(longitud) ||
      longitud < 250 ||
      longitud > 1800
    ) {
      res.status(400).json({ error: "La configuración del ejercicio no es válida." });
      return;
    }

    // Las debilidades se obtienen directamente de las estadísticas guardadas del usuario autenticado.
    const resultadoTeclas = await pool.query(
      `SELECT etiqueta, aciertos, intentos,
              ROUND(aciertos * 100.0 / NULLIF(intentos, 0))::int AS precision
       FROM confianza_teclas_v2
       WHERE usuario_id = $1 AND intentos >= 10
       ORDER BY (aciertos * 100.0 / NULLIF(intentos, 0)) ASC, intentos DESC
       LIMIT 8`,
      [req.usuario!.id]
    );
    const teclasDebiles = resultadoTeclas.rows
      .filter((t: any) => Number(t.precision) < 90)
      .map((t: any) => ({ etiqueta: String(t.etiqueta).slice(0, 4), precision: Number(t.precision), intentos: Number(t.intentos) }));

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
        ? "Refuerza de manera natural estas teclas débiles, sin crear secuencias artificiales y solo cuando correspondan a las categorías seleccionadas: " + teclasDebiles.map((t: any) => t.etiqueta + " (" + t.precision + "% de precisión en " + t.intentos + " intentos)").join(", ") + "."
        : "No se proporcionaron teclas con una muestra suficiente de dificultad; prioriza un texto equilibrado.",
      "Longitud aproximada: " + longitud + " caracteres.",
      "Cambia el tema y la redacción respecto a ejercicios típicos; evita repetir frases genéricas."
    ].filter(Boolean).join("\n");

    const modelo = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
    const respuesta = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`,
      {
        method: "POST",
        headers: {
          "x-goog-api-key": apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: instrucciones }] },
          contents: [{ role: "user", parts: [{ text: "Genera el siguiente ejercicio de mecanografía." }] }],
          generationConfig: {
            maxOutputTokens: 700,
            temperature: 0.9
          }
        }),
        signal: AbortSignal.timeout(30000)
      }
    );

    const datos: any = await respuesta.json().catch(() => ({}));
    if (!respuesta.ok) {
      console.error("Error de Gemini:", respuesta.status, datos?.error?.message ?? "sin detalle");
      res.status(502).json({ error: "No se pudo generar el texto inteligente." });
      return;
    }

    const texto = (datos.candidates?.[0]?.content?.parts ?? [])
      .filter((parte: any) => typeof parte.text === "string")
      .map((parte: any) => parte.text)
      .join("\n")
      .trim();

    if (!texto || texto.length < 80) {
      console.error("Gemini no devolvió texto utilizable:", datos.candidates?.[0]?.finishReason ?? "respuesta vacía");
      res.status(502).json({ error: "La IA no devolvió un ejercicio suficientemente largo." });
      return;
    }

    res.json({ texto: texto.slice(0, 4000) });
  } catch (error) {
    console.error("Error generando ejercicio inteligente:", error);
    res.status(500).json({ error: "Ocurrió un error al generar el ejercicio." });
  }
});
