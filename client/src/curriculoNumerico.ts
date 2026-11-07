import type { Etapa } from "./curriculo";

// ───────────── Versión A · Teclado numérico (Numpad) ─────────────
const NP_46 = "456";
const NP_82 = NP_46 + "82";
const NP_71 = NP_82 + "71";
const NP_93 = NP_71 + "93";
const NP_0 = NP_93 + "0";
const NP_PUNTO = NP_0 + ".";
const NP_SUMA = NP_PUNTO + "+-";
const NP_TODO = NP_SUMA + "*/";

export const ETAPAS_NUMPAD: Etapa[] = [
  {
    nombre: "Tecla guía 5",
    nuevas: "5",
    teclas: "5",
    combos: "5",
    largas: true,
    ayuda:
      "Activa Bloq Num y usa el teclado numérico de la derecha. Apoya el dedo medio derecho en el 5 (tiene una rayita): es tu tecla guía. El índice queda en el 4, el anular en el 6 y el pulgar sobre el 0. Los espacios se pulsan con el pulgar izquierdo.",
  },
  {
    nombre: "4 y 6",
    nuevas: "46",
    teclas: NP_46,
    combos: NP_46,
    largas: true,
    ayuda:
      "Índice derecho en el 4 y anular derecho en el 6. Después de cada tecla, el dedo vuelve a su lugar junto al 5.",
  },
  {
    nombre: "Repaso 4 5 6",
    nuevas: "",
    teclas: NP_46,
    combos: NP_46,
    largas: true,
    ayuda: "Fila central completa: 4, 5 y 6. Sin mirar el teclado.",
  },
  {
    nombre: "8 y 2",
    nuevas: "82",
    teclas: NP_82,
    combos: NP_82,
    largas: true,
    ayuda: "El dedo medio sube al 8 y baja al 2, y siempre regresa al 5.",
  },
  {
    nombre: "7 y 1",
    nuevas: "71",
    teclas: NP_71,
    combos: NP_71,
    largas: true,
    ayuda: "El índice sube al 7 y baja al 1, y regresa al 4.",
  },
  {
    nombre: "9 y 3",
    nuevas: "93",
    teclas: NP_93,
    combos: NP_93,
    largas: true,
    ayuda: "El anular sube al 9 y baja al 3, y regresa al 6.",
  },
  {
    nombre: "Repaso 1 al 9",
    nuevas: "",
    teclas: "123456789",
    combos: "123456789",
    largas: true,
    ayuda:
      "Los nueve dígitos. Cada dedo cubre su columna y vuelve al 5 como guía.",
  },
  {
    nombre: "El 0",
    nuevas: "0",
    teclas: NP_0,
    combos: NP_0,
    largas: true,
    ayuda:
      "El 0 se pulsa con el pulgar derecho. Los demás dedos no se mueven de la fila central.",
  },
  {
    nombre: "Punto decimal",
    etiqueta: "Decimales",
    nuevas: "",
    teclas: NP_PUNTO,
    combos: "",
    ayuda:
      "El punto está a la derecha del 0 y lo pulsa el anular derecho, el mismo dedo del 6, el 9 y el 3.",
    palabras: [
      "3.14", "0.5", "12.50", "7.25", "100.75", "9.99", "45.60", "8.05",
      "2.5", "36.6", "0.75", "19.95", "5.5", "60.25", "14.30", "0.99",
      "27.45", "81.2", "6.75", "53.08", "4.04", "10.5", "72.9", "1.25",
    ],
  },
  {
    nombre: "Suma y resta",
    etiqueta: "Operaciones",
    nuevas: "+-",
    teclas: NP_SUMA,
    combos: "",
    ayuda:
      "El meñique derecho pulsa + y -. Estira desde la columna del 6 y regresa. Escribe cada operación sin espacios.",
    palabras: [
      "5+3", "12-4", "7+8", "9-2", "10+25", "48-16", "3+6+9", "100-35",
      "14+27", "63-18", "8+15", "90-45", "21+34", "56-29", "7+7+7", "150-75",
      "33+66", "84-39", "18+42", "120-60", "4+9-3", "25+50-15", "72-8+6",
      "11+22-5",
    ],
  },
  {
    nombre: "Multiplicar y dividir",
    etiqueta: "Operaciones",
    nuevas: "*/",
    teclas: NP_TODO,
    combos: "",
    ayuda:
      "El dedo medio pulsa / y el anular pulsa *. Están en la fila superior del pad: sube desde el 8 y el 9.",
    palabras: [
      "6*7", "8/2", "9*9", "48/6", "12*5", "100/4", "3*15", "72/8", "25*4",
      "81/9", "7*8", "64/8", "11*11", "90/3", "5*20", "56/7", "13*4",
      "144/12", "9*6", "200/5", "2*45", "36/4", "15*6", "99/9",
    ],
  },
  {
    nombre: "Cuentas mixtas",
    etiqueta: "Cuentas",
    nuevas: "",
    teclas: NP_TODO,
    combos: "",
    ayuda: "Mezcla las cuatro operaciones. Mantén el ritmo y la mirada fuera del teclado.",
    palabras: [
      "12+8-5", "3*4+2", "100/5-3", "7*8-6", "45+15/3", "9*9-1", "20/4+7",
      "6*5+10", "81/9*2", "14-2*3", "50+25*2", "8*8/4", "36/6+4", "7+3*9",
      "60-12/4", "2*3*4", "15+15-10", "9*7+3", "40/8*5", "18+6/3", "25-5*4",
      "30/5+20", "11*3-3", "64/8-2",
    ],
  },
  {
    nombre: "Números reales",
    etiqueta: "Números",
    nuevas: "",
    teclas: NP_TODO,
    combos: "",
    ayuda: "Precios, cantidades y medidas, como en una hoja de cálculo.",
    palabras: [
      "1250", "30.5", "7842", "10.99", "2048", "365", "9.75", "1999", "58.20",
      "4096", "12500", "0.05", "3600", "24.99", "8760", "15.75", "512",
      "99.90", "2500", "7.50", "1024", "49.95", "86400", "6.25",
    ],
  },
  {
    nombre: "Fechas y teléfonos",
    etiqueta: "Códigos",
    nuevas: "",
    teclas: NP_TODO,
    combos: "",
    ayuda: "Fechas y números de teléfono: el guion lo pulsa el meñique derecho.",
    palabras: [
      "555-0123", "555-0148", "555-0199", "555-0177", "07-11-2026",
      "15-03-2025", "31-12-2024", "01-01-2027", "555-0162", "555-0134",
      "22-09-2025", "18-06-2026", "555-0108", "555-0155", "24-08-2025",
      "09-04-2027",
    ],
  },
  {
    nombre: "Examen final",
    etiqueta: "Examen",
    nuevas: "",
    teclas: NP_TODO,
    combos: "",
    ayuda:
      "Mezcla todo lo aprendido: dígitos, punto y operaciones. Prioriza la precisión sobre la velocidad.",
    textos: [
      "12+8 45-17 6*7 81/9 3.50 99.99 250 1024 7+14 63/7",
      "150-75 8*12 144/12 0.75 18.25 500 2048 36+64 9*9 100-1",
      "3.14 2.71 1.41 365 8760 25*4 90/3 17+23 60-45 4096",
      "555-0123 07-11-2026 12.50 99*3 48/6 1000-250 7+8+9 5*5*5 33.3 2026",
    ],
  },
];

