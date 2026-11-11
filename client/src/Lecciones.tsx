import { useState, useRef } from "react";
import { CURSOS, type Modo } from "./curriculo";
import Teclado from "./Teclado";

const META = 90;

type Seccion = "alfa" | "numerica";
type Variante = "numpad" | "fila";

const CLAVE_PROGRESO: Record<Modo, string> = {
  alfa: "progreso2",
  numpad: "progreso_numpad",
  fila: "progreso_fila",
};

const DESCRIPCION: Record<Modo, string> = {
  alfa: "Letras del teclado: fila base, superior e inferior, palabras y frases.",
  numpad: "Teclado numérico lateral con la técnica de 5 dedos. Tecla guía: el 5.",
  fila: "Números del 1 al 0 de la fila superior, con los dedos de ambas manos desde la fila base.",
};

function leerProgreso(modo: Modo, usuario: string) {
  try {
    return Number(localStorage.getItem(`${CLAVE_PROGRESO[modo]}_${usuario}`)) || 0;
  } catch {
    return 0;
  }
}

function guardar(clave: string, valor: string) {
  try {
    localStorage.setItem(clave, valor);
  } catch {
    // Si el navegador no deja guardar, seguimos sin guardar.
  }
}

function leerPreferencia<T extends string>(clave: string, validos: readonly T[], porDefecto: T): T {
  try {
    const v = localStorage.getItem(clave);
    return validos.includes(v as T) ? (v as T) : porDefecto;
  } catch {
    return porDefecto;
  }
}

