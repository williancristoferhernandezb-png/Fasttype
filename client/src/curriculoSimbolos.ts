import type { Etapa } from "./curriculo";

// Curso independiente de símbolos para distribución física US.
// El orden introduce cada grupo y después lo mezcla con lo ya aprendido.
const ACUMULADO_1 = "[]";
const ACUMULADO_2 = ACUMULADO_1 + "{}";
const ACUMULADO_3 = ACUMULADO_2 + "()";
const ACUMULADO_4 = ACUMULADO_3 + "\"'";
const ACUMULADO_5 = ACUMULADO_4 + ";:";
const ACUMULADO_6 = ACUMULADO_5 + "/\\";
const ACUMULADO_7 = ACUMULADO_6 + "?!";
const ACUMULADO_8 = ACUMULADO_7 + "@#$%";
const ACUMULADO_9 = ACUMULADO_8 + "&*";
const ACUMULADO_10 = ACUMULADO_9 + "+-=";
const ACUMULADO_TODO = ACUMULADO_10 + "<>";

export const ETAPAS_SIMBOLOS: Etapa[] = [
  {
    nombre: "Corchetes",
    distribucionUS: true,
    nuevas: "[]",
    teclas: ACUMULADO_1,
    combos: ACUMULADO_1,
    largas: true,
    ayuda: "En el teclado US, [ y ] están a la derecha de P. Practica primero cada tecla y luego alterna ambos corchetes.",
  },
  {
    nombre: "Llaves",
    distribucionUS: true,
    nuevas: "{}",
    teclas: ACUMULADO_2,
    combos: ACUMULADO_2,
    largas: true,
    ayuda: "Las llaves { y } se escriben con Shift + [ y Shift + ]. Mantén Shift mientras pulsas la tecla correspondiente.",
  },
  {
    nombre: "Paréntesis",
    distribucionUS: true,
    nuevas: "()",
    teclas: ACUMULADO_3,
    combos: ACUMULADO_3,
    largas: true,
    ayuda: "Los paréntesis se escriben con Shift + 9 para ( y Shift + 0 para ).",
  },
  {
    nombre: "Comillas",
    distribucionUS: true,
    nuevas: "\"'",
    teclas: ACUMULADO_4,
    combos: ACUMULADO_4,
    largas: true,
    ayuda: "La comilla simple ' y la doble \" comparten la tecla situada junto a Enter. Usa Shift para escribir la comilla doble.",
  },
  {
    nombre: "Punto y coma",
    distribucionUS: true,
    nuevas: ";:",
    teclas: ACUMULADO_5,
    combos: ACUMULADO_5,
    largas: true,
    ayuda: "El punto y coma ; y los dos puntos : están a la derecha de L. Los dos puntos requieren Shift.",
  },
  {
    nombre: "Barra y barra invertida",
    distribucionUS: true,
    nuevas: "/\\",
    teclas: ACUMULADO_6,
    combos: ACUMULADO_6,
    largas: true,
    ayuda: "Practica la barra / y la barra invertida \\. En el teclado US, la barra está junto a Shift derecho y la barra invertida encima de Enter.",
  },
  {
    nombre: "Interrogación y exclamación",
    distribucionUS: true,
    nuevas: "?!",
    teclas: ACUMULADO_7,
    combos: ACUMULADO_7,
    largas: true,
    ayuda: "La interrogación ? se escribe con Shift + / y la exclamación ! con Shift + 1.",
  },
  {
    nombre: "Arroba, numeral y moneda",
    distribucionUS: true,
    nuevas: "@#$%",
    teclas: ACUMULADO_8,
    combos: ACUMULADO_8,
    largas: true,
    ayuda: "Estos símbolos usan Shift junto con las teclas numéricas 2, 3, 4 y 5: @ # $ %.",
  },
  {
    nombre: "Ampersand y asterisco",
    distribucionUS: true,
    nuevas: "&*",
    teclas: ACUMULADO_9,
    combos: ACUMULADO_9,
    largas: true,
    ayuda: "El ampersand & se escribe con Shift + 7 y el asterisco * con Shift + 8.",
  },
  {
    nombre: "Operadores",
    distribucionUS: true,
    nuevas: "+-=",
    teclas: ACUMULADO_10,
    combos: ACUMULADO_10,
    largas: true,
    ayuda: "Practica más, menos e igual. En el teclado US, + requiere Shift + =.",
  },
  {
    nombre: "Menor y mayor que",
    distribucionUS: true,
    nuevas: "<>",
    teclas: ACUMULADO_TODO,
    combos: ACUMULADO_TODO,
    largas: true,
    ayuda: "Los signos < y > se escriben con Shift + coma y Shift + punto, respectivamente.",
  },
  {
    nombre: "Repaso de todos los símbolos",
    distribucionUS: true,
    nuevas: "",
    teclas: ACUMULADO_TODO,
    combos: ACUMULADO_TODO,
    largas: true,
    ayuda: "Combina todos los símbolos aprendidos. Prioriza la precisión y recuerda usar Shift cuando corresponda.",
  },
];