// ───────────── Versión B · Fila superior numérica (1 al 0) ─────────────
const NF_47 = "47";
const NF_56 = NF_47 + "56";
const NF_38 = NF_56 + "38";
const NF_29 = NF_38 + "29";
const NF_10 = NF_29 + "10";
const NF_TODO = "1234567890";

export const ETAPAS_FILA: Etapa[] = [
  {
    nombre: "4 y 7",
    nuevas: "47",
    teclas: NF_47,
    combos: NF_47,
    largas: true,
    ayuda:
      "Los índices suben desde la fila base: el izquierdo de la F al 4 y el derecho de la J al 7. Después de cada número, vuelven a la F y a la J. Los pulgares quedan sobre la barra espaciadora.",
  },
  {
    nombre: "5 y 6",
    nuevas: "56",
    teclas: NF_56,
    combos: NF_56,
    largas: true,
    ayuda:
      "Los índices también alcanzan una tecla más hacia el centro: el izquierdo al 5 (sobre la T y la G) y el derecho al 6 (sobre la Y y la H). Regresa siempre a la F y a la J.",
  },
  {
    nombre: "Repaso 4 5 6 7",
    nuevas: "",
    teclas: "4567",
    combos: "4567",
    largas: true,
    ayuda: "Los cuatro números de los índices. Sin mirar el teclado.",
  },
  {
    nombre: "3 y 8",
    nuevas: "38",
    teclas: NF_38,
    combos: NF_38,
    largas: true,
    ayuda:
      "Dedos medios: el izquierdo sube de la D al 3 y el derecho de la K al 8, y vuelven a la fila base.",
  },
  {
    nombre: "2 y 9",
    nuevas: "29",
    teclas: NF_29,
    combos: NF_29,
    largas: true,
    ayuda:
      "Dedos anulares: el izquierdo sube de la S al 2 y el derecho de la L al 9, y vuelven a la fila base.",
  },
  {
    nombre: "1 y 0",
    nuevas: "10",
    teclas: NF_10,
    combos: NF_10,
    largas: true,
    ayuda:
      "Dedos meñiques: el izquierdo sube de la A al 1 y el derecho de la Ñ al 0. Son los números más lejanos: estira con calma y regresa.",
  },
  {
    nombre: "Repaso 1 al 0",
    nuevas: "",
    teclas: NF_TODO,
    combos: NF_TODO,
    largas: true,
    ayuda: "Toda la fila numérica. Cada dedo sube a su número y regresa a la base.",
  },
  {
    nombre: "Secuencias",
    etiqueta: "Secuencias",
    nuevas: "",
    teclas: NF_TODO,
    combos: "",
    ayuda: "Secuencias numéricas. Cada dedo sube a su número y regresa a la fila base.",
    palabras: [
      "1234567890", "0987654321", "13579", "24680", "12345", "67890", "54321",
      "09876", "1357924680", "2468013579", "1029384756", "5647382910", "1212",
      "3434", "5656", "7878", "9090", "1470", "2580", "3690", "14725836",
      "19283746", "10293847", "11223344",
    ],
  },
  {
    nombre: "Números reales",
    etiqueta: "Números",
    nuevas: "",
    teclas: NF_TODO,
    combos: "",
    ayuda: "Años, cantidades y medidas escritos con la fila numérica.",
    palabras: [
      "2026", "1984", "365", "1500", "2048", "1999", "750", "3600", "4096",
      "8760", "2025", "1200", "500", "9999", "1010", "2468", "1357", "5050",
      "7777", "1000", "12500", "86400", "31415", "2718",
    ],
  },
  {
    nombre: "Fechas y teléfonos",
    etiqueta: "Códigos",
    nuevas: "",
    teclas: NF_TODO,
    combos: "",
    ayuda: "Teléfonos y fechas escritos solo con dígitos.",
    palabras: [
      "5550123", "5550148", "5550199", "5550177", "07112026", "15032025",
      "31122024", "01012027", "5550162", "5550134", "22092025", "18062026",
      "5550108", "5550155", "24082025", "09042027",
    ],
  },
  {
    nombre: "Examen final",
    etiqueta: "Examen",
    nuevas: "",
    teclas: NF_TODO,
    combos: "",
    ayuda:
      "Mezcla toda la fila numérica. Prioriza la precisión sobre la velocidad.",
    textos: [
      "2026 1984 365 1500 2048 1999 750 3600 4096 8760",
      "1234567890 0987654321 13579 24680 5550123 07112026",
      "3141 2718 1618 1414 1732 2236 12500 86400 9999 1010",
      "5550148 15032025 4096 2468 1357 9090 3690 2580 1470 2026",
    ],
  },
];