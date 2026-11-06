import { useState, useEffect } from "react";
import "./App.css";

const TEXTO =
  "el sol sale por la mañana y los pájaros cantan mientras la ciudad despierta poco a poco con el ruido de los autos y las voces de la gente";

const DURACION = 30;

function App() {
  const [escrito, setEscrito] = useState("");
  const [tiempo, setTiempo] = useState(DURACION);
  const [iniciado, setIniciado] = useState(false);

  const terminado = tiempo === 0;
    function reiniciar() {
    setEscrito("");
    setTiempo(DURACION);
    setIniciado(false);
  }
  let correctos = 0;
  for (let i = 0; i < escrito.length; i++) {
    if (escrito[i] === TEXTO[i]) correctos++;
  }

  const minutos = DURACION / 60;
  const wpm = Math.round(correctos / 5 / minutos);
  const precision =
    escrito.length === 0 ? 0 : Math.round((correctos / escrito.length) * 100);

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
      <p className="tiempo">Tiempo: {tiempo}s</p>
      <p className="texto">
        {TEXTO.split("").map((letra, i) => {
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
        type="text"
        value={escrito}
        onChange={manejarCambio}
        disabled={terminado}
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

export default App;