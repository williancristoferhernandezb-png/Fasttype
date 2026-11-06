import { useState, useEffect, useRef } from "react";
import "./App.css";
import Login from "./Login";
import Lecciones from "./Lecciones";
import {
  obtenerNombre,
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

function Test({ usuario, onSalir }: { usuario: string; onSalir: () => void }) {
  const [texto, setTexto] = useState(textoAleatorio);
  const [escrito, setEscrito] = useState("");
  const [tiempo, setTiempo] = useState(DURACION);
  const [iniciado, setIniciado] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [historial, setHistorial] = useState<
    { id: number; wpm: number; precision: number; creado_en: string }[]
  >([]);
  const [ranking, setRanking] = useState<
    { nombre: string; mejor_wpm: number }[]
  >([]);
  const [guardado, setGuardado] = useState(false);

  async function cargarListas() {
    setHistorial(await pedirHistorial());
    setRanking(await pedirRanking());
  }

  useEffect(() => {
    cargarListas();
  }, []);

  const textoCompleto = escrito.length === texto.length;
  const terminado = tiempo === 0 || textoCompleto;

  let correctos = 0;
  for (let i = 0; i < escrito.length; i++) {
    if (escrito[i] === texto[i]) correctos++;
  }

  const segundosUsados = Math.max(DURACION - tiempo, 1);
  const wpm = Math.round(correctos / 5 / (segundosUsados / 60));
  const precision =
    escrito.length === 0 ? 0 : Math.round((correctos / escrito.length) * 100);

  function reiniciar() {
    setTexto(textoAleatorio());
    setEscrito("");
    setTiempo(DURACION);
    setIniciado(false);
    setGuardado(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  useEffect(() => {
    if (!iniciado || terminado) return;

    const intervalo = setInterval(() => {
      setTiempo((t) => t - 1);
    }, 1000);

    return () => clearInterval(intervalo);
  }, [iniciado, terminado]);

  useEffect(() => {
    if (!terminado || guardado || escrito.length === 0) return;
    setGuardado(true);
    guardarResultado(wpm, precision, segundosUsados)
      .then(cargarListas)
      .catch(() => {});
  }, [terminado]);

  function manejarCambio(e: React.ChangeEvent<HTMLInputElement>) {
    if (terminado) return;
    if (!iniciado) setIniciado(true);
    setEscrito(e.target.value);
  }

  return (
    <div>
      <h1>Fasttype</h1>
      <div className="barra">
        <span>Usuario: {usuario}</span>
        <button onClick={onSalir}>Salir</button>
      </div>

      <p className="tiempo">{tiempo}s</p>

      <p className="texto">
        {texto.split("").map((letra, i) => {
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
        onChange={manejarCambio}
        disabled={terminado}
        autoFocus
        placeholder="Empieza a escribir aquí..."
      />

      <div className="acciones">
        <button onClick={reiniciar}>Reiniciar</button>
      </div>

      {terminado && (
        <div className="resultado">
          <div>
            <strong>{wpm}</strong>WPM
          </div>
          <div>
            <strong>{precision}%</strong>Precisión
          </div>
        </div>
      )}

      <div className="paneles">
        <div className="panel">
          <h3>Tu historial</h3>
          <ul>
            {historial.slice(0, 5).map((r) => (
              <li key={r.id}>
                {r.wpm} WPM · {r.precision}% ·{" "}
                {new Date(r.creado_en).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </div>
        <div className="panel">
          <h3>Ranking global</h3>
          <ol>
            {ranking.map((r) => (
              <li key={r.nombre}>
                {r.nombre}: {r.mejor_wpm} WPM
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [usuario, setUsuario] = useState<string | null>(obtenerNombre());
  const [vista, setVista] = useState<"lecciones" | "libre">("lecciones");

  function salir() {
    cerrarSesion();
    setUsuario(null);
  }

  if (!usuario) return <Login onEntrar={setUsuario} />;

  return (
    <div>
      <nav className="menu">
        <button
          className={vista === "lecciones" ? "activo" : ""}
          onClick={() => setVista("lecciones")}
        >
          Lecciones
        </button>
        <button
          className={vista === "libre" ? "activo" : ""}
          onClick={() => setVista("libre")}
        >
          Prueba libre
        </button>
      </nav>
      {vista === "lecciones" ? (
        <Lecciones usuario={usuario} />
      ) : (
        <Test usuario={usuario} onSalir={salir} />
      )}
    </div>
  );
}

export default App;