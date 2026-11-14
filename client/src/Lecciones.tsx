import { useState, useRef, useEffect } from "react";
import { CURSOS, type Modo } from "./curriculo";
import Teclado from "./Teclado";
import ControlesTexto, { estiloEscritura, type FuenteEscritura } from "./ControlesTexto";

const META = 90;

type Seccion = "alfa" | "numerica" | "simbolos";
type Variante = "numpad" | "fila";

const CLAVE_PROGRESO: Record<Modo, string> = {
  alfa: "progreso2",
  numpad: "progreso_numpad",
  fila: "progreso_fila",
  simbolos: "progreso_simbolos_us",
};

const DESCRIPCION: Record<Modo, string> = {
  alfa: "Letras del teclado: fila base, superior e inferior, palabras y frases.",
  numpad: "Teclado numérico lateral con la técnica de 5 dedos. Tecla guía: el 5.",
  fila: "Números del 1 al 0 de la fila superior, con los dedos de ambas manos desde la fila base.",
  simbolos: "Símbolos de la distribución estadounidense (US), con práctica progresiva de Shift y combinaciones.",
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

export default function Lecciones({ usuario, fuente, tamano, onFuente, onTamano }: { usuario: string; fuente: FuenteEscritura; tamano: number; onFuente: (v: FuenteEscritura) => void; onTamano: (v: number) => void }) {
  const [progreso, setProgreso] = useState<Record<Modo, number>>(() => ({
    alfa: leerProgreso("alfa", usuario),
    numpad: leerProgreso("numpad", usuario),
    fila: leerProgreso("fila", usuario),
    simbolos: leerProgreso("simbolos", usuario),
  }));
  const [seccion, setSeccion] = useState<Seccion>(() =>
    leerPreferencia<Seccion>("seccion_lecciones", ["alfa", "numerica", "simbolos"], "alfa")
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
  const inicioRef = useRef<number | null>(null);
  const intentoGuardadoRef = useRef<string>("");
  const [tiempoMs, setTiempoMs] = useState(0);
  const [teclaReinicio, setTeclaReinicio] = useState<"Tab" | "Control" | "Shift">(() => {
    const v = localStorage.getItem("fasttype_tecla_reinicio");
    return v === "Tab" || v === "Control" || v === "Shift" ? v : "Tab";
  });

  const curso: Modo = seccion === "alfa" ? "alfa" : seccion === "simbolos" ? "simbolos" : variante;
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

  useEffect(() => {
    if (!leccion || inicioRef.current === null || terminado) return;
    const tick = () => setTiempoMs(Date.now() - inicioRef.current!);
    tick();
    const id = window.setInterval(tick, 200);
    return () => window.clearInterval(id);
  }, [leccion?.id, terminado, escrito.length > 0]);

  useEffect(() => {
    const inicio = inicioRef.current;
    if (!leccion || !terminado || inicio === null || escrito.length === 0) return;
    const claveIntento = curso + "-" + leccion.id + "-" + inicio;
    if (intentoGuardadoRef.current === claveIntento) return;
    intentoGuardadoRef.current = claveIntento;
    const duracion = Math.max(1, Date.now() - inicio);
    setTiempoMs(duracion);
    const wpmFinal = Math.round((correctos / 5) / (duracion / 60000));
    const registro = { leccionId: leccion.id, titulo: leccion.titulo, curso, fecha: new Date().toISOString(), duracionMs: duracion, wpm: wpmFinal, precision };
    try {
      const key = "fasttype_lecciones_" + usuario;
      const anteriores = JSON.parse(localStorage.getItem(key) || "[]");
      anteriores.push(registro);
      localStorage.setItem(key, JSON.stringify(anteriores.slice(-500)));
    } catch (error) { console.warn("No se pudo guardar el tiempo de la lección:", error); }
  }, [terminado, escrito.length]);

  function manejarEscritura(valor: string) {
    if (!leccion || terminado) return;
    const nuevoTexto = valor.slice(0, leccion.texto.length);
    if (nuevoTexto.length > 0 && inicioRef.current === null) inicioRef.current = Date.now();
    setEscrito(nuevoTexto);
    if (nuevoTexto.length !== leccion.texto.length) return;
    let aciertos = 0;
    for (let i = 0; i < nuevoTexto.length; i++) if (nuevoTexto[i] === leccion.texto[i]) aciertos++;
    const precisionFinal = Math.round((aciertos / nuevoTexto.length) * 100);
    if (precisionFinal >= META && actual !== null) {
      const nuevoProgreso = actual + 1;
      if (nuevoProgreso > completadas) {
        setProgreso((p) => ({ ...p, [curso]: Math.max(p[curso], nuevoProgreso) }));
        guardar(CLAVE_PROGRESO[curso] + "_" + usuario, String(nuevoProgreso));
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
    setActual(indice); setEscrito(""); inicioRef.current = null;
    intentoGuardadoRef.current = ""; setTiempoMs(0);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function cambiarTeclaReinicio(tecla: "Tab" | "Control" | "Shift") {
    setTeclaReinicio(tecla);
    guardar("fasttype_tecla_reinicio", tecla);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function manejarTeclaEspecial(e: React.KeyboardEvent<HTMLInputElement>) {
    const coincide = teclaReinicio === "Tab" ? e.key === "Tab"
      : teclaReinicio === "Shift" ? e.key === "Shift"
      : e.key === "Control" && !e.altKey && !e.metaKey;
    if (coincide) {
      e.preventDefault();
      abrir(actual!);
      return;
    }

    // El Enter del bloque numérico suele identificarse como NumpadEnter.
    // Debe comportarse exactamente igual que el Enter principal.
    if (e.key === "Enter" || e.code === "NumpadEnter") {
      e.preventDefault();
      if (terminado && aprobada && actual! + 1 < lecciones.length) {
        abrir(actual! + 1);
      }
      return;
    }

    // En el curso de símbolos usamos la distribución física US por code,
    // no por event.key, para que Shift produzca el símbolo esperado aunque
    // el idioma de entrada del sistema operativo sea distinto.
    if (curso === "simbolos") {
      const mapaUS: Record<string, [string, string]> = {
        Backquote: ["`", "~"],
        Digit1: ["1", "!"], Digit2: ["2", "@"], Digit3: ["3", "#"],
        Digit4: ["4", "$"], Digit5: ["5", "%"], Digit6: ["6", "^"],
        Digit7: ["7", "&"], Digit8: ["8", "*"], Digit9: ["9", "("],
        Digit0: ["0", ")"], Minus: ["-", "_"], Equal: ["=", "+"],
        KeyQ: ["q", "Q"], KeyW: ["w", "W"], KeyE: ["e", "E"], KeyR: ["r", "R"],
        KeyT: ["t", "T"], KeyY: ["y", "Y"], KeyU: ["u", "U"], KeyI: ["i", "I"],
        KeyO: ["o", "O"], KeyP: ["p", "P"], BracketLeft: ["[", "{"],
        BracketRight: ["]", "}"], Backslash: ["\\", "|"],
        KeyA: ["a", "A"], KeyS: ["s", "S"], KeyD: ["d", "D"], KeyF: ["f", "F"],
        KeyG: ["g", "G"], KeyH: ["h", "H"], KeyJ: ["j", "J"], KeyK: ["k", "K"],
        KeyL: ["l", "L"], Semicolon: [";", ":"], Quote: ["'", "\""],
        KeyZ: ["z", "Z"], KeyX: ["x", "X"], KeyC: ["c", "C"], KeyV: ["v", "V"],
        KeyB: ["b", "B"], KeyN: ["n", "N"], KeyM: ["m", "M"],
        Comma: [",", "<"], Period: [".", ">"], Slash: ["/", "?"],
      };
      if (e.code === "Space") {
        e.preventDefault();
        e.stopPropagation();
        if (!terminado) manejarEscritura(escrito + " ");
        return;
      }
      const teclasUS = mapaUS[e.code];
      if (teclasUS) {
        e.preventDefault();
        e.stopPropagation();
        if (!terminado) manejarEscritura(escrito + teclasUS[e.shiftKey ? 1 : 0]);
        return;
      }
      if (e.key === "Shift" || e.key === "Control" || e.key === "Alt" || e.key === "Meta") return;
      if (e.key.length === 1 || e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        e.stopPropagation();
      }
      return;
    }

    // En el curso Numpad solo aceptamos códigos físicos inequívocos.
    // Numpad0 siempre escribe "0"; Space siempre escribe un espacio.
    // No usamos e.key, keyCode ni location como sustitutos: esos valores
    // dependen del estado de Bloq Num y nunca deben convertir una tecla en otra.
    if (curso === "numpad") {
      const mapaNumpad: Record<string, string> = {
        Numpad0: "0",
        Numpad1: "1",
        Numpad2: "2",
        Numpad3: "3",
        Numpad4: "4",
        Numpad5: "5",
        Numpad6: "6",
        Numpad7: "7",
        Numpad8: "8",
        Numpad9: "9",
        NumpadDecimal: ".",
        NumpadAdd: "+",
        NumpadSubtract: "-",
        NumpadMultiply: "*",
        NumpadDivide: "/",
      };

      const codigo = e.nativeEvent.code;
      const caracter = mapaNumpad[codigo];

      // Borrar. En este curso el onChange está desactivado, así que Backspace
      // (y NumpadBackspace, que algunos teclados traen en el bloque numérico)
      // debe borrar desde aquí. Va antes del bloqueo genérico de "Numpad*".
      if (codigo === "Backspace" || codigo === "NumpadBackspace" || e.key === "Backspace") {
        e.preventDefault();
        e.stopPropagation();
        if (!terminado) manejarEscritura(escrito.slice(0, -1));
        return;
      }

      if (caracter !== undefined) {
        e.preventDefault();
        e.stopPropagation();
        if (!terminado) manejarEscritura(escrito + caracter);
        return;
      }

      if (codigo === "Space") {
        e.preventDefault();
        e.stopPropagation();
        if (!terminado) manejarEscritura(escrito + " ");
        return;
      }

      // Bloquea cualquier otra entrada nativa. Las teclas no reconocidas
      // no se transforman en cero ni en espacio.
      if (codigo.startsWith("Numpad") || e.key.length === 1 || e.key === "Insert" || e.key === " ") {
        e.preventDefault();
        e.stopPropagation();
      }
    }
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
          <button className={seccion === "simbolos" ? "activa" : ""} onClick={() => elegirSeccion("simbolos")}>
            Símbolos US
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
  const segundos = tiempoMs / 1000;
  const tiempoVisible = Math.floor(segundos / 60) + ":" + String(Math.floor(segundos % 60)).padStart(2, "0");
  const wpmActual = segundos > 0 ? Math.round((correctos / 5) / (segundos / 60)) : 0;

  return (
    <div className="leccion-activa pantalla-entrenamiento" style={estiloEscritura(fuente, tamano)}>
      <div className="leccion-cabecera">
        <button className="boton-texto" onClick={() => setActual(null)}>← LECCIONES</button>
        <div className="leccion-titulo-control"><strong>{leccion.titulo}</strong><span>LECCIÓN {String(actual! + 1).padStart(2, "0")} / {String(lecciones.length).padStart(2, "0")}</span></div>
        <div className="leccion-controles">
          <span className="leccion-cronometro">{tiempoVisible}</span>
          <ControlesTexto fuente={fuente} tamano={tamano} onFuente={onFuente} onTamano={onTamano} />
          <label className="tecla-reinicio-control" title="Tecla para reiniciar">
            <span aria-hidden="true">⟲</span>
            <select value={teclaReinicio} onChange={(e) => cambiarTeclaReinicio(e.target.value as "Tab" | "Control" | "Shift")} aria-label="Tecla para reiniciar" title="Tecla para reiniciar">
              <option value="Tab">Tab</option><option value="Control">Ctrl</option><option value="Shift">Shift</option>
            </select>
          </label>
          <button className="icono-control" onClick={() => abrir(actual!)} title="Reiniciar lección" aria-label="Reiniciar lección">↻</button>
          <button className="icono-control" onClick={alternarTeclado} title={verTeclado ? "Ocultar teclado" : "Mostrar teclado"} aria-label={verTeclado ? "Ocultar teclado" : "Mostrar teclado"}>⌨</button>
        </div>
      </div>
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
            // Los espacios esperados llevan su propia clase para poder marcarlos
            // en rojo cuando se falla (un espacio no tiene texto que colorear).
            return (
              <span
                key={i}
                className={`caracter-escritura ${clase}${letra === " " ? " caracter-espacio" : ""}`}
              >
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
          onChange={(e) => {
            // En Numpad la entrada se procesa exclusivamente desde onKeyDown.
            // Bloquea cualquier inserción automática del navegador (incluido espacio).
            if (curso !== "numpad" && curso !== "simbolos") manejarEscritura(e.target.value);
          }}
          onKeyDown={manejarTeclaEspecial}
          onBeforeInput={(e) => {
            // En Numpad toda la entrada viene del código físico capturado arriba.
            // Evita que beforeinput inserte por segunda vez el carácter del navegador.
            if (curso === "numpad" || curso === "simbolos") e.preventDefault();
          }}
          onPaste={(e) => e.preventDefault()}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="Escribe aquí el texto de la lección"
        />
      </div>

      <div className="leccion-metricas"><span><strong>{escrito.length}</strong> / {leccion.texto.length}</span><span><strong>{precision}%</strong> precisión</span><span><strong>{wpmActual}</strong> PPM</span><span><strong>{tiempoVisible}</strong> tiempo</span></div>
      {verTeclado && <Teclado siguiente={siguiente} activas={activas} modo={leccion.modo} />}
      {terminado && <div className="leccion-final"><span>{aprobada ? "Lección completada" : "Sigue practicando"}</span><strong>{wpmActual} PPM</strong><span>{precision}% precisión · {tiempoVisible}</span><div className="leccion-final-acciones"><button onClick={() => abrir(actual!)}>Repetir</button>{aprobada && actual! + 1 < lecciones.length && <button onClick={() => abrir(actual! + 1)}>Siguiente lección</button>}<button className="secundario" onClick={() => setActual(null)}>Volver al curso</button></div></div>}
    </div>
  );
}
