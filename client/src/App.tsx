import { useState } from "react";
import "./App.css";

const TEXTO =
  "el sol sale por la mañana y los pájaros cantan mientras la ciudad despierta poco a poco con el ruido de los autos y las voces de la gente";

function App() {
  const [escrito, setEscrito] = useState("");

  return (
    <div>
      <h1>Fasttype</h1>
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
        onChange={(e) => setEscrito(e.target.value)}
      />
    </div>
  );
}

export default App;