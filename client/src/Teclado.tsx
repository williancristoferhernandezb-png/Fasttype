import type { CSSProperties } from "react";
import type { Modo } from "./curriculo";

const FILAS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", "ñ"],
  ["z", "x", "c", "v", "b", "n", "m", ",", "."],
];

const FILA_NUM = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];

const REPARTO: Record<string, string> = {
  mi: "qaz1",
  ai: "wsx2",
  ci: "edc3",
  ii: "rfvtgb45",
  id: "yhnujm67",
  cd: "ik,8",
  ad: "ol.9",
  md: "pñ0",
};

const DEDO: Record<string, string> = {};
Object.entries(REPARTO).forEach(([dedo, teclas]) => {
  [...teclas].forEach((t) => {
    DEDO[t] = dedo;
  });
});

const NOMBRES: Record<string, string> = {
  mi: "meñique izquierdo",
  ai: "anular izquierdo",
  ci: "dedo medio izquierdo",
  ii: "índice izquierdo",
  id: "índice derecho",
  cd: "dedo medio derecho",
  ad: "anular derecho",
  md: "meñique derecho",
  pu: "pulgar",
  pi: "pulgar izquierdo",
  pd: "pulgar derecho",
};

const COLORES: Record<string, string> = {
  mi: "#f87171",
  ai: "#fb923c",
  ci: "#facc15",
  ii: "#4ade80",
  id: "#22d3ee",
  cd: "#60a5fa",
  ad: "#a78bfa",
  md: "#f472b6",
  pu: "#9ca3af",
  pi: "#9ca3af",
  pd: "#9ca3af",
};

interface TeclaNum {
  t: string; // carácter que se escribe ("" si no se puede escribir en la lección)
  etiqueta?: string;
  area: string; // grid-area: fila-inicio / col-inicio / fila-fin / col-fin
  dedo: string;
}

const TECLAS_NUM: TeclaNum[] = [
  { t: "", etiqueta: "Num", area: "1 / 1 / 2 / 2", dedo: "id" },
  { t: "/", area: "1 / 2 / 2 / 3", dedo: "cd" },
  { t: "*", area: "1 / 3 / 2 / 4", dedo: "ad" },
  { t: "-", area: "1 / 4 / 2 / 5", dedo: "md" },
  { t: "7", area: "2 / 1 / 3 / 2", dedo: "id" },
  { t: "8", area: "2 / 2 / 3 / 3", dedo: "cd" },
  { t: "9", area: "2 / 3 / 3 / 4", dedo: "ad" },
  { t: "+", area: "2 / 4 / 4 / 5", dedo: "md" },
  { t: "4", area: "3 / 1 / 4 / 2", dedo: "id" },
  { t: "5", area: "3 / 2 / 4 / 3", dedo: "cd" },
  { t: "6", area: "3 / 3 / 4 / 4", dedo: "ad" },
  { t: "1", area: "4 / 1 / 5 / 2", dedo: "id" },
  { t: "2", area: "4 / 2 / 5 / 3", dedo: "cd" },
  { t: "3", area: "4 / 3 / 5 / 4", dedo: "ad" },
  { t: "", etiqueta: "Intro", area: "4 / 4 / 6 / 5", dedo: "md" },
  { t: "0", area: "5 / 1 / 6 / 3", dedo: "pd" },
  { t: ".", area: "5 / 3 / 6 / 4", dedo: "ad" },
];

const DEDO_NUM: Record<string, string> = {};
TECLAS_NUM.forEach((k) => {
  if (k.t) DEDO_NUM[k.t] = k.dedo;
});

const PARES = [
  { izq: "mi", der: "md", x: 40, y: 95 },
  { izq: "ai", der: "ad", x: 105, y: 70 },
  { izq: "ci", der: "cd", x: 170, y: 55 },
  { izq: "ii", der: "id", x: 235, y: 70 },
];

function Manos({ dedo }: { dedo?: string }) {
  const color = (id: string) => (dedo === id ? COLORES[id] : "#2d313a");
  return (
    <svg viewBox="0 0 700 200" className="manos">
      <rect x="40" y="150" width="306" height="45" rx="22" fill="#242830" />
      <rect x="354" y="150" width="306" height="45" rx="22" fill="#242830" />
      {PARES.map((p) => (
        <g key={p.izq}>
          <rect className={dedo === p.izq ? "dedo-animado" : ""} x={p.x} y={p.y} width="50" height={195 - p.y} rx="25" fill={color(p.izq)} />
          <rect className={dedo === p.der ? "dedo-animado" : ""} x={700 - p.x - 50} y={p.y} width="50" height={195 - p.y} rx="25" fill={color(p.der)} />
        </g>
      ))}
      <rect className={dedo === "pu" ? "dedo-animado" : ""} x="290" y="130" width="56" height="65" rx="28" fill={color("pu")} />
      <rect className={dedo === "pu" ? "dedo-animado" : ""} x="354" y="130" width="56" height="65" rx="28" fill={color("pu")} />
    </svg>
  );
}

