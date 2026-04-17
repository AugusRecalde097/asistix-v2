import { openDatabaseAsync } from "expo-sqlite";

const DB_NAME = "asistix.db";
let dbPromise;
let initialized = false;

const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const getDb = async () => {
  if (!dbPromise) dbPromise = openDatabaseAsync(DB_NAME);
  return dbPromise;
};

const initDb = async () => {
  if (initialized) return;
  const db = await getDb();

  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS localidades (
      id TEXT PRIMARY KEY NOT NULL,
      nombre TEXT NOT NULL,
      provincia TEXT,
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS escuelas (
      id TEXT PRIMARY KEY NOT NULL,
      nombre TEXT NOT NULL,
      localidadId TEXT,
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS cursos (
      id TEXT PRIMARY KEY NOT NULL,
      nombre TEXT NOT NULL,
      escuelaId TEXT,
      anio INTEGER,
      division TEXT,
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS alumnos (
      id TEXT PRIMARY KEY NOT NULL,
      apellido TEXT,
      nombre TEXT,
      dni TEXT,
      fechaNacimiento TEXT,
      cursoId TEXT,
      telefono TEXT,
      direccion TEXT,
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS asistencias (
      id TEXT PRIMARY KEY NOT NULL,
      cursoId TEXT NOT NULL,
      fecha TEXT NOT NULL,
      registros TEXT NOT NULL,
      updatedAt TEXT,
      UNIQUE(cursoId, fecha)
    );
  `);

  initialized = true;
};

const getRows = async (table) => {
  await initDb();
  const db = await getDb();
  return db.getAllAsync(`SELECT * FROM ${table}`);
};

const removeById = async (table, id) => {
  await initDb();
  const db = await getDb();
  await db.runAsync(`DELETE FROM ${table} WHERE id = ?`, [id]);
};

// LOCALIDADES
export const getLocalidades = () => getRows("localidades");
export const saveLocalidad = async (localidad) => {
  await initDb();
  const db = await getDb();
  const item = {
    ...localidad,
    id: localidad.id || generateId(),
    createdAt: localidad.createdAt || new Date().toISOString(),
  };

  await db.runAsync(
    `INSERT INTO localidades (id, nombre, provincia, createdAt)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
      nombre = excluded.nombre,
      provincia = excluded.provincia,
      createdAt = excluded.createdAt`,
    [item.id, item.nombre, item.provincia ?? null, item.createdAt],
  );

  return item;
};
export const deleteLocalidad = async (id) => removeById("localidades", id);

// ESCUELAS
export const getEscuelas = () => getRows("escuelas");
export const saveEscuela = async (escuela) => {
  await initDb();
  const db = await getDb();
  const item = {
    ...escuela,
    id: escuela.id || generateId(),
    createdAt: escuela.createdAt || new Date().toISOString(),
  };

  await db.runAsync(
    `INSERT INTO escuelas (id, nombre, localidadId, createdAt)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
      nombre = excluded.nombre,
      localidadId = excluded.localidadId,
      createdAt = excluded.createdAt`,
    [item.id, item.nombre, item.localidadId ?? null, item.createdAt],
  );

  return item;
};
export const deleteEscuela = async (id) => removeById("escuelas", id);

// CURSOS
export const getCursos = () => getRows("cursos");
export const saveCurso = async (curso) => {
  await initDb();
  const db = await getDb();
  const item = {
    ...curso,
    id: curso.id || generateId(),
    createdAt: curso.createdAt || new Date().toISOString(),
  };

  await db.runAsync(
    `INSERT INTO cursos (id, nombre, escuelaId, anio, division, createdAt)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
      nombre = excluded.nombre,
      escuelaId = excluded.escuelaId,
      anio = excluded.anio,
      division = excluded.division,
      createdAt = excluded.createdAt`,
    [
      item.id,
      item.nombre,
      item.escuelaId ?? null,
      item.anio ?? null,
      item.division ?? null,
      item.createdAt,
    ],
  );

  return item;
};
export const deleteCurso = async (id) => removeById("cursos", id);

// ALUMNOS
export const getAlumnos = () => getRows("alumnos");
export const saveAlumno = async (alumno) => {
  await initDb();
  const db = await getDb();
  const item = {
    ...alumno,
    id: alumno.id || generateId(),
    createdAt: alumno.createdAt || new Date().toISOString(),
  };

  await db.runAsync(
    `INSERT INTO alumnos (
      id, apellido, nombre, dni, fechaNacimiento, cursoId, telefono, direccion, createdAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      apellido = excluded.apellido,
      nombre = excluded.nombre,
      dni = excluded.dni,
      fechaNacimiento = excluded.fechaNacimiento,
      cursoId = excluded.cursoId,
      telefono = excluded.telefono,
      direccion = excluded.direccion,
      createdAt = excluded.createdAt`,
    [
      item.id,
      item.apellido ?? null,
      item.nombre ?? null,
      item.dni ?? null,
      item.fechaNacimiento ?? null,
      item.cursoId ?? null,
      item.telefono ?? null,
      item.direccion ?? null,
      item.createdAt,
    ],
  );

  return item;
};
export const deleteAlumno = async (id) => removeById("alumnos", id);

// ASISTENCIA
const mapAsistencia = (row) => ({
  ...row,
  registros: JSON.parse(row.registros || "[]"),
});

export const getAsistencias = async () => {
  const rows = await getRows("asistencias");
  return rows.map(mapAsistencia);
};

export const getAsistenciaPorCursoFecha = async (cursoId, fecha) => {
  await initDb();
  const db = await getDb();
  const row = await db.getFirstAsync(
    `SELECT * FROM asistencias WHERE cursoId = ? AND fecha = ?`,
    [cursoId, fecha],
  );
  return row ? mapAsistencia(row) : null;
};

export const getAsistenciasPorCurso = async (cursoId) => {
  await initDb();
  const db = await getDb();
  const rows = await db.getAllAsync(
    `SELECT * FROM asistencias WHERE cursoId = ? ORDER BY fecha DESC`,
    [cursoId],
  );
  return rows.map(mapAsistencia);
};

export const getAsistenciasPorAlumno = async (alumnoId) => {
  const all = await getAsistencias();
  const resultado = [];

  for (const asist of all) {
    const reg = asist.registros?.find((r) => r.alumnoId === alumnoId);
    if (reg) {
      resultado.push({
        fecha: asist.fecha,
        cursoId: asist.cursoId,
        estado: reg.estado,
      });
    }
  }

  return resultado.sort((a, b) => b.fecha.localeCompare(a.fecha));
};

export const saveAsistencia = async (cursoId, fecha, registros) => {
  await initDb();
  const db = await getDb();

  const existing = await db.getFirstAsync(
    `SELECT id FROM asistencias WHERE cursoId = ? AND fecha = ?`,
    [cursoId, fecha],
  );

  const item = {
    id: existing?.id || generateId(),
    cursoId,
    fecha,
    registros,
    updatedAt: new Date().toISOString(),
  };

  await db.runAsync(
    `INSERT INTO asistencias (id, cursoId, fecha, registros, updatedAt)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(cursoId, fecha) DO UPDATE SET
      id = excluded.id,
      registros = excluded.registros,
      updatedAt = excluded.updatedAt`,
    [
      item.id,
      item.cursoId,
      item.fecha,
      JSON.stringify(item.registros ?? []),
      item.updatedAt,
    ],
  );

  return item;
};

export const deleteAsistencia = async (cursoId, fecha) => {
  await initDb();
  const db = await getDb();
  await db.runAsync(
    `DELETE FROM asistencias WHERE cursoId = ? AND fecha = ?`,
    [cursoId, fecha],
  );
};

// API para hooks
export const LocalidadesDB = {
  getAll: getLocalidades,
  save: saveLocalidad,
  remove: deleteLocalidad,
};

export const EscuelasDB = {
  getAll: getEscuelas,
  save: saveEscuela,
  remove: deleteEscuela,
};

export const CursosDB = {
  getAll: getCursos,
  save: saveCurso,
  remove: deleteCurso,
};

export const AlumnosDB = {
  getAll: getAlumnos,
  save: saveAlumno,
  remove: deleteAlumno,
};

// SEED
export const seedDemoData = async () => {
  const localidades = await getLocalidades();
  if (localidades.length > 0) return;

  const loc1 = { id: "loc1", nombre: "San Javier", provincia: "Santa Fe" };
  const loc2 = { id: "loc2", nombre: "Alejandra", provincia: "Santa Fe" };
  const loc3 = { id: "loc3", nombre: "Romang", provincia: "Santa Fe" };
  await Promise.all([
    saveLocalidad(loc1),
    saveLocalidad(loc2),
    saveLocalidad(loc3),
  ]);

  const esc1 = { id: "esc1", nombre: "E.P. N°5", localidadId: "loc1" };
  const esc2 = { id: "esc2", nombre: "E.P. N°2", localidadId: "loc2" };
  const esc3 = { id: "esc3", nombre: "E.P. N°7", localidadId: "loc3" };
  await Promise.all([saveEscuela(esc1), saveEscuela(esc2), saveEscuela(esc3)]);

  const cur1 = {
    id: "cur1",
    nombre: "3° A",
    escuelaId: "esc1",
    anio: 3,
    division: "A",
  };
  const cur2 = {
    id: "cur2",
    nombre: "4° B",
    escuelaId: "esc2",
    anio: 4,
    division: "B",
  };
  const cur3 = {
    id: "cur3",
    nombre: "5° A",
    escuelaId: "esc3",
    anio: 5,
    division: "A",
  };
  const cur4 = {
    id: "cur4",
    nombre: "3° B",
    escuelaId: "esc1",
    anio: 3,
    division: "B",
  };
  await Promise.all([
    saveCurso(cur1),
    saveCurso(cur2),
    saveCurso(cur3),
    saveCurso(cur4),
  ]);

  await Promise.all([
    saveAlumno({
      id: "al1",
      apellido: "Gómez",
      nombre: "María",
      dni: "45123456",
      fechaNacimiento: "2015-03-12",
      cursoId: "cur1",
      telefono: "3482123456",
      direccion: "Rivadavia 123",
    }),
    saveAlumno({
      id: "al2",
      apellido: "Rodríguez",
      nombre: "Lucas",
      dni: "45678901",
      fechaNacimiento: "2014-07-22",
      cursoId: "cur2",
      telefono: "3482234567",
      direccion: "San Martín 45",
    }),
    saveAlumno({
      id: "al3",
      apellido: "Fernández",
      nombre: "Paula",
      dni: "46001234",
      fechaNacimiento: "2015-11-05",
      cursoId: "cur1",
      telefono: "3482345678",
      direccion: "Belgrano 78",
    }),
    saveAlumno({
      id: "al4",
      apellido: "Torres",
      nombre: "Santiago",
      dni: "46234567",
      fechaNacimiento: "2013-01-30",
      cursoId: "cur3",
      telefono: "3482456789",
      direccion: "Mitre 200",
    }),
    saveAlumno({
      id: "al5",
      apellido: "López",
      nombre: "Daniela",
      dni: "45890123",
      fechaNacimiento: "2014-09-14",
      cursoId: "cur2",
      telefono: "3482567890",
      direccion: "Sarmiento 55",
    }),
    saveAlumno({
      id: "al6",
      apellido: "Martínez",
      nombre: "Tomás",
      dni: "46345678",
      fechaNacimiento: "2015-06-08",
      cursoId: "cur4",
      telefono: "3482678901",
      direccion: "Urquiza 12",
    }),
  ]);
};
