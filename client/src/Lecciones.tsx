import { useState, useRef, useEffect } from "react";
import { LECCIONES } from "./curriculo";
import Teclado from "./Teclado";

const META = 90;

function leerProgreso(usuario: string) {
  try {
    return Number(localStorage.getItem(`progreso2_${usuario}`)) || 0;
  } catch {
    return 0;
  }
}

export default function Lecciones({ usuario }: { usuario: string }) {
  const [completadas, setCompletadas] = useState(() => leerProgreso(usuario));
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

  const leccion = actual !== null ? LECCIONES[actual] : null;
  const terminado = leccion !== null && escrito.length === leccion.texto.length;

  let correctos = 0;
  if (leccion) {
    for (let i = 0; i < escrito.length; i++) {
      if (escrito[i] === leccion.texto[i]) correctos++;
    }
  }
  const precision =
    escrito.length === 0 ? 0 : Math.round((correctos / escrito.length) * 100);
  const aprobada = terminado && precision >= META;

  useEffect(() => {
    if (!aprobada || actual === null) return;
    if (actual + 1 > completadas) {
      setCompletadas(actual + 1);
      try {
        localStorage.setItem(`progreso2_${usuario}`, String(actual + 1));
      } catch {
        // si el navegador no deja guardar, seguimos sin guardar
      }
    }
  }, [aprobada]);

  function alternarTeclado() {
    const nuevo = !verTeclado;
    setVerTeclado(nuevo);
    try {
      localStorage.setItem("ver_teclado", nuevo ? "si" : "no");
    } catch {
      // sin guardado
    }
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function abrir(indice: number) {
    setActual(indice);
    setEscrito("");
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  if (leccion === null) {
    return (
      <div>
        <h1>Fasttype</h1>
        <h2>Lecciones</h2>
        <p>
          Llevas {completadas} de {LECCIONES.length}. Cada lección se aprueba
          con {META}% de precisión o más.
        </p>
        <p>
          <button
            onClick={() => abrir(Math.min(completadas, LECCIONES.length - 1))}
          >
            Continuar donde voy
          </button>
        </p>
        <div className="lista-lecciones">
          {LECCIONES.map((l, i) => {
            const bloqueada = i > completadas;
            const hecha = i < completadas;
            const nuevaEtapa = i === 0 || LECCIONES[i - 1].etapa !== l.etapa;
            return (
              <div key={l.id}>
                {nuevaEtapa && <h3 className="etapa">{l.etapa}</h3>}
                <button
                  className={hecha ? "hecha" : ""}
                  disabled={bloqueada}
                  onClick={() => abrir(i)}
                >
                  <strong>
                    {i + 1}. {l.titulo}
                  </strong>
                  <span>
                    {hecha
                      ? "✔ Completada"
                      : bloqueada
                      ? "🔒 Bloqueada"
                      : "Disponible"}
                  </span>
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
    <div>
      <h1>Fasttype</h1>
      <h2>
        Lección {actual! + 1}: {leccion.titulo}
      </h2>
      <p>{leccion.instruccion}</p>

      <p className="texto">
        {leccion.texto.split("").map((letra, i) => {
          let clase = "pendiente";
          if (i < escrito.length) {
            clase = escrito[i] === letra ? "correcta" : "incorrecta";
          }
          return (
            <span key={i} className={clase}>
              {letra}
            </span>
          );
        })}
      </p>

      <input
        ref={inputRef}
        type="text"
        value={escrito}
        onChange={(e) => !terminado && setEscrito(e.target.value)}
        disabled={terminado}
        placeholder="Escribe aquí..."
      />

      <p className="acciones">
        <button className="secundario" onClick={alternarTeclado}>
          {verTeclado ? "Ocultar teclado y manos" : "Mostrar teclado y manos"}
        </button>
      </p>

      {verTeclado && <Teclado siguiente={siguiente} activas={activas} />}

      {terminado && (
        <div className="resultado">
          <div>
            <strong>{precision}%</strong>
            Precisión
          </div>
          <div>
            <strong>{aprobada ? "✔" : "✘"}</strong>
            {aprobada ? "¡Aprobada!" : `Necesitas ${META}%`}
          </div>
        </div>
      )}

      <div className="acciones">
        <button onClick={() => abrir(actual!)}>Repetir</button>{" "}
        {aprobada && actual! + 1 < LECCIONES.length && (
          <button onClick={() => abrir(actual! + 1)}>Siguiente</button>
        )}{" "}
        <button className="secundario" onClick={() => setActual(null)}>
          Volver a lecciones
        </button>
      </div>
    </div>
  );
}