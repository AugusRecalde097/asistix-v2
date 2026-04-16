// src/hooks/useData.js
import { useState, useEffect, useCallback } from 'react';
import { AlumnosDB, CursosDB, EscuelasDB, LocalidadesDB } from '../storage/db';

export const useAlumnos = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await AlumnosDB.getAll();
    setAlumnos(data);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  return { alumnos, loading, refresh };
};

export const useCursos = () => {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await CursosDB.getAll();
    setCursos(data);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  return { cursos, loading, refresh };
};

export const useEscuelas = () => {
  const [escuelas, setEscuelas] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await EscuelasDB.getAll();
    setEscuelas(data);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  return { escuelas, loading, refresh };
};

export const useLocalidades = () => {
  const [localidades, setLocalidades] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await LocalidadesDB.getAll();
    setLocalidades(data);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  return { localidades, loading, refresh };
};

// Hook combinado con relaciones resueltas
export const useAlumnosEnriquecidos = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [als, cursos, escuelas, localidades] = await Promise.all([
      AlumnosDB.getAll(),
      CursosDB.getAll(),
      EscuelasDB.getAll(),
      LocalidadesDB.getAll(),
    ]);

    const cursoMap = Object.fromEntries(cursos.map((c) => [c.id, c]));
    const escuelaMap = Object.fromEntries(escuelas.map((e) => [e.id, e]));
    const localidadMap = Object.fromEntries(localidades.map((l) => [l.id, l]));

    const enriquecidos = als.map((a) => {
      const curso = cursoMap[a.cursoId] || null;
      const escuela = curso ? escuelaMap[curso.escuelaId] || null : null;
      const localidad = escuela ? localidadMap[escuela.localidadId] || null : null;
      return { ...a, curso, escuela, localidad };
    });

    setAlumnos(enriquecidos);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  return { alumnos, loading, refresh };
};

export const useCursosEnriquecidos = () => {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const [cursosRaw, escuelas, localidades, alumnos] = await Promise.all([
      CursosDB.getAll(),
      EscuelasDB.getAll(),
      LocalidadesDB.getAll(),
      AlumnosDB.getAll(),
    ]);

    const escuelaMap = Object.fromEntries(escuelas.map((e) => [e.id, e]));
    const localidadMap = Object.fromEntries(localidades.map((l) => [l.id, l]));

    const enriquecidos = cursosRaw.map((c) => {
      const escuela = escuelaMap[c.escuelaId] || null;
      const localidad = escuela ? localidadMap[escuela.localidadId] || null : null;
      const cantAlumnos = alumnos.filter((a) => a.cursoId === c.id).length;
      return { ...c, escuela, localidad, cantAlumnos };
    });

    setCursos(enriquecidos);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);
  return { cursos, loading, refresh };
};
