import { useState, useEffect, useRef } from "react";
import "./App.css";
import Login from "./Login";
import Inicio from "./Inicio";
import Lecciones from "./Lecciones";
import Perfil from "./Perfil";
import ControlesTexto, { estiloEscritura, type FuenteEscritura } from "./ControlesTexto";
import {
  obtenerSesion,
  cerrarSesion,
  guardarResultado,
  guardarConfianzaTeclas,
  pedirHistorial,
  pedirRanking,
  generarTextoEntrenador,
} from "./api";

const TEXTOS = [
  "el sol sale por la mañana y los pájaros cantan mientras la ciudad despierta poco a poco con el ruido de los autos y las voces de la gente",
  "programar es resolver problemas pequeños uno a uno hasta construir algo grande que funcione para muchas personas en cualquier parte del mundo",
  "cada día que practico escribo un poco más rápido y cometo menos errores porque la constancia es lo que de verdad marca la diferencia",
  "la tecnología avanza muy deprisa y quienes aprenden todos los días encuentran siempre nuevas oportunidades para crecer y mejorar su trabajo",
];
const DURACION = 30;
type TeclaReinicio = "Tab" | "Control" | "Shift";

const DURACIONES = [15, 30, 60] as const;
type CategoriaPractica = "letras" | "puntuacion" | "numeros" | "operaciones";
const CATEGORIAS: { id: CategoriaPractica; nombre: string }[] = [
  { id: "letras", nombre: "Letras" },
  { id: "puntuacion", nombre: "Letras + puntuación" },
  { id: "numeros", nombre: "Números" },
  { id: "operaciones", nombre: "Números + operaciones" },
];
const TEXTOS_PUNTUACION = [
  "¿cómo estás? espero que todo vaya bien; hoy tenemos una nueva oportunidad para aprender.",
  "la práctica constante es importante: cada intento cuenta, cada error enseña y cada mejora suma.",
  "¿cuál es tu objetivo? escribir con calma, mantener la precisión y aumentar la velocidad.",
];
const TEXTOS_NUMEROS = [
  "2026 12 52 365 24 18 96 5 10 30 7 14 21 28 100 250 500 1000",
  "12345 67890 24680 13579 112233 445566 778899 2026 2027 2028",
  "15 30 45 60 75 90 105 120 150 180 210 240 300 360 480 600",
];
const TEXTOS_OPERACIONES = [
  "12 + 8 = 20; 30 - 12 = 18; 6 * 7 = 42; 81 / 9 = 9.",
  "15 + 25 = 40; 90 - 35 = 55; 8 * 8 = 64; 72 / 8 = 9.",
  "100 - 45 = 55; 14 + 16 = 30; 9 * 5 = 45; 63 / 7 = 9.",
];

function codigoTeclaEsperada(caracter: string): string | null {
  if (caracter === " ") return "Space";
  if (/^[a-z]$/i.test(caracter)) return "Key" + caracter.toUpperCase();
  if (/^\d$/.test(caracter)) return "Digit" + caracter;
  const mapa: Record<string, string> = {
    "ñ": "Semicolon", "Ñ": "Semicolon", ",": "Comma", ".": "Period",
    "/": "Slash", "?": "Slash", ";": "Semicolon", ":": "Semicolon",
    "'": "Quote", '"': "Quote", "[": "BracketLeft", "{": "BracketLeft",
    "]": "BracketRight", "}": "BracketRight", "\\": "Backslash", "|": "Backslash",
    "-": "Minus", "_": "Minus", "=": "Equal", "+": "Equal",
    "`": "Backquote", "~": "Backquote", "!": "Digit1", "@": "Digit2",
    "#": "Digit3", "$": "Digit4", "%": "Digit5", "^": "Digit6",
    "&": "Digit7", "*": "Digit8", "(": "Digit9", ")": "Digit0",
  };
  return mapa[caracter] ?? null;
}


function textoAleatorio(categorias: CategoriaPractica[]) {
  const disponibles: string[] = [];
  if (categorias.includes("letras")) disponibles.push(...TEXTOS);
  if (categorias.includes("puntuacion")) disponibles.push(...TEXTOS_PUNTUACION);
  if (categorias.includes("numeros")) disponibles.push(...TEXTOS_NUMEROS);
  if (categorias.includes("operaciones")) disponibles.push(...TEXTOS_OPERACIONES);
  const lista = disponibles.length ? disponibles : TEXTOS;
  return lista[Math.floor(Math.random() * lista.length)];
}

