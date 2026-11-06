import type { CSSProperties } from "react";

const FILAS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", "ñ"],
  ["z", "x", "c", "v", "b", "n", "m", ",", "."],
];

const REPARTO: Record<string, string> = {
  mi: "qaz",
  ai: "wsx",
  ci: "edc",
  ii: "rfvtgb",
  id: "yhnujm",
  cd: "ik,",
  ad: "ol.",
  md: "pñ",
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
};

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
          <rect
            x={p.x}
            y={p.y}
            width="50"
            height={195 - p.y}
            rx="25"
            fill={color(p.izq)}
          />
          <rect
            x={700 - p.x - 50}
            y={p.y}
            width="50"
            height={195 - p.y}
            rx="25"
            fill={color(p.der)}
          />
        </g>
      ))}
      <rect x="290" y="130" width="56" height="65" rx="28" fill={color("pu")} />
      <rect x="354" y="130" width="56" height="65" rx="28" fill={color("pu")} />
    </svg>
  );
}

export default function Teclado({
  siguiente,
  activas,
}: {
  siguiente?: string;
  activas: Set<string>;
}) {
  const dedo =
    siguiente === " " ? "pu" : siguiente ? DEDO[siguiente] : undefined;

  return (
    <div className="teclado">
      {FILAS.map((fila, i) => (
        <div key={i} className={`fila-teclas fila-${i}`}>
          {fila.map((t) => (
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
          ))}
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