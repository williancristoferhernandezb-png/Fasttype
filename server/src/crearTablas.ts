import { pool } from "./db";

async function crearTablas() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(50) UNIQUE NOT NULL,
      contrasena_hash TEXT NOT NULL,
      creado_en TIMESTAMP DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS resultados (
      id SERIAL PRIMARY KEY,
      usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
      wpm INTEGER NOT NULL,
      precision INTEGER NOT NULL,
      segundos INTEGER NOT NULL,
      creado_en TIMESTAMP DEFAULT NOW()
    );
  `);

  console.log("Tablas creadas");
  await pool.end();
}

crearTablas();