function generarTexto(longitud: number, categorias: CategoriaPractica[]) {
  let resultado = "";
  while (resultado.length < longitud) resultado += (resultado ? " " : "") + textoAleatorio(categorias);
  return resultado;
}

function SelectorCategorias({ categorias, onChange }: { categorias: CategoriaPractica[]; onChange: (categorias: CategoriaPractica[]) => void }) {
  function alternar(id: CategoriaPractica) {
    if (categorias.includes(id) && categorias.length === 1) return;
    onChange(categorias.includes(id) ? categorias.filter((x) => x !== id) : [...categorias, id]);
  }
  const resumen = categorias.length === 0 ? "Elegir contenido" : categorias.map((id) => CATEGORIAS.find((x) => x.id === id)?.nombre).filter(Boolean).join(" + ");
  return (
    <details className="selector-categorias-nav">
      <summary aria-label="Cambiar contenido de práctica"><span>CONTENIDO</span><b>{resumen}</b><i>⌄</i></summary>
      <div className="selector-categorias-menu">
        {CATEGORIAS.map((categoria) => (
          <label key={categoria.id}>
            <input type="checkbox" checked={categorias.includes(categoria.id)} onChange={() => alternar(categoria.id)} />
            <span>{categoria.nombre}</span>
          </label>
        ))}
      </div>
    </details>
  );
}

