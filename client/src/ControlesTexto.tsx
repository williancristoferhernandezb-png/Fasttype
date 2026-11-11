import type { CSSProperties } from "react";

export type FuenteEscritura = "Inter" | "Lexend" | "Atkinson Hyperlegible" | "Arial";
const FUENTES: { value: FuenteEscritura; label: string }[] = [
  { value: "Inter", label: "Inter" },
  { value: "Lexend", label: "Lexend" },
  { value: "Atkinson Hyperlegible", label: "Atkinson Hyperlegible" },
  { value: "Arial", label: "Arial" },
];

export default function ControlesTexto({
  fuente, tamano, onFuente, onTamano,
}: {
  fuente: FuenteEscritura;
  tamano: number;
  onFuente: (v: FuenteEscritura) => void;
  onTamano: (v: number) => void;
}) {
  return (
    <div className="preferencias-texto" aria-label="Preferencias de escritura">
      <label className="preferencia-icono" title="Tipo de fuente">
        <span aria-hidden="true">A</span>
        <select value={fuente} onChange={(e) => onFuente(e.target.value as FuenteEscritura)} aria-label="Tipo de fuente">
          {FUENTES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
      </label>
      <label className="preferencia-icono preferencia-tamano" title={`Tamaño de letra: ${tamano}px`}>
        <span aria-hidden="true">A↕</span>
        <input type="range" min="20" max="42" step="1" value={tamano} onChange={(e) => onTamano(Number(e.target.value))} aria-label="Tamaño de letra" />
      </label>
    </div>
  );
}

export const estiloEscritura = (fuente: FuenteEscritura, tamano: number): CSSProperties => ({
  "--font-escritura": fuente === "Atkinson Hyperlegible" ? "'Atkinson Hyperlegible', sans-serif" : fuente === "Arial" ? "Arial, sans-serif" : "'" + fuente + "', sans-serif",
  "--font-size-escritura": tamano + "px",
} as CSSProperties);
