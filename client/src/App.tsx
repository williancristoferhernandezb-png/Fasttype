import { useState, useEffect, useRef } from "react";
import "./App.css";
import Login from "./Login";
import { obtenerNombre, cerrarSesion } from "./api";

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
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  useEffect(() => {
    if (!iniciado || terminado) return;

    const intervalo = setInterval(() => {
      setTiempo((t) => t - 1);
    }, 1000);

    return () => clearInterval(intervalo);
  }, [iniciado, terminado]);

  function manejarCambio(e: React.ChangeEvent<HTMLInputElement>) {
    if (terminado) return;
    if (!iniciado) setIniciado(true);
    setEscrito(e.target.value);
  }

  return (
    <div>
      <h1>Fasttype</h1>
       <p>
        Usuario: {usuario} <button onClick={onSalir}>Salir</button>
      </p>
      <p className="tiempo">Tiempo: {tiempo}s</p>
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
      />
      <button onClick={reiniciar}>Reiniciar</button>
      {terminado && (
        <div>
          <p>¡Tiempo!</p>
          <p>WPM: {wpm}</p>
          <p>Precisión: {precision}%</p>
        </div>
      )}
    </div>
  );
}

function App() {
  const [usuario, setUsuario] = useState<string | null>(obtenerNombre());

  function salir() {
    cerrarSesion();
    setUsuario(null);
  }

  if (!usuario) return <Login onEntrar={setUsuario} />;
  return <Test usuario={usuario} onSalir={salir} />;
}

export default App;