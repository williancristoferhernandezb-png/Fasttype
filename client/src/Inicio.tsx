type Props = {
  usuario: string;
  onLecciones: () => void;
  onLibre: () => void;
  onPerfil: () => void;
  onSalir: () => void;
};

export default function Inicio({ usuario, onLecciones, onLibre, onPerfil, onSalir }: Props) {
  return (
    <main className="inicio">
      <header className="topbar">
        <a className="marca" href="#" onClick={(e) => e.preventDefault()}>
          FAST<span>TYPE</span><i>.</i>
        </a>
        <div className="topbar-derecha">
          <span className="estado-online"><i /> SISTEMA ACTIVO</span>
          <button className="boton-texto boton-perfil" onClick={onPerfil}>Mi perfil <span>↗</span></button>
          <span className="usuario-chip">{usuario}</span>
          <button className="boton-salir" onClick={onSalir}>Salir</button>
        </div>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow"><span /> TRAINING PLATFORM / 01</p>
          <h1>UNLOCK<br /><span>YOUR SPEED.</span></h1>
          <p className="hero-text">
            Entrena. Mejora. Supera tus límites.<br />
            Cada pulsación te acerca a tu mejor versión.
          </p>
          <div className="hero-actions">
            <button className="boton-principal" onClick={onLecciones}>
              EMPEZAR A ENTRENAR <span>↗</span>
            </button>
            <button className="boton-texto" onClick={onLibre}>Prueba de velocidad <span>→</span></button>
          </div>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="anillo anillo-uno" />
          <div className="anillo anillo-dos" />
          <div className="nucleo"><span>FT</span><small>GO FASTER</small></div>
          <span className="art-tag tag-top">PRECISION // SPEED</span>
          <span className="art-tag tag-bottom">MODE: TRAINING</span>
          <span className="art-cross">+</span>
        </div>
        <div className="hero-index">01 <span>/ 03</span></div>
      </section>

      <section className="zona-cursos">
        <div className="seccion-cabecera">
          <div>
            <p className="eyebrow">SELECT YOUR TRAINING</p>
            <h2>ELIGE TU <span>RUTA.</span></h2>
          </div>
          <p className="seccion-nota">Tres caminos. Un objetivo: dominar el teclado.</p>
        </div>
        <div className="cursos-grid">
          <button className="curso-card curso-alfa" onClick={onLecciones}>
            <span className="curso-numero">01 / CORE</span>
            <span className="curso-icono">⌨</span>
            <strong>ALFA</strong>
            <span className="curso-desc">Letras, palabras y precisión al escribir.</span>
            <span className="curso-link">ENTRAR AL CURSO <b>↗</b></span>
          </button>
          <button className="curso-card curso-numpad" onClick={onLecciones}>
            <span className="curso-numero">02 / NUMERIC</span>
            <span className="curso-icono">▦</span>
            <strong>NUMPAD</strong>
            <span className="curso-desc">Velocidad y control con el teclado numérico.</span>
            <span className="curso-link">ENTRAR AL CURSO <b>↗</b></span>
          </button>
          <button className="curso-card curso-fila" onClick={onLecciones}>
            <span className="curso-numero">03 / NUMERIC</span>
            <span className="curso-icono">⌗</span>
            <strong>FILA SUPERIOR</strong>
            <span className="curso-desc">Domina los números de la fila superior.</span>
            <span className="curso-link">ENTRAR AL CURSO <b>↗</b></span>
          </button>
        </div>
      </section>

      <footer className="inicio-footer">
        <span>FASTTYPE <b>///</b> TOXIC POWER TRAINING</span>
        <span>FOCUS. TYPE. REPEAT.</span>
      </footer>
    </main>
  );
}
