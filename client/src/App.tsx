import { useState } from "react";

const TEXTO =
  "el sol sale por la mañana y los pájaros cantan mientras la ciudad despierta poco a poco con el ruido de los autos y las voces de la gente";

function App() {
  const [escrito, setEscrito] = useState("");

  return (
    <div>
      <h1>Fasttype</h1>
      <p>{TEXTO}</p>
      <input
        type="text"
        value={escrito}
        onChange={(e) => setEscrito(e.target.value)}
      />
      <p>Has escrito {escrito.length} caracteres</p>
    </div>
  );
}

export default App;