function Test({ usuario, categorias, onCategoriasChange, onSalir, onInicio, fuente, tamano, onFuente, onTamano }: { usuario: string; categorias: CategoriaPractica[]; onCategoriasChange: (categorias: CategoriaPractica[]) => void; onSalir: () => void; onInicio: () => void; fuente: FuenteEscritura; tamano: number; onFuente: (v: FuenteEscritura) => void; onTamano: (v: number) => void }) {
  const [duracion, setDuracion] = useState<number>(() => {
    const guardada = localStorage.getItem("fasttype_duracion_libre");
    if (guardada === null) return DURACION;
    const v = Number(guardada);
    return Number.isFinite(v) && v >= 0 && v <= 3600 && (v === 0 || v >= 5) ? v : DURACION;
  });
  const [duracionPersonalizada, setDuracionPersonalizada] = useState(() => {
    const v = Number(localStorage.getItem("fasttype_duracion_personalizada"));
    return Number.isFinite(v) && v >= 5 && v <= 3600 ? v : 45;
  });
  const [mostrarPersonalizado, setMostrarPersonalizado] = useState(false);
  const [teclaReinicio, setTeclaReinicio] = useState<TeclaReinicio>(() => {
    const v = localStorage.getItem("fasttype_tecla_reinicio");
    return v === "Tab" || v === "Control" || v === "Shift" ? v : "Tab";
  });
  const [texto, setTexto] = useState(() => generarTexto(12 * DURACION, categorias));
  const [generandoTexto, setGenerandoTexto] = useState(false);
  const solicitudTextoRef = useRef(0);
  const [escrito, setEscrito] = useState("");
  const [tiempo, setTiempo] = useState(duracion);
  const [transcurrido, setTranscurrido] = useState(0);
  const [iniciado, setIniciado] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [historial, setHistorial] = useState<{ id: number; wpm: number; precision: number; creado_en: string }[]>([]);
  const [ranking, setRanking] = useState<{ nombre: string; mejor_wpm: number }[]>([]);
  const guardadoRef = useRef(false);
  const guardadoTeclasRef = useRef(false);
  const confianzaTeclasRef = useRef<Record<string, { etiqueta: string; aciertos: number; intentos: number }>>({});

  useEffect(() => {
    let activo = true;
    Promise.all([pedirHistorial(), pedirRanking()])
      .then(([h, r]) => { if (activo) { setHistorial(h); setRanking(r); } })
      .catch(() => {});
    return () => { activo = false; };
  }, []);

  const textoCompleto = escrito.length === texto.length;
  const terminado = (duracion !== 0 && tiempo === 0) || textoCompleto;
  let correctos = 0;
  for (let i = 0; i < escrito.length; i++) if (escrito[i] === texto[i]) correctos++;
  const segundosUsados = duracion === 0 ? Math.max(transcurrido, 1) : Math.max(duracion - tiempo, 1);
  const wpm = Math.round(correctos / 5 / (segundosUsados / 60));
  const precision = escrito.length === 0 ? 0 : Math.round((correctos / escrito.length) * 100);

  async function prepararTexto(longitud: number) {
    const solicitud = ++solicitudTextoRef.current;
    setGenerandoTexto(true);
    try {
      const generado = await generarTextoEntrenador(categorias, Math.min(1800, Math.max(250, longitud)));
      if (solicitud === solicitudTextoRef.current) setTexto(generado);
    } catch (error) {
      console.warn("Se utilizará el generador local de práctica:", error);
      if (solicitud === solicitudTextoRef.current) setTexto(generarTexto(longitud, categorias));
    } finally {
      if (solicitud === solicitudTextoRef.current) setGenerandoTexto(false);
    }
  }

  function reiniciar(nuevaDuracion = duracion) {
    guardarConfianzaActual();
    void prepararTexto(nuevaDuracion === 0 ? 1200 : Math.max(500, nuevaDuracion * 12));
    setEscrito("");
    setTiempo(nuevaDuracion);
    setTranscurrido(0);
    setIniciado(false);
    guardadoRef.current = false;
    guardadoTeclasRef.current = false;
    confianzaTeclasRef.current = {};
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  useEffect(() => {
    guardarConfianzaActual();
    void prepararTexto(duracion === 0 ? 1200 : Math.max(500, duracion * 12));
    setEscrito("");
    setTiempo(duracion);
    setTranscurrido(0);
    setIniciado(false);
    guardadoRef.current = false;
    guardadoTeclasRef.current = false;
    confianzaTeclasRef.current = {};
  }, [categorias.join("|")]);

  function elegirDuracion(valor: number) {
    setDuracion(valor);
    localStorage.setItem("fasttype_duracion_libre", String(valor));
    setMostrarPersonalizado(false);
    reiniciar(valor);
  }

  function aplicarPersonalizado(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const valor = Math.min(3600, Math.max(5, Math.round(duracionPersonalizada)));
    setDuracionPersonalizada(valor);
    localStorage.setItem("fasttype_duracion_personalizada", String(valor));
    elegirDuracion(valor);
  }

  function cambiarTeclaReinicio(valor: TeclaReinicio) {
    setTeclaReinicio(valor);
    localStorage.setItem("fasttype_tecla_reinicio", valor);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  useEffect(() => {
    if (!iniciado || terminado) return;
    const intervalo = window.setInterval(() => {
      setTranscurrido((t) => t + 1);
      if (duracion !== 0) setTiempo((t) => Math.max(0, t - 1));
    }, 1000);
    return () => window.clearInterval(intervalo);
  }, [iniciado, terminado, duracion]);

  useEffect(() => {
    if (!terminado || guardadoRef.current || escrito.length === 0) return;
    guardadoRef.current = true;
    guardarResultado(wpm, precision, segundosUsados)
      .then(() => Promise.all([pedirHistorial(), pedirRanking()]))
      .then(([h, r]) => { setHistorial(h); setRanking(r); })
      .catch(() => {});
  }, [terminado, escrito.length, wpm, precision, segundosUsados]);

  function guardarConfianzaActual() {
    if (guardadoTeclasRef.current) return;
    const teclas = Object.entries(confianzaTeclasRef.current).map(([codigo, t]) => ({ codigo, ...t }));
    if (!teclas.length) return;
    guardadoTeclasRef.current = true;
    guardarConfianzaTeclas(teclas).catch((error) => console.error("No se pudo guardar la precisión por tecla:", error));
  }

  useEffect(() => {
    if (!terminado || escrito.length === 0) return;
    guardarConfianzaActual();
  }, [terminado, escrito.length]);

  function manejarCambio(e: React.ChangeEvent<HTMLInputElement>) {
    if (terminado) return;
    if (!iniciado) setIniciado(true);
    const nuevoTexto = e.target.value;
    setEscrito(nuevoTexto);
    if (duracion === 0 && texto.length - nuevoTexto.length < 120) {
      const textoExtra = " " + textoAleatorio(categorias);
      setTexto((anterior) => anterior + textoExtra);
    }
  }

  function manejarTecla(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!terminado && !e.repeat && e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey && e.code) {
      const esperado = texto[escrito.length];
      const codigoBase = codigoTeclaEsperada(esperado);
      const codigo = e.key === esperado && e.code.startsWith("Numpad") ? e.code : codigoBase;
      if (codigo) {
        const etiqueta = esperado === " " ? "ESP" : esperado.toLocaleUpperCase().slice(0, 4);
        const registro = confianzaTeclasRef.current[codigo] ?? { etiqueta, aciertos: 0, intentos: 0 };
        registro.etiqueta = etiqueta;
        registro.intentos += 1;
        if (e.key === esperado && (e.code === codigoBase || e.code === codigo)) registro.aciertos += 1;
        confianzaTeclasRef.current[codigo] = registro;
      }
    }
    const coincide = teclaReinicio === "Tab" ? e.key === "Tab"
      : teclaReinicio === "Shift" ? e.key === "Shift"
      : e.key === "Control" && !e.altKey && !e.metaKey;
    if (coincide) {
      e.preventDefault();
      reiniciar();
    }
  }

  const tiempoVisible = duracion === 0
    ? Math.floor(transcurrido / 60) + ":" + String(transcurrido % 60).padStart(2, "0")
    : String(tiempo);

  return (
    <section className="vista-contenido pantalla-entrenamiento prueba-libre" style={estiloEscritura(fuente, tamano)}>
      <div className="vista-cabecera cabecera-prueba-libre">
        <button className="boton-texto" onClick={() => { guardarConfianzaActual(); onInicio(); }}>← INICIO</button>
        <span className="usuario-chip">{usuario}</span>
        <SelectorCategorias categorias={categorias} onChange={onCategoriasChange} />
        <div className="prueba-libre-controles" aria-label="Configuración de la prueba">
        <div className="selector-duracion" role="group" aria-label="Duración">
          {DURACIONES.map((valor) => <button key={valor} className={duracion === valor ? "activa" : ""} onClick={() => elegirDuracion(valor)} aria-pressed={duracion === valor}>{valor}s</button>)}
          <button className={mostrarPersonalizado || (duracion !== 0 && !DURACIONES.includes(duracion as 15 | 30 | 60)) ? "activa" : ""} onClick={() => setMostrarPersonalizado((v) => !v)} aria-expanded={mostrarPersonalizado}>Personalizado</button>
          <button className={duracion === 0 ? "activa" : ""} onClick={() => elegirDuracion(0)} aria-pressed={duracion === 0}>Sin límite</button>
        </div>
        {mostrarPersonalizado && (
          <form className="duracion-personalizada" onSubmit={aplicarPersonalizado}>
            <label htmlFor="duracion-personalizada">Segundos</label>
            <input id="duracion-personalizada" type="number" min="5" max="3600" step="1" value={duracionPersonalizada} onChange={(e) => setDuracionPersonalizada(Number(e.target.value))} />
            <button type="submit">Aplicar</button>
          </form>
        )}
        <label className="tecla-reinicio-libre">
          <span>Reiniciar con</span>
          <select value={teclaReinicio} onChange={(e) => cambiarTeclaReinicio(e.target.value as TeclaReinicio)} aria-label="Tecla para reiniciar">
            <option value="Tab">Tab</option><option value="Control">Ctrl</option><option value="Shift">Shift</option>
          </select>
        </label>
        <button className="reiniciar-libre" onClick={() => reiniciar()} title="Reiniciar prueba" aria-label="Reiniciar prueba">↻</button>
      </div>
        <ControlesTexto fuente={fuente} tamano={tamano} onFuente={onFuente} onTamano={onTamano} />
        <button className="boton-salir" onClick={() => { guardarConfianzaActual(); onSalir(); }}>Salir</button>
      </div>
      <h1>PRÁCTICA</h1>
      <p className="tiempo">{duracion === 0 ? tiempoVisible : tiempo + "s"}</p>
      {generandoTexto && <p className="texto-generando">Preparando ejercicio personalizado…</p>}
      <div className="zona-escritura" onClick={() => inputRef.current?.focus()} role="group" aria-label="Área de escritura. Haz clic aquí y escribe el texto mostrado.">
        <p className="texto texto-flotante" aria-label={texto}>
          {texto.split("").map((letra, i) => {
            let clase = "pendiente";
            if (i < escrito.length) clase = escrito[i] === letra ? "correcta" : "incorrecta";
            return <span key={i} className={`caracter-escritura ${clase}`}>{i === escrito.length && !terminado && <span className="cursor-escritura" aria-hidden="true" />}{letra === " " ? "\u00a0" : letra}</span>;
          })}
          {escrito.length === texto.length && <span className="cursor-escritura cursor-final" aria-hidden="true" />}
        </p>
        <input ref={inputRef} className="input-escritura-invisible" type="text" value={escrito} onChange={manejarCambio} onKeyDown={manejarTecla} onPaste={(e) => e.preventDefault()} disabled={terminado || generandoTexto} autoComplete="off" autoCapitalize="off" spellCheck={false} autoFocus aria-label="Escribe aquí el texto de la prueba libre" />
      </div>
      {terminado && <div className="resultado"><div><strong>{wpm}</strong>WPM</div><div><strong>{precision}%</strong>Precisión</div></div>}
      <div className="paneles paneles-resultados">
        <div className="panel"><h3>Tu historial</h3><ul>{historial.slice(0, 5).map((r) => <li key={r.id}>{r.wpm} WPM · {r.precision}% · {new Date(r.creado_en).toLocaleDateString()}</li>)}</ul></div>
        <div className="panel"><h3>Ranking global</h3><ol>{ranking.map((r) => <li key={r.nombre}>{r.nombre}: {r.mejor_wpm} WPM</li>)}</ol></div>
      </div>
    </section>
  );
}

function App() {
  const [usuario, setUsuario] = useState<string | null>(null);
  const [comprobandoSesion, setComprobandoSesion] = useState(true);
  const [vista, setVista] = useState<"inicio" | "lecciones" | "libre" | "perfil">("inicio");
  const [categoriasPractica, setCategoriasPractica] = useState<CategoriaPractica[]>(["letras"]);
  const [fuente, setFuente] = useState<FuenteEscritura>(() => {
    const v = localStorage.getItem("fasttype_fuente");
    return v === "Lexend" || v === "Atkinson Hyperlegible" || v === "Arial" ? v : "Inter";
  });
  const [tamano, setTamano] = useState(() => {
    const n = Number(localStorage.getItem("fasttype_tamano"));
    return Number.isFinite(n) && n >= 20 && n <= 42 ? n : 32;
  });
  function cambiarFuente(v: FuenteEscritura) { setFuente(v); localStorage.setItem("fasttype_fuente", v); }
  function cambiarTamano(v: number) { setTamano(v); localStorage.setItem("fasttype_tamano", String(v)); }

  useEffect(() => {
    let activo = true;
    obtenerSesion()
      .then((sesion) => {
        if (activo) setUsuario(sesion?.name ?? null);
      })
      .catch((error) => {
        console.error("No se pudo recuperar la sesión:", error);
        if (activo) setUsuario(null);
      })
      .finally(() => {
        if (activo) setComprobandoSesion(false);
      });

    return () => {
      activo = false;
    };
  }, []);

  async function salir() {
    try {
      await cerrarSesion();
    } catch (error) {
      console.error("Error cerrando sesión:", error);
    } finally {
      setUsuario(null);
      setVista("inicio");
    }
  }

  if (comprobandoSesion) {
    return <div className="auth-loading">FAST<span>TYPE</span><i>_</i></div>;
  }

  if (!usuario) return <Login onEntrar={setUsuario} />;
  return (
    <div className="app-shell">
      {vista === "inicio" ? (
        <Inicio usuario={usuario} onLecciones={() => setVista("lecciones")} onLibre={() => setVista("libre")} onPerfil={() => setVista("perfil")} onSalir={salir} />
      ) : vista === "lecciones" ? (
        <section className="vista-contenido pantalla-entrenamiento vista-lecciones">
          <div className="vista-cabecera">
            <button className="boton-texto" onClick={() => setVista("inicio")}>← INICIO</button>
            <span className="usuario-chip">{usuario}</span>
            <button className="boton-salir" onClick={salir}>Salir</button>
          </div>
          <Lecciones usuario={usuario} fuente={fuente} tamano={tamano} onFuente={cambiarFuente} onTamano={cambiarTamano} />
        </section>
      ) : vista === "perfil" ? (
        <Perfil usuario={usuario} onInicio={() => setVista("inicio")} onSalir={salir} />
      ) : (
        <Test usuario={usuario} categorias={categoriasPractica} onCategoriasChange={setCategoriasPractica} onSalir={salir} onInicio={() => setVista("inicio")} fuente={fuente} tamano={tamano} onFuente={cambiarFuente} onTamano={cambiarTamano} />
      )}
    </div>
  );
}
export default App;
