import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  LOCALIDADES: "@escuela:localidades",
  ESCUELAS: "@escuela:escuelas",
  CURSOS: "@escuela:cursos",
  ALUMNOS: "@escuela:alumnos",
};

const getAll = async (key) => {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveAll = async (key, data) => {
  await AsyncStorage.setItem(key, JSON.stringify(data));
};

const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

// LOCALIDADES
export const getLocalidades = () => getAll(KEYS.LOCALIDADES);
export const saveLocalidad = async (localidad) => {
  const all = await getLocalidades();
  const item = {
    ...localidad,
    id: localidad.id || generateId(),
    createdAt: localidad.createdAt || new Date().toISOString(),
  };
  const idx = all.findIndex((l) => l.id === item.id);
  if (idx >= 0) all[idx] = item;
  else all.push(item);
  await saveAll(KEYS.LOCALIDADES, all);
  return item;
};
export const deleteLocalidad = async (id) => {
  const all = await getLocalidades();
  await saveAll(
    KEYS.LOCALIDADES,
    all.filter((l) => l.id !== id),
  );
};

// ESCUELAS
export const getEscuelas = () => getAll(KEYS.ESCUELAS);
export const saveEscuela = async (escuela) => {
  const all = await getEscuelas();
  const item = {
    ...escuela,
    id: escuela.id || generateId(),
    createdAt: escuela.createdAt || new Date().toISOString(),
  };
  const idx = all.findIndex((e) => e.id === item.id);
  if (idx >= 0) all[idx] = item;
  else all.push(item);
  await saveAll(KEYS.ESCUELAS, all);
  return item;
};
export const deleteEscuela = async (id) => {
  const all = await getEscuelas();
  await saveAll(
    KEYS.ESCUELAS,
    all.filter((e) => e.id !== id),
  );
};

// CURSOS
export const getCursos = () => getAll(KEYS.CURSOS);
export const saveCurso = async (curso) => {
  const all = await getCursos();
  const item = {
    ...curso,
    id: curso.id || generateId(),
    createdAt: curso.createdAt || new Date().toISOString(),
  };
  const idx = all.findIndex((c) => c.id === item.id);
  if (idx >= 0) all[idx] = item;
  else all.push(item);
  await saveAll(KEYS.CURSOS, all);
  return item;
};
export const deleteCurso = async (id) => {
  const all = await getCursos();
  await saveAll(
    KEYS.CURSOS,
    all.filter((c) => c.id !== id),
  );
};

// ALUMNOS
export const getAlumnos = () => getAll(KEYS.ALUMNOS);
export const saveAlumno = async (alumno) => {
  const all = await getAlumnos();
  const item = {
    ...alumno,
    id: alumno.id || generateId(),
    createdAt: alumno.createdAt || new Date().toISOString(),
  };
  const idx = all.findIndex((a) => a.id === item.id);
  if (idx >= 0) all[idx] = item;
  else all.push(item);
  await saveAll(KEYS.ALUMNOS, all);
  return item;
};
export const deleteAlumno = async (id) => {
  const all = await getAlumnos();
  await saveAll(
    KEYS.ALUMNOS,
    all.filter((a) => a.id !== id),
  );
};

// ─── ASISTENCIA ───────────────────────────────────────────────────
// Estructura de cada registro:
// { id, cursoId, fecha (YYYY-MM-DD), registros: [{ alumnoId, estado }] }
// estado: 'presente' | 'ausente' | 'tardanza' | 'justificado'

const ASISTENCIA_KEY = "@escuela:asistencia";

export const getAsistencias = () => getAll(ASISTENCIA_KEY);

export const getAsistenciaPorCursoFecha = async (cursoId, fecha) => {
  const all = await getAsistencias();
  return all.find((a) => a.cursoId === cursoId && a.fecha === fecha) || null;
};

export const getAsistenciasPorCurso = async (cursoId) => {
  const all = await getAsistencias();
  return all
    .filter((a) => a.cursoId === cursoId)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));
};

