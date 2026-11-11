import { useState, useEffect, useRef } from "react";
import "./App.css";
import Login from "./Login";
import Inicio from "./Inicio";
import Lecciones from "./Lecciones";
import {
  obtenerSesion,
  cerrarSesion,
  guardarResultado,
  pedirHistorial,
  pedirRanking,
} from "./api";

const TEXTOS = [
  "el sol sale por la mañana y los pájaros cantan mientras la ciudad despierta poco a poco con el ruido de los autos y las voces de la gente",
  "programar es resolver problemas pequeños uno a uno hasta construir algo grande que funcione para muchas personas en cualquier parte del mundo",
  "cada día que practico escribo un poco más rápido y cometo menos errores porque la constancia es lo que de verdad marca la diferencia",
  "la tecnología avanza muy deprisa y quienes aprenden todos los días encuentran siempre nuevas oportunidades para crecer y mejorar su trabajo",
];
const DURACION = 30;
function textoAleatorio() {
  return TEXTOS[Math.floor(Math.random() * TEXTOS.length)];
}

function Test({ usuario, onSalir, onInicio }: { usuario: string; onSalir: () => void; onInicio: () => void }) {
  const [texto, setTexto] = useState(textoAleatorio);
  const [escrito, setEscrito] = useState("");
  const [tiempo, setTiempo] = useState(DURACION);
  const [iniciado, setIniciado] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [historial, setHistorial] = useState<{ id: number; wpm: number; precision: number; creado_en: string }[]>([]);
  const [ranking, setRanking] = useState<{ nombre: string; mejor_wpm: number }[]>([]);
  const guardadoRef = useRef(false);

  useEffect(() => {
    let activo = true;
    Promise.all([pedirHistorial(), pedirRanking()])
      .then(([h, r]) => { if (activo) { setHistorial(h); setRanking(r); } })
      .catch(() => {});
    return () => { activo = false; };
  }, []);

  const textoCompleto = escrito.length === texto.length;
  const terminado = tiempo === 0 || textoCompleto;
  let correctos = 0;
  for (let i = 0; i < escrito.length; i++) if (escrito[i] === texto[i]) correctos++;
  const segundosUsados = Math.max(DURACION - tiempo, 1);
  const wpm = Math.round(correctos / 5 / (segundosUsados / 60));
  const precision = escrito.length === 0 ? 0 : Math.round((correctos / escrito.length) * 100);

  function reiniciar() {
    setTexto(textoAleatorio()); setEscrito(""); setTiempo(DURACION); setIniciado(false);
    guardadoRef.current = false;
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  useEffect(() => {
    if (!iniciado || terminado) return;
    const intervalo = setInterval(() => setTiempo((t) => t - 1), 1000);
    return () => clearInterval(intervalo);
  }, [iniciado, terminado]);

  useEffect(() => {
    if (!terminado || guardadoRef.current || escrito.length === 0) return;
    guardadoRef.current = true;
    guardarResultado(wpm, precision, segundosUsados)
      .then(() => Promise.all([pedirHistorial(), pedirRanking()]))
      .then(([h, r]) => { setHistorial(h); setRanking(r); })
      .catch(() => {});
  }, [terminado, escrito.length, wpm, precision, segundosUsados]);

  function manejarCambio(e: React.ChangeEvent<HTMLInputElement>) {
    if (terminado) return;
    if (!iniciado) setIniciado(true);
    setEscrito(e.target.value);
  }

  return (
    <section className="vista-contenido pantalla-entrenamiento prueba-libre">
      <div className="vista-cabecera">
        <button className="boton-texto" onClick={onInicio}>← INICIO</button>
        <span className="usuario-chip">{usuario}</span>
        <button className="boton-salir" onClick={onSalir}>Salir</button>
      </div>
      <h1>PRUEBA <span>LIBRE.</span></h1>
      <p className="tiempo">{tiempo}s</p>
      <div
        className="zona-escritura"
        onClick={() => inputRef.current?.focus()}
        role="group"
        aria-label="Área de escritura. Haz clic aquí y escribe el texto mostrado."
      >
        <p className="texto texto-flotante" aria-label={texto}>
          {texto.split("").map((letra, i) => {
            let clase = "pendiente";
            if (i < escrito.length) clase = escrito[i] === letra ? "correcta" : "incorrecta";
            return (
              <span key={i} className={`caracter-escritura ${clase}`}>
                {i === escrito.length && !terminado && <span className="cursor-escritura" aria-hidden="true" />}
                {letra === " " ? "\u00a0" : letra}
              </span>
            );
          })}
          {escrito.length === texto.length && <span className="cursor-escritura cursor-final" aria-hidden="true" />}
        </p>
        <input
          ref={inputRef}
          className="input-escritura-invisible"
          type="text"
          value={escrito}
          onChange={manejarCambio}
          onPaste={(e) => e.preventDefault()}
          disabled={terminado}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          autoFocus
          aria-label="Escribe aquí el texto de la prueba libre"
        />
      </div>
      <div className="acciones"><button onClick={reiniciar}>Reiniciar prueba</button></div>
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
  const [vista, setVista] = useState<"inicio" | "lecciones" | "libre">("inicio");

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
        <Inicio usuario={usuario} onLecciones={() => setVista("lecciones")} onLibre={() => setVista("libre")} onSalir={salir} />
      ) : vista === "lecciones" ? (
        <section className="vista-contenido pantalla-entrenamiento vista-lecciones">
          <div className="vista-cabecera">
            <button className="boton-texto" onClick={() => setVista("inicio")}>← INICIO</button>
            <span className="usuario-chip">{usuario}</span>
            <button className="boton-salir" onClick={salir}>Salir</button>
          </div>
          <Lecciones usuario={usuario} />
        </section>
      ) : (
        <Test usuario={usuario} onSalir={salir} onInicio={() => setVista("inicio")} />
      )}
    </div>
  );
}
export default App;
