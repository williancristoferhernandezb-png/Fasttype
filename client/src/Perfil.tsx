import { useEffect, useMemo, useState } from "react";
import {
  pedirResumenPerfil, pedirHistorialPerfil, pedirRankingPerfil, pedirActividadPerfil, pedirConfianzaTeclas,
  type ResumenPerfil, type ResultadoPractica, type EntradaRanking, type ActividadDiaria, type ConfianzaTecla,
} from "./api";

type Props = { usuario: string; onInicio: () => void; onSalir: () => void };

function tiempoLegible(segundos: number) {
  const total = Math.max(0, Math.floor(segundos));
  const horas = Math.floor(total / 3600);
  const minutos = Math.floor((total % 3600) / 60);
  if (horas > 0) return `${horas} h ${minutos} min`;
  if (minutos > 0) return `${minutos} min`;
  return `${total} s`;
}

function fechaLocal(fecha: string) {
  const [y, m, d] = fecha.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function GraficaMejora({ actividad }: { actividad: ActividadDiaria[] }) {
  const datos = actividad.slice(-30);
  if (datos.length < 2) {
    return <p className="perfil-vacio">Necesitas practicar en al menos dos días distintos para mostrar tu evolución.</p>;
  }
  const valores = datos.map(d => d.promedio_wpm);
  const max = Math.max(...valores, 1);
  const min = Math.min(...valores, 0);
  const rango = Math.max(max - min, 5);
  const puntos = valores.map((v, i) => {
    const x = 12 + (i * 576) / Math.max(valores.length - 1, 1);
    const y = 112 - ((v - min) / rango) * 88;
    return [x, y] as const;
  });
  const linea = puntos.map(([x, y]) => `${x},${y}`).join(" ");
  const area = `12,120 ${linea} 588,120`;
  return (
    <div className="perfil-grafica-wrap">
      <div className="perfil-grafica-resumen">
        <strong>{datos[datos.length - 1].promedio_wpm} <small>PPM</small></strong>
        <span>Promedio de la última jornada registrada</span>
      </div>
      <svg className="perfil-grafica" viewBox="0 0 600 130" role="img" aria-label="Evolución del promedio de palabras por minuto por día">
        <defs><linearGradient id="perfil-area" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#b6ff00" stopOpacity=".22"/><stop offset="100%" stopColor="#b6ff00" stopOpacity="0"/></linearGradient></defs>
        {[24,68,112].map(y => <line key={y} x1="12" x2="588" y1={y} y2={y} stroke="rgba(255,255,255,.08)" strokeDasharray="3 5"/>)}
        <polygon points={area} fill="url(#perfil-area)"/>
        <polyline points={linea} fill="none" stroke="#b6ff00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        {puntos.map(([x,y],i) => <circle key={i} cx={x} cy={y} r="3" fill="#b6ff00"/>)}
      </svg>
      <div className="perfil-grafica-fechas"><span>{fechaLocal(datos[0].fecha).toLocaleDateString()}</span><span>{fechaLocal(datos[datos.length-1].fecha).toLocaleDateString()}</span></div>
    </div>
  );
}

function CalendarioActividad({ actividad }: { actividad: ActividadDiaria[] }) {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = hoy.getMonth();
  const primerDia = new Date(anio, mes, 1).getDay();
  const diasMes = new Date(anio, mes + 1, 0).getDate();
  const conteo = new Map(actividad.map(a => [a.fecha, a.practicas]));
  const celdas = [...Array(primerDia).fill(null), ...Array.from({length:diasMes}, (_,i)=>i+1)];
  return (
    <div className="perfil-calendario">
      <div className="perfil-calendario-mes">{hoy.toLocaleDateString("es", {month:"long",year:"numeric"})}</div>
      <div className="perfil-calendario-grid">
        {["D","L","M","M","J","V","S"].map((d,i)=><span className="perfil-dia-semana" key={i}>{d}</span>)}
        {celdas.map((dia,i) => {
          if (!dia) return <span className="perfil-dia-vacio" key={`v${i}`}/>;
          const fecha = `${anio}-${String(mes+1).padStart(2,"0")}-${String(dia).padStart(2,"0")}`;
          const cantidad = conteo.get(fecha) ?? 0;
          return <span key={fecha} title={cantidad ? `${cantidad} prácticas` : "Sin práctica"} className={`perfil-dia ${cantidad ? "perfil-dia-activo" : ""} ${dia === hoy.getDate() ? "perfil-dia-hoy" : ""}`}>{dia}</span>;
        })}
      </div>
      <div className="perfil-calendario-leyenda"><i/> Día con práctica <span>{actividad.reduce((s,a)=>s+a.practicas,0)} prácticas en 90 días</span></div>
    </div>
  );
}


const FILAS_TECLADO: { codigo: string; etiqueta: string }[][] = [
  ["Backquote","Digit1","Digit2","Digit3","Digit4","Digit5","Digit6","Digit7","Digit8","Digit9","Digit0","Minus","Equal"].map((codigo,i)=>({codigo,etiqueta:["º","1","2","3","4","5","6","7","8","9","0","'","+"][i]})),
  ["KeyQ","KeyW","KeyE","KeyR","KeyT","KeyY","KeyU","KeyI","KeyO","KeyP","BracketLeft","BracketRight"].map((codigo,i)=>({codigo,etiqueta:["Q","W","E","R","T","Y","U","I","O","P","´","+"][i]})),
  ["KeyA","KeyS","KeyD","KeyF","KeyG","KeyH","KeyJ","KeyK","KeyL","Semicolon","Quote"].map((codigo,i)=>({codigo,etiqueta:["A","S","D","F","G","H","J","K","L","Ñ","´"][i]})),
  ["KeyZ","KeyX","KeyC","KeyV","KeyB","KeyN","KeyM","Comma","Period","Slash"].map((codigo,i)=>({codigo,etiqueta:["Z","X","C","V","B","N","M",",",".","-"][i]})),
];

function TecladoConfianza({ datos }: { datos: ConfianzaTecla[] }) {
  const mapa = new Map(datos.map(t => [t.codigo,t]));
  const clase = (t?: ConfianzaTecla) => !t || t.intentos < 5 ? "sin-datos" : t.precision >= 95 ? "dominio-alto" : t.precision >= 80 ? "dominio-medio" : "dominio-bajo";
  const tecla = (codigo: string, etiqueta: string) => {
    const t = mapa.get(codigo);
    const texto = t ? `${t.etiqueta} · ${t.precision}% · ${t.intentos} intentos` : `${etiqueta} · Datos insuficientes`;
    return <span key={codigo} title={texto} aria-label={texto} className={`confianza-tecla ${clase(t)}`}>{t?.etiqueta ?? etiqueta}</span>;
  };
  return (
    <div className="confianza-teclado">
      {FILAS_TECLADO.map((fila,i)=><div className={`confianza-fila confianza-fila-${i}`} key={i}>{fila.map(k=>tecla(k.codigo,k.etiqueta))}</div>)}
      <div className="confianza-fila confianza-fila-espacio">{tecla("Space","ESPACIO")}</div>
      <div className="confianza-leyenda">
        <span><i className="dominio-alto"/>Dominada · 95–100%</span>
        <span><i className="dominio-medio"/>En progreso · 80–94%</span>
        <span><i className="dominio-bajo"/>Necesita práctica · 0–79%</span>
        <span><i className="sin-datos"/>Sin datos</span>
      </div>
    </div>
  );
}

export default function Perfil({ usuario, onInicio, onSalir }: Props) {
  const [resumen, setResumen] = useState<ResumenPerfil | null>(null);
  const [historial, setHistorial] = useState<ResultadoPractica[]>([]);
  const [ranking, setRanking] = useState<EntradaRanking[]>([]);
  const [actividad, setActividad] = useState<ActividadDiaria[]>([]);\n  const [confianza, setConfianza] = useState<ConfianzaTecla[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;
    Promise.all([pedirResumenPerfil(), pedirHistorialPerfil(), pedirRankingPerfil(), pedirActividadPerfil(), pedirConfianzaTeclas()])
      .then(([r,h,g,a,t]) => {
        if (!activo) return;
        setResumen(r); setHistorial(h); setRanking(g); setActividad(a); setConfianza(t);
      })
      .catch((e: unknown) => {
        if (activo) setError(e instanceof Error ? e.message : "No se pudieron cargar las estadísticas.");
      })
      .finally(() => { if (activo) setCargando(false); });
    return () => { activo = false; };
  }, []);

  const posicion = useMemo(() => ranking.findIndex(e => e.nombre === usuario), [ranking, usuario]);
  const segundosTotales = Number(resumen?.segundos_totales ?? 0);

  return (
    <main className="perfil-pagina">
      <header className="topbar perfil-topbar">
        <a className="marca" href="#" onClick={(e) => e.preventDefault()}>FAST<span>TYPE</span><i>.</i></a>
        <h1 className="perfil-titulo">PERFIL</h1>
        <div className="topbar-derecha">
          <button className="boton-texto" onClick={onInicio}>← INICIO</button>
          <span className="usuario-chip">{usuario}</span>
          <button className="boton-salir" onClick={onSalir}>Salir</button>
        </div>
      </header>

      <section className="perfil-contenido">
        {cargando ? <p className="perfil-mensaje">Cargando estadísticas...</p> :
        error ? <div className="perfil-mensaje perfil-error">{error}</div> : <>
          <section className="perfil-seccion">
            <div className="perfil-seccion-titulo"><div><p className="eyebrow">01 / RESUMEN</p><h2>RENDIMIENTO GENERAL</h2></div></div>
            <div className="perfil-metricas">
              <article className="perfil-metrica"><span>VELOCIDAD PROMEDIO</span><strong>{resumen?.promedio_wpm ?? 0}</strong><small>palabras por minuto</small></article>
              <article className="perfil-metrica"><span>MEJOR VELOCIDAD</span><strong>{resumen?.mejor_wpm ?? 0}</strong><small>récord personal · PPM</small></article>
              <article className="perfil-metrica"><span>PRECISIÓN PROMEDIO</span><strong>{resumen?.promedio_precision ?? 0}<i>%</i></strong><small>exactitud al escribir</small></article>
              <article className="perfil-metrica"><span>PRÁCTICAS REALIZADAS</span><strong>{resumen?.practicas ?? 0}</strong><small>pruebas completadas</small></article>
              <article className="perfil-metrica"><span>TIEMPO PRACTICADO</span><strong className="perfil-tiempo">{tiempoLegible(segundosTotales)}</strong><small>tiempo acumulado</small></article>
            </div>
          </section>

          <div className="perfil-actividad-grid">
            <section className="perfil-seccion perfil-panel">
              <div className="perfil-seccion-titulo"><div><p className="eyebrow">02 / PROGRESO</p><h2>EVOLUCIÓN DE VELOCIDAD</h2></div><span>Promedio diario · últimos 30 días activos</span></div>
              <GraficaMejora actividad={actividad}/>
            </section>
            <section className="perfil-seccion perfil-panel">
              <div className="perfil-seccion-titulo"><div><p className="eyebrow">03 / CONSTANCIA</p><h2>CALENDARIO</h2></div></div>
              <CalendarioActividad actividad={actividad}/>
            </section>
          </div>

          <section className="perfil-seccion perfil-panel perfil-panel-confianza">
            <div className="perfil-seccion-titulo"><div><p className="eyebrow">04 / TÉCNICA</p><h2>KEYBOARD CONFIDENCE</h2></div><span>Precisión por tecla · pruebas libres</span></div>
            <TecladoConfianza datos={confianza}/>
            <p className="perfil-confianza-nota">Cada tecla refleja los aciertos frente a sus intentos registrados. Practica más para completar el mapa.</p>
          </section>

          <div className="perfil-dos-columnas">
            <section className="perfil-seccion perfil-panel">
              <div className="perfil-seccion-titulo"><div><p className="eyebrow">05 / ACTIVIDAD</p><h2>HISTORIAL RECIENTE</h2></div><span>Últimas 50 pruebas</span></div>
              {historial.length === 0 ? <p className="perfil-vacio">Aún no tienes pruebas registradas. Completa una prueba libre para comenzar tu historial.</p> :
                <div className="perfil-tabla-wrap"><table className="perfil-tabla">
                  <thead><tr><th>FECHA</th><th>VELOCIDAD</th><th>PRECISIÓN</th><th>DURACIÓN</th></tr></thead>
                  <tbody>{historial.map(r=><tr key={r.id}><td>{new Date(r.creado_en).toLocaleDateString()}</td><td><strong>{r.wpm} PPM</strong></td><td>{r.precision}%</td><td>{tiempoLegible(r.segundos)}</td></tr>)}</tbody>
                </table></div>}
            </section>
            <section className="perfil-seccion perfil-panel">
              <div className="perfil-seccion-titulo"><div><p className="eyebrow">06 / GLOBAL</p><h2>RANKING</h2></div><span>Top 10 · mejor PPM</span></div>
              {ranking.length === 0 ? <p className="perfil-vacio">El ranking todavía no tiene resultados.</p> :
                <ol className="perfil-ranking">{ranking.map((r,i)=><li key={r.nombre} className={r.nombre===usuario?"perfil-ranking-actual":""}><span className="perfil-ranking-pos">#{i+1}</span><span className="perfil-ranking-nombre">{r.nombre}{r.nombre===usuario?" · Tú":""}</span><strong>{r.mejor_wpm} <small>PPM</small></strong></li>)}</ol>}
              <div className="perfil-posicion"><span>TU POSICIÓN</span><strong>{posicion>=0?`#${posicion+1}`:"Fuera del top 10"}</strong></div>
            </section>
          </div>
          <p className="perfil-nota">La evolución y el calendario reflejan las pruebas libres guardadas en tu cuenta. El progreso de los cursos se incorporará en una siguiente etapa.</p>
        </>}
      </section>
    </main>
  );
}
