import { createRoot } from "react-dom/client";
import Lecciones from "./Lecciones";
import { CURSOS } from "./curriculo";

const usuario = "fasttype-e2e";
const params = new URLSearchParams(window.location.search);
const caso = params.get("case") ?? "space";
const indiceCero = CURSOS.numpad.findIndex((leccion) =>
  leccion.titulo.includes("Conoce las teclas 0")
);

localStorage.setItem("seccion_lecciones", "numerica");
localStorage.setItem("variante_numerica", "numpad");
localStorage.setItem(
  `progreso_numpad_${usuario}`,
  String(caso === "zero" ? indiceCero : 0)
);

createRoot(document.getElementById("root")!).render(
  <Lecciones
    usuario={usuario}
    fuente="Inter"
    tamano={32}
    onFuente={() => {}}
    onTamano={() => {}}
  />,
);
