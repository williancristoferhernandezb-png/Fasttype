export interface Leccion {
  id: number;
  etapa: string;
  titulo: string;
  instruccion: string;
  texto: string;
}

interface Etapa {
  nombre: string;
  nuevas: string;
  teclas: string;
  combos: string;
  ayuda: string;
  largas?: boolean;
  palabras?: string[];
  textos?: string[];
}

const BASE = "asdfjklñ";
const T_GH = BASE + "gh";
const T_EI = T_GH + "ei";
const T_RU = T_EI + "ru";
const T_TY = T_RU + "ty";
const T_WO = T_TY + "wo";
const T_QP = T_WO + "qp";
const T_VM = T_QP + "vm";
const T_BN = T_VM + "bn";
const T_C = T_BN + "c,";
const T_X = T_C + "x.";
const T_Z = T_X + "z";

const conSigno = (lista: string[], signo: string) =>
  lista.map((p, i) => (i % 3 === 2 ? p + signo : p));

const ETAPAS: Etapa[] = [
  {
    nombre: "F y J",
    nuevas: "fj",
    teclas: "fj",
    combos: "fj",
    largas: true,
    ayuda:
      "Pon el índice izquierdo en la F y el derecho en la J (tienen una rayita). Los pulgares van sobre la barra espaciadora: púlsala con el pulgar entre grupos.",
  },
  {
    nombre: "D y K",
    nuevas: "dk",
    teclas: "dk",
    combos: "dk",
    largas: true,
    ayuda:
      "Dedos medios: D con el izquierdo y K con el derecho. Después de cada tecla, el dedo vuelve a su lugar.",
  },
  {
    nombre: "S y L",
    nuevas: "sl",
    teclas: "sl",
    combos: "sl",
    largas: true,
    ayuda: "Dedos anulares: S con el izquierdo y L con el derecho.",
  },
  {
    nombre: "A y Ñ",
    nuevas: "añ",
    teclas: "añ",
    combos: "añ",
    largas: true,
    ayuda: "Dedos meñiques: A con el izquierdo y Ñ con el derecho.",
  },
  {
    nombre: "Repaso D F J K",
    nuevas: "",
    teclas: "dfjk",
    combos: "dfjk",
    largas: true,
    ayuda: "Mezcla índices y medios. Los dedos vuelven siempre a la fila base.",
  },
  {
    nombre: "Repaso S D F J K L",
    nuevas: "",
    teclas: "sdfjkl",
    combos: "sdfjkl",
    largas: true,
    ayuda: "Ahora se suman los anulares. Sin mirar el teclado.",
  },
  {
    nombre: "Fila base completa",
    nuevas: "",
    teclas: BASE,
    combos: BASE,
    largas: true,
    ayuda: "Las ocho teclas de la fila base. Después, tus primeras palabras reales.",
    palabras: [
      "sala", "jala", "falsa", "falda", "salsa", "alas", "asa", "dalas",
      "sal", "las", "ala", "faja", "fajas", "jalas", "salas", "saña",
      "daña", "jajaja",
    ],
  },
  {
    nombre: "G y H",
    nuevas: "gh",
    teclas: T_GH,
    combos: "dfghjk",
    ayuda:
      "G la pulsa el índice izquierdo y H el índice derecho. Estiran un poco hacia el centro y vuelven a la fila base.",
    palabras: [
      "gafas", "gala", "galas", "alga", "algas", "haga", "hagas", "hada",
      "hadas", "halla", "falla", "fallas", "salga", "saga", "sagas", "gasa",
      "daga", "dagas", "llaga", "hala", "halagas", "jaja",
    ],
  },
  {
    nombre: "E e I",
    nuevas: "ei",
    teclas: T_EI,
    combos: "fdeijk",
    ayuda:
      "Fila superior: E con el dedo medio izquierdo e I con el medio derecho. Sube y vuelve a la fila base.",
    palabras: [
      "ese", "esa", "ella", "ellas", "seda", "sale", "dale", "dile", "jefe",
      "jefa", "fiel", "hijas", "liga", "ligas", "silla", "sillas", "idea",
      "ideas", "eje", "ejes", "leña", "seña", "señas", "diseña",
    ],
  },
  {
    nombre: "R y U",
    nuevas: "ru",
    teclas: T_RU,
    combos: "fdrujk",
    ayuda: "R con el índice izquierdo y U con el índice derecho.",
    palabras: [
      "sur", "usa", "usas", "usar", "ruda", "rueda", "ruedas", "reja",
      "rejas", "jugar", "lugar", "lugares", "regalar", "alegre", "guarda",
      "guardas", "sudar", "salud", "duda", "dura", "aguja", "agujas",
      "gruesa", "fuera",
    ],
  },
  {
    nombre: "T e Y",
    nuevas: "ty",
    teclas: T_TY,
    combos: "ftgyhj",
    ayuda:
      "T con el índice izquierdo e Y con el índice derecho. Son las más alejadas: estira el dedo y regresa.",
    palabras: [
      "tela", "tarde", "hasta", "estar", "gusta", "fiesta", "siesta",
      "tijeras", "yegua", "yate", "hay", "ley", "leyes", "rey", "reyes",
      "ayer", "justa", "gritas", "ruta", "rutas", "salta", "alerta",
      "fuerte", "dueña",
    ],
  },
  {
    nombre: "W y O",
    nuevas: "wo",
    teclas: T_WO,
    combos: "swolkd",
    ayuda: "W con el anular izquierdo y O con el anular derecho.",
    palabras: [
      "todo", "toda", "solo", "ojo", "hola", "foto", "gato", "dedo", "lado",
      "algo", "gorro", "juego", "regalo", "estoy", "ahora", "otro", "tarea",
      "oreja", "diseño", "sueño", "año", "años", "wifi", "show",
    ],
  },
  {
    nombre: "Q y P",
    nuevas: "qp",
    teclas: T_QP,
    combos: "qpasñl",
    ayuda: "Q con el meñique izquierdo y P con el meñique derecho.",
    palabras: [
      "queso", "quiero", "parque", "papa", "pelo", "pelota", "pato",
      "puerta", "paso", "pie", "pila", "plato", "playa", "papel", "perro",
      "sopa", "tapa", "pequeño", "esquiar", "equipo", "quieres", "poder",
      "pedir", "puedo",
    ],
  },
  {
    nombre: "Repaso fila superior",
    nuevas: "",
    teclas: "qwertyuiop",
    combos: "qwertyuiop",
    largas: true,
    ayuda: "Toda la fila superior. Cada dedo sube a su tecla y regresa a la base.",
  },
  {
    nombre: "Filas base y superior",
    nuevas: "",
    teclas: T_QP,
    combos: T_QP,
    ayuda: "Palabras que usan las dos filas.",
    palabras: [
      "queso", "parque", "puerta", "equipo", "pequeño", "esquiar", "tarea",
      "oreja", "fuerte", "juego", "regalo", "jugar", "lugar", "guarda",
      "hasta", "siesta", "tijeras", "yegua", "salud", "alegre", "pelota",
      "playa", "diseño", "papel",
    ],
  },
  {
    nombre: "V y M",
    nuevas: "vm",
    teclas: T_VM,
    combos: "fvjmdk",
    ayuda:
      "Fila inferior: V con el índice izquierdo y M con el índice derecho. Bajan y regresan a la base.",
    palabras: [
      "vamos", "mesa", "moda", "mira", "mapa", "mar", "viaje", "viejo",
      "vive", "vida", "ver", "vale", "valor", "vuelo", "amor", "tema",
      "metro", "premio", "sumar", "mujer", "madre", "volver", "llave",
      "lluvia",
    ],
  },
  {
    nombre: "B y N",
    nuevas: "bn",
    teclas: T_BN,
    combos: "fgbhnj",
    ayuda: "B con el índice izquierdo y N con el índice derecho.",
    palabras: [
      "bien", "bola", "nube", "nuevo", "nada", "uno", "mano", "baño",
      "beber", "bueno", "nieve", "nombre", "norte", "bandera", "beso",
      "libro", "libre", "ventana", "viento", "invierno", "tiempo", "mundo",
      "mañana", "montaña",
    ],
  },
  {
    nombre: "C y coma",
    nuevas: "c,",
    teclas: T_C,
    combos: "dkc,",
    ayuda:
      "C con el dedo medio izquierdo y la coma con el medio derecho. Las comas van pegadas a la palabra.",
    palabras: conSigno(
      [
        "casa", "cosa", "cama", "carro", "campo", "cuando", "como", "claro",
        "cerca", "color", "comer", "correr", "calle", "cielo", "cuerpo",
        "escuela", "teclado", "coche", "copa", "cuerda", "crece", "cada",
        "cine", "cebolla",
      ],
      ","
    ),
  },
  {
    nombre: "X y punto",
    nuevas: "x.",
    teclas: T_X,
    combos: "sxl.",
    ayuda: "X con el anular izquierdo y el punto con el anular derecho.",
    palabras: conSigno(
      [
        "examen", "exacto", "texto", "extra", "taxi", "experto", "explica",
        "exponer", "extranjero", "excelente", "boxeo", "sexto", "expreso",
        "excusa", "exterior", "relax", "flexible", "pixel",
      ],
      "."
    ),
  },
  {
    nombre: "Z",
    nuevas: "z",
    teclas: T_Z,
    combos: "zaqs",
    ayuda: "Z con el meñique izquierdo. Es la tecla más difícil: ve con calma.",
    palabras: [
      "zapato", "zorro", "azul", "luz", "voz", "paz", "pez", "vez", "feliz",
      "cruz", "zona", "empezar", "cabeza", "mezcla", "comenzar", "plaza",
      "pizza", "taza", "lazo", "zumo", "gozar",
    ],
  },
  {
    nombre: "Repaso fila inferior",
    nuevas: "",
    teclas: "zxcvbnm,.",
    combos: "zxcvbnm,.",
    largas: true,
    ayuda: "Toda la fila inferior, con coma y punto.",
  },
  {
    nombre: "Todo el teclado",
    nuevas: "",
    teclas: T_Z,
    combos: "",
    ayuda: "Palabras largas que usan las tres filas.",
    palabras: [
      "computador", "teclado", "escuela", "montaña", "mañana", "invierno",
      "ventana", "lluvia", "examen", "excelente", "pizza", "empezar",
      "comenzar", "escribir", "extranjero", "explica", "nombre", "mujeres",
      "tomate", "volver", "pequeño", "esquiar", "equipo", "practicar",
    ],
  },
  {
    nombre: "Frases completas",
    nuevas: "",
    teclas: T_Z,
    combos: "",
    ayuda: "Frases completas con coma y punto. Prioriza la precisión sobre la velocidad.",
    textos: [
      "la luna sale por la noche, y el sol sale por la mañana.",
      "me gusta aprender cosas nuevas cada semana, y practico con mucha calma.",
      "el perro corre por el parque, y el gato duerme en la casa.",
      "con paciencia y mucho esfuerzo, todo se puede lograr.",
      "escribir sin mirar el teclado requiere constancia, calma y buena postura.",
      "el equipo trabaja junto para resolver cada problema con mucha calma.",
    ],
  },
];