export const getAsistenciasPorAlumno = async (alumnoId) => {
  const all = await getAsistencias();
  const resultado = [];
  for (const asist of all) {
    const reg = asist.registros?.find((r) => r.alumnoId === alumnoId);
    if (reg)
      resultado.push({
        fecha: asist.fecha,
        cursoId: asist.cursoId,
        estado: reg.estado,
      });
  }
  return resultado.sort((a, b) => b.fecha.localeCompare(a.fecha));
};

export const saveAsistencia = async (cursoId, fecha, registros) => {
  const all = await getAsistencias();
  const idx = all.findIndex((a) => a.cursoId === cursoId && a.fecha === fecha);
  const item = {
    id: idx >= 0 ? all[idx].id : generateId(),
    cursoId,
    fecha,
    registros,
    updatedAt: new Date().toISOString(),
  };
  if (idx >= 0) all[idx] = item;
  else all.push(item);
  await saveAll(ASISTENCIA_KEY, all);
  return item;
};

export const deleteAsistencia = async (cursoId, fecha) => {
  const all = await getAsistencias();
  await saveAll(
    ASISTENCIA_KEY,
    all.filter((a) => !(a.cursoId === cursoId && a.fecha === fecha)),
  );
};

// SEED
export const seedDemoData = async () => {
  const localidades = await getLocalidades();
  if (localidades.length > 0) return;
  const loc1 = { id: "loc1", nombre: "San Javier", provincia: "Santa Fe" };
  const loc2 = { id: "loc2", nombre: "Alejandra", provincia: "Santa Fe" };
  const loc3 = { id: "loc3", nombre: "Romang", provincia: "Santa Fe" };
  await saveAll(KEYS.LOCALIDADES, [loc1, loc2, loc3]);
  const esc1 = { id: "esc1", nombre: "E.P. N°5", localidadId: "loc1" };
  const esc2 = { id: "esc2", nombre: "E.P. N°2", localidadId: "loc2" };
  const esc3 = { id: "esc3", nombre: "E.P. N°7", localidadId: "loc3" };
  await saveAll(KEYS.ESCUELAS, [esc1, esc2, esc3]);
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
  await saveAll(KEYS.CURSOS, [cur1, cur2, cur3, cur4]);
  await saveAll(KEYS.ALUMNOS, [
    {
      id: "al1",
      apellido: "Gómez",
      nombre: "María",
      dni: "45123456",
      fechaNacimiento: "2015-03-12",
      cursoId: "cur1",
      telefono: "3482123456",
      direccion: "Rivadavia 123",
      createdAt: new Date().toISOString(),
    },
    {
      id: "al2",
      apellido: "Rodríguez",
      nombre: "Lucas",
      dni: "45678901",
      fechaNacimiento: "2014-07-22",
      cursoId: "cur2",
      telefono: "3482234567",
      direccion: "San Martín 45",
      createdAt: new Date().toISOString(),
    },
    {
      id: "al3",
      apellido: "Fernández",
      nombre: "Paula",
      dni: "46001234",
      fechaNacimiento: "2015-11-05",
      cursoId: "cur1",
      telefono: "3482345678",
      direccion: "Belgrano 78",
      createdAt: new Date().toISOString(),
    },
    {
      id: "al4",
      apellido: "Torres",
      nombre: "Santiago",
      dni: "46234567",
      fechaNacimiento: "2013-01-30",
      cursoId: "cur3",
      telefono: "3482456789",
      direccion: "Mitre 200",
      createdAt: new Date().toISOString(),
    },
    {
      id: "al5",
      apellido: "López",
      nombre: "Daniela",
      dni: "45890123",
      fechaNacimiento: "2014-09-14",
      cursoId: "cur2",
      telefono: "3482567890",
      direccion: "Sarmiento 55",
      createdAt: new Date().toISOString(),
    },
    {
      id: "al6",
      apellido: "Martínez",
      nombre: "Tomás",
      dni: "46345678",
      fechaNacimiento: "2015-06-08",
      cursoId: "cur4",
      telefono: "3482678901",
      direccion: "Urquiza 12",
      createdAt: new Date().toISOString(),
    },
  ]);
};