export default function Lecciones({ usuario }: { usuario: string }) {
  const [progreso, setProgreso] = useState<Record<Modo, number>>(() => ({
    alfa: leerProgreso("alfa", usuario),
    numpad: leerProgreso("numpad", usuario),
    fila: leerProgreso("fila", usuario),
  }));
  const [seccion, setSeccion] = useState<Seccion>(() =>
    leerPreferencia<Seccion>("seccion_lecciones", ["alfa", "numerica"], "alfa")
  );
  const [variante, setVariante] = useState<Variante>(() =>
    leerPreferencia<Variante>("variante_numerica", ["numpad", "fila"], "numpad")
  );
  const [actual, setActual] = useState<number | null>(null);
  const [escrito, setEscrito] = useState("");
  const [verTeclado, setVerTeclado] = useState(() => {
    try {
      return localStorage.getItem("ver_teclado") !== "no";
    } catch {
      return true;
    }
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const curso: Modo = seccion === "alfa" ? "alfa" : variante;
  const lecciones = CURSOS[curso];
  const completadas = progreso[curso];
  const leccion = actual !== null ? lecciones[actual] : null;
  const terminado = leccion !== null && escrito.length === leccion.texto.length;

  let correctos = 0;
  if (leccion) {
    for (let i = 0; i < escrito.length; i++) {
      if (escrito[i] === leccion.texto[i]) correctos++;
    }
  }
  const precision = escrito.length === 0 ? 0 : Math.round((correctos / escrito.length) * 100);
  const aprobada = terminado && precision >= META;

  function manejarEscritura(valor: string) {
    if (!leccion || terminado) return;
    const nuevoTexto = valor.slice(0, leccion.texto.length);
    setEscrito(nuevoTexto);
    if (nuevoTexto.length !== leccion.texto.length) return;

    let aciertos = 0;
    for (let i = 0; i < nuevoTexto.length; i++) {
      if (nuevoTexto[i] === leccion.texto[i]) aciertos++;
    }
    const precisionFinal = Math.round((aciertos / nuevoTexto.length) * 100);
    if (precisionFinal >= META && actual !== null) {
      const nuevoProgreso = actual + 1;
      if (nuevoProgreso > completadas) {
        setProgreso((p) => ({ ...p, [curso]: Math.max(p[curso], nuevoProgreso) }));
        guardar(`${CLAVE_PROGRESO[curso]}_${usuario}`, String(nuevoProgreso));
      }
    }
  }

  function elegirSeccion(s: Seccion) {
    setSeccion(s);
    guardar("seccion_lecciones", s);
  }

  function elegirVariante(v: Variante) {
    setVariante(v);
    guardar("variante_numerica", v);
  }

  function alternarTeclado() {
    const nuevo = !verTeclado;
    setVerTeclado(nuevo);
    guardar("ver_teclado", nuevo ? "si" : "no");
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function abrir(indice: number) {
    setActual(indice);
    setEscrito("");
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  if (leccion === null) {
    return (
      <div className="lecciones-inicio">
        <p className="eyebrow"><span /> TU RUTA DE ENTRENAMIENTO</p>
        <h1>DOMINA EL <span>TECLADO.</span></h1>
        <h2>Lecciones</h2>

        <div className="pestanas">
          <button className={seccion === "alfa" ? "activa" : ""} onClick={() => elegirSeccion("alfa")}>
            Lecciones alfanuméricas
          </button>
          <button className={seccion === "numerica" ? "activa" : ""} onClick={() => elegirSeccion("numerica")}>
            Lecciones numéricas
          </button>
        </div>

        {seccion === "numerica" && (
          <div className="pestanas variantes">
            <button className={variante === "numpad" ? "activa" : ""} onClick={() => elegirVariante("numpad")}>
              Teclado numérico (Numpad)
            </button>
            <button className={variante === "fila" ? "activa" : ""} onClick={() => elegirVariante("fila")}>
              Fila superior (1 al 0)
            </button>
          </div>
        )}

        <p className="lecciones-descripcion">{DESCRIPCION[curso]}</p>
        <p className="lecciones-progreso">Llevas <strong>{completadas}</strong> de {lecciones.length}. Cada lección se aprueba con {META}% de precisión o más.</p>
        <p><button onClick={() => abrir(Math.min(completadas, lecciones.length - 1))}>Continuar donde voy <span>↗</span></button></p>

        <div className="lista-lecciones">
          {lecciones.map((l, i) => {
            const bloqueada = i > completadas;
            const hecha = i < completadas;
            const nuevaEtapa = i === 0 || lecciones[i - 1].etapa !== l.etapa;
            return (
              <div key={l.id}>
                {nuevaEtapa && <h3 className="etapa">{l.etapa}</h3>}
                <button className={hecha ? "hecha" : ""} disabled={bloqueada} onClick={() => abrir(i)}>
                  <strong>{i + 1}. {l.titulo}</strong>
                  <span>{hecha ? "✔ Completada" : bloqueada ? "🔒 Bloqueada" : "Disponible"}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const activas = new Set([...leccion.texto].filter((c) => c !== " "));
  const siguiente = terminado ? undefined : leccion.texto[escrito.length];

  return (
    <div className="leccion-activa pantalla-entrenamiento">
      <div className="leccion-cabecera">
        <button className="boton-texto" onClick={() => setActual(null)}>← TODAS LAS LECCIONES</button>
        <span className="leccion-indice">LECCIÓN {String(actual! + 1).padStart(2, "0")} / {String(lecciones.length).padStart(2, "0")}</span>
      </div>
      <p className="eyebrow"><span /> SESIÓN DE PRÁCTICA</p>
      <h1>{leccion.titulo}</h1>
      <p className="leccion-instruccion">{leccion.instruccion}</p>

      <div
        className="zona-escritura"
        onClick={() => inputRef.current?.focus()}
        role="group"
        aria-label="Área de escritura. Haz clic aquí y escribe el texto mostrado."
      >
        <p className="texto texto-flotante" aria-label={leccion.texto}>
          {leccion.texto.split("").map((letra, i) => {
            let clase = "pendiente";
            if (i < escrito.length) clase = escrito[i] === letra ? "correcta" : "incorrecta";
            return (
              <span key={i} className={`caracter-escritura ${clase}`}>
                {i === escrito.length && !terminado && <span className="cursor-escritura" aria-hidden="true" />}
                {letra === " " ? "\u00a0" : letra}
              </span>
            );
          })}
          {escrito.length === leccion.texto.length && <span className="cursor-escritura cursor-final" aria-hidden="true" />}
        </p>
        <input
          ref={inputRef}
          className="input-escritura-invisible"
          type="text"
          value={escrito}
          onChange={(e) => manejarEscritura(e.target.value)}
          onPaste={(e) => e.preventDefault()}
          disabled={terminado}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="Escribe aquí el texto de la lección"
        />
      </div>

      <div className="leccion-metricas">
        <span><strong>{escrito.length}</strong> / {leccion.texto.length} caracteres</span>
        <span><strong>{precision}%</strong> precisión</span>
      </div>

      <p className="acciones">
        <button className="secundario" onClick={alternarTeclado}>
          {verTeclado ? "Ocultar teclado y manos" : "Mostrar teclado y manos"}
        </button>
      </p>

      {verTeclado && <Teclado siguiente={siguiente} activas={activas} modo={leccion.modo} />}

      {terminado && (
        <div className="resultado">
          <div><strong>{precision}%</strong>Precisión</div>
          <div><strong>{aprobada ? "✔" : "✘"}</strong>{aprobada ? "¡Aprobada!" : `Necesitas ${META}%`}</div>
        </div>
      )}

      <div className="acciones">
        <button onClick={() => abrir(actual!)}>Repetir</button>{" "}
        {aprobada && actual! + 1 < lecciones.length && <button onClick={() => abrir(actual! + 1)}>Siguiente</button>}{" "}
        <button className="secundario" onClick={() => setActual(null)}>Volver a lecciones</button>
      </div>
    </div>
  );
}
