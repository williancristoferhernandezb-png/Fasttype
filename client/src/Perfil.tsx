import { useEffect, useMemo, useState } from "react";
import {
  pedirResumenPerfil,
  pedirHistorialPerfil,
  pedirRankingPerfil,
  type ResumenPerfil,
  type ResultadoPractica,
  type EntradaRanking,
} from "./api";

type Props = {
  usuario: string;
  onInicio: () => void;
  onSalir: () => void;
};

function tiempoLegible(segundos: number) {
  const total = Math.max(0, Math.floor(segundos));
  const horas = Math.floor(total / 3600);
  const minutos = Math.floor((total % 3600) / 60);
  if (horas > 0) return `${horas} h ${minutos} min`;
  if (minutos > 0) return `${minutos} min`;
  return `${total} s`;
}

export default function Perfil({ usuario, onInicio, onSalir }: Props) {
  const [resumen, setResumen] = useState<ResumenPerfil | null>(null);
  const [historial, setHistorial] = useState<ResultadoPractica[]>([]);
  const [ranking, setRanking] = useState<EntradaRanking[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;
    Promise.all([pedirResumenPerfil(), pedirHistorialPerfil(), pedirRankingPerfil()])
      .then(([r, h, g]) => {
        if (!activo) return;
        setResumen(r);
        setHistorial(h);
        setRanking(g);
      })
      .catch((e: unknown) => {
        if (activo) setError(e instanceof Error ? e.message : "No se pudieron cargar las estadísticas.");
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => { activo = false; };
  }, []);

  const posicion = useMemo(
    () => ranking.findIndex((entrada) => entrada.nombre === usuario),
    [ranking, usuario]
  );

  const segundosTotales = Number(resumen?.segundos_totales ?? 0);

  return (
    <main className="perfil-pagina">
      <header className="topbar perfil-topbar">
        <a className="marca" href="#" onClick={(e) => e.preventDefault()}>
          FAST<span>TYPE</span><i>.</i>
        </a>
        <div className="topbar-derecha">
          <button className="boton-texto" onClick={onInicio}>← INICIO</button>
          <span className="usuario-chip">{usuario}</span>
          <button className="boton-salir" onClick={onSalir}>Salir</button>
        </div>
      </header>

      <section className="perfil-contenido">
        <div className="perfil-intro">
          <div className="perfil-avatar" aria-hidden="true">{usuario.slice(0, 1).toUpperCase()}</div>
          <div>
            <p className="eyebrow"><span /> TU ESPACIO PERSONAL</p>
            <h1>MI <span>PERFIL.</span></h1>
            <p className="perfil-subtitulo">Tu evolución, tus resultados y tu posición en Fasttype.</p>
          </div>
        </div>

        {cargando ? (
          <p className="perfil-mensaje">Cargando tus estadísticas...</p>
        ) : error ? (
          <div className="perfil-mensaje perfil-error">{error}</div>
        ) : (
          <>
            <section className="perfil-seccion">
              <div className="perfil-seccion-titulo">
                <div><p className="eyebrow">OVERVIEW / 01</p><h2>RENDIMIENTO GENERAL</h2></div>
                <span>Todos tus resultados guardados</span>
              </div>
              <div className="perfil-metricas">
                <article className="perfil-metrica"><span>VELOCIDAD PROMEDIO</span><strong>{resumen?.promedio_wpm ?? 0}</strong><small>palabras por minuto</small></article>
                <article className="perfil-metrica"><span>MEJOR VELOCIDAD</span><strong>{resumen?.mejor_wpm ?? 0}</strong><small>récord personal · PPM</small></article>
                <article className="perfil-metrica"><span>PRECISIÓN PROMEDIO</span><strong>{resumen?.promedio_precision ?? 0}<i>%</i></strong><small>exactitud al escribir</small></article>
                <article className="perfil-metrica"><span>PRÁCTICAS REALIZADAS</span><strong>{resumen?.practicas ?? 0}</strong><small>pruebas completadas</small></article>
                <article className="perfil-metrica"><span>TIEMPO PRACTICADO</span><strong className="perfil-tiempo">{tiempoLegible(segundosTotales)}</strong><small>tiempo acumulado</small></article>
              </div>
            </section>

            <div className="perfil-dos-columnas">
              <section className="perfil-seccion perfil-panel">
                <div className="perfil-seccion-titulo">
                  <div><p className="eyebrow">ACTIVITY / 02</p><h2>HISTORIAL RECIENTE</h2></div>
                  <span>Últimas 50 pruebas</span>
                </div>
                {historial.length === 0 ? (
                  <p className="perfil-vacio">Aún no tienes pruebas registradas. Completa una prueba libre para comenzar tu historial.</p>
                ) : (
                  <div className="perfil-tabla-wrap">
                    <table className="perfil-tabla">
                      <thead><tr><th>FECHA</th><th>VELOCIDAD</th><th>PRECISIÓN</th><th>DURACIÓN</th></tr></thead>
                      <tbody>
                        {historial.map((r) => (
                          <tr key={r.id}>
                            <td>{new Date(r.creado_en).toLocaleDateString()}</td>
                            <td><strong>{r.wpm} PPM</strong></td>
                            <td>{r.precision}%</td>
                            <td>{tiempoLegible(r.segundos)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section className="perfil-seccion perfil-panel">
                <div className="perfil-seccion-titulo">
                  <div><p className="eyebrow">GLOBAL / 03</p><h2>RANKING</h2></div>
                  <span>Top 10 · mejor PPM</span>
                </div>
                {ranking.length === 0 ? (
                  <p className="perfil-vacio">El ranking todavía no tiene resultados.</p>
                ) : (
                  <ol className="perfil-ranking">
                    {ranking.map((r, i) => (
                      <li key={r.nombre} className={r.nombre === usuario ? "perfil-ranking-actual" : ""}>
                        <span className="perfil-ranking-pos">#{i + 1}</span>
                        <span className="perfil-ranking-nombre">{r.nombre}{r.nombre === usuario ? " · Tú" : ""}</span>
                        <strong>{r.mejor_wpm} <small>PPM</small></strong>
                      </li>
                    ))}
                  </ol>
                )}
                <div className="perfil-posicion">
                  <span>TU POSICIÓN</span>
                  <strong>{posicion >= 0 ? `#${posicion + 1}` : "Fuera del top 10"}</strong>
                </div>
              </section>
            </div>
            <p className="perfil-nota">Las estadísticas de esta primera versión corresponden a las pruebas libres guardadas en tu cuenta. El progreso de los cursos se incorporará en una siguiente etapa.</p>
          </>
        )}
      </section>
    </main>
  );
}