function azar(semilla: number) {
  let s = semilla;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function elegir<T>(lista: T[], rnd: () => number): T {
  return lista[Math.floor(rnd() * lista.length)];
}

function basico(nuevas: string[]) {
  const partes = nuevas.map((k) =>
    [k, k + k, k + k + k, k + k, k + k + k + k, k].join(" ")
  );
  if (nuevas.length > 1) {
    const [a, b] = nuevas;
    partes.push([a + b, b + a, a + b, b + a, a + b + a, b + a + b].join(" "));
  }
  return partes.join(" ");
}

function grupo(teclas: string[], nuevas: string[], rnd: () => number) {
  const tipo = rnd();
  let g = "";
  if (tipo < 0.25) {
    const k = elegir(nuevas.length ? nuevas : teclas, rnd);
    g = k.repeat(2 + Math.floor(rnd() * 4));
  } else if (tipo < 0.5 && teclas.length > 1) {
    const a = elegir(teclas, rnd);
    let b = elegir(teclas, rnd);
    if (b === a) b = teclas[(teclas.indexOf(a) + 1) % teclas.length];
    const largo = 3 + Math.floor(rnd() * 3);
    for (let i = 0; i < largo; i++) g += i % 2 === 0 ? a : b;
  } else {
    const largo = 2 + Math.floor(rnd() * 3);
    for (let i = 0; i < largo; i++) g += elegir(teclas, rnd);
  }
  if (nuevas.length && !nuevas.some((n) => g.includes(n))) {
    const pos = Math.floor(rnd() * g.length);
    g = g.slice(0, pos) + elegir(nuevas, rnd) + g.slice(pos + 1);
  }
  return g;
}

function validas(palabras: string[], teclas: string) {
  return palabras.filter((p) => [...p].every((c) => teclas.includes(c)));
}

function construir(): Leccion[] {
  const lista: Leccion[] = [];
  let semilla = 1;

  const agregar = (
    etapa: string,
    titulo: string,
    instruccion: string,
    texto: string
  ) => {
    lista.push({ id: lista.length + 1, etapa, titulo, instruccion, texto });
  };

  ETAPAS.forEach((e) => {
    const nuevas = [...e.nuevas];
    const combos = [...e.combos];

    if (nuevas.length) {
      agregar(
        e.nombre,
        "Conoce las teclas " + nuevas.join(" ").toUpperCase(),
        e.ayuda,
        basico(nuevas)
      );
    }

    if (combos.length) {
      const veces = e.largas ? 2 : 1;
      for (let v = 0; v < veces; v++) {
        const rnd = azar(semilla++);
        const texto = Array.from({ length: 14 + v * 2 }, () =>
          grupo(combos, nuevas, rnd)
        ).join(" ");
        agregar(
          e.nombre,
          (nuevas.length ? "Combinaciones " : "Repaso ") + (v + 1),
          nuevas.length
            ? "Combina las teclas nuevas. Después de cada tecla, el dedo vuelve a su posición base."
            : e.ayuda,
          texto
        );
      }
    }

    const pal = validas(e.palabras ?? [], e.teclas);
    if (pal.length) {
      const n = Math.ceil(pal.length / 8);
      const tam = Math.ceil(pal.length / n);
      for (let i = 0; i < n; i++) {
        agregar(
          e.nombre,
          `Palabras ${i + 1}`,
          "Ahora escribes palabras reales. No mires el teclado.",
          pal.slice(i * tam, (i + 1) * tam).join(" ")
        );
      }
    }

    e.textos?.forEach((t, i) => agregar(e.nombre, `Frase ${i + 1}`, e.ayuda, t));
  });

  return lista;
}

export const LECCIONES: Leccion[] = construir();