// Las medidas del viewBox (226 = 4 teclas de 52 + 3 huecos de 6) coinciden
// con la rejilla CSS de .numpad-zona, así los dedos quedan bajo su columna.
function ManoNumpad({ dedo }: { dedo?: string }) {
  const color = (id: string) => (dedo === id ? COLORES[id] : "#2d313a");
  const x = (col: number) => col * 58 + 4;
  const dedos = [
    { id: "id", col: 0, y: 40 },
    { id: "cd", col: 1, y: 18 },
    { id: "ad", col: 2, y: 40 },
    { id: "md", col: 3, y: 66 },
  ];
  return (
    <svg viewBox="0 0 226 150" className="mano-numpad">
      <rect x="0" y="108" width="226" height="40" rx="20" fill="#242830" />
      {dedos.map((d) => (
        <rect className={dedo === d.id ? "dedo-animado" : ""} key={d.id} x={x(d.col)} y={d.y} width="44" height={118 - d.y} rx="22" fill={color(d.id)} />
      ))}
      <rect className={dedo === "pd" ? "dedo-animado" : ""} x="4" y="112" width="84" height="34" rx="17" fill={color("pd")} />
    </svg>
  );
}

function TecladoNumpad({
  siguiente,
  activas,
}: {
  siguiente?: string;
  activas: Set<string>;
}) {
  const dedo =
    siguiente === " " ? "pi" : siguiente ? DEDO_NUM[siguiente] : undefined;

  return (
    <div className="teclado">
      <div className="numpad-zona">
        <div className="numpad">
          {TECLAS_NUM.map((k) => (
            <div
              key={k.area}
              className={
                "tecla" +
                (k.t === "" ? " decorativa" : activas.has(k.t) ? "" : " apagada") +
                (k.t !== "" && siguiente === k.t ? " siguiente" : "") +
                (k.t === "5" ? " marca" : "")
              }
              style={
                { gridArea: k.area, "--c": COLORES[k.dedo] } as CSSProperties
              }
            >
              {k.etiqueta ?? k.t}
            </div>
          ))}
        </div>
        <ManoNumpad dedo={dedo} />
        <div
          className={"espacio" + (siguiente === " " ? " siguiente" : "")}
          style={{ "--c": COLORES.pi } as CSSProperties}
        >
          espacio · pulgar izquierdo
        </div>
      </div>
      <p className="pista">
        {siguiente === " "
          ? "Barra espaciadora con el pulgar izquierdo"
          : dedo
          ? `Usa el ${NOMBRES[dedo]}`
          : "Lección terminada"}
      </p>
    </div>
  );
}

export default function Teclado({
  siguiente,
  activas,
  modo = "alfa",
}: {
  siguiente?: string;
  activas: Set<string>;
  modo?: Modo;
}) {
  if (modo === "numpad") {
    return <TecladoNumpad siguiente={siguiente} activas={activas} />;
  }

  const dedo =
    siguiente === " " ? "pu" : siguiente ? DEDO[siguiente] : undefined;

  const renderTecla = (t: string) => (
    <div
      key={t}
      className={
        "tecla" +
        (activas.has(t) ? "" : " apagada") +
        (siguiente === t ? " siguiente" : "") +
        (t === "f" || t === "j" ? " marca" : "")
      }
      style={{ "--c": COLORES[DEDO[t]] } as CSSProperties}
    >
      {t}
    </div>
  );

  return (
    <div className="teclado">
      {modo === "fila" && (
        <div className="fila-teclas fila-num">{FILA_NUM.map(renderTecla)}</div>
      )}
      {FILAS.map((fila, i) => (
        <div key={i} className={`fila-teclas fila-${i}`}>
          {fila.map(renderTecla)}
        </div>
      ))}
      <div className="fila-teclas">
        <div
          className={"espacio" + (siguiente === " " ? " siguiente" : "")}
          style={{ "--c": COLORES.pu } as CSSProperties}
        >
          espacio
        </div>
      </div>
      <Manos dedo={dedo} />
      <p className="pista">
        {dedo ? `Usa el ${NOMBRES[dedo]}` : "Lección terminada"}
      </p>
    </div>
  );
}