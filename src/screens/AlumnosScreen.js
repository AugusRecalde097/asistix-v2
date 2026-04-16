import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getAlumnos, getCursos, getEscuelas, getLocalidades } from '../storage/db';
import SearchBar from '../components/SearchBar';
import ListCard from '../components/ListCard';
import FAB from '../components/FAB';
import EmptyState from '../components/EmptyState';
import SectionHeader from '../components/SectionHeader';
import { colors, spacing, radius } from '../theme/colors';

export default function AlumnosScreen({ navigation }) {
  const [alumnos, setAlumnos] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [escuelas, setEscuelas] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [search, setSearch] = useState('');
  const [filtroAnio, setFiltroAnio] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const [a, c, e, l] = await Promise.all([getAlumnos(), getCursos(), getEscuelas(), getLocalidades()]);
        setAlumnos(a);
        setCursos(c);
        setEscuelas(e);
        setLocalidades(l);
      };
      load();
    }, [])
  );

  const getCurso = (id) => cursos.find((c) => c.id === id);
  const getEscuela = (id) => escuelas.find((e) => e.id === id);
  const getLocalidad = (id) => localidades.find((l) => l.id === id);

  const anios = [...new Set(cursos.map((c) => c.anio))].sort();

  const filtered = alumnos.filter((a) => {
    const term = search.toLowerCase();
    const matchSearch =
      !term ||
      a.apellido?.toLowerCase().includes(term) ||
      a.nombre?.toLowerCase().includes(term) ||
      a.dni?.includes(term);
    const curso = getCurso(a.cursoId);
    const matchAnio = filtroAnio === null || curso?.anio === filtroAnio;
    return matchSearch && matchAnio;
  }).sort((a, b) => a.apellido?.localeCompare(b.apellido));

  const renderAlumno = ({ item }) => {
    const curso = getCurso(item.cursoId);
    const escuela = curso ? getEscuela(curso.escuelaId) : null;
    const localidad = escuela ? getLocalidad(escuela.localidadId) : null;
    const subtitle = [curso?.nombre, escuela?.nombre, localidad?.nombre].filter(Boolean).join(' · ');
    return (
      <ListCard
        title={`${item.apellido}, ${item.nombre}`}
        subtitle={subtitle}
        avatarName={`${item.nombre} ${item.apellido}`}
        avatarColor="alumno"
        onPress={() => navigation.navigate('AlumnoDetalle', { alumnoId: item.id })}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alumnos</Text>
        <Text style={styles.headerSub}>{alumnos.length} registrados</Text>
      </View>
      <View style={styles.body}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar por nombre o DNI..." />
        <View style={styles.chips}>
          <TouchableOpacity
            style={[styles.chip, filtroAnio === null && styles.chipActive]}
            onPress={() => setFiltroAnio(null)}
          >
            <Text style={[styles.chipText, filtroAnio === null && styles.chipTextActive]}>Todos</Text>
          </TouchableOpacity>
          {anios.map((a) => (
            <TouchableOpacity
              key={a}
              style={[styles.chip, filtroAnio === a && styles.chipActive]}
              onPress={() => setFiltroAnio(filtroAnio === a ? null : a)}
            >
              <Text style={[styles.chipText, filtroAnio === a && styles.chipTextActive]}>{a}°</Text>
            </TouchableOpacity>
          ))}
        </View>
        <SectionHeader title="Alumnos" count={filtered.length} />
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          renderItem={renderAlumno}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="people-outline"
              title="No hay alumnos"
              subtitle={search ? 'Probá con otro término de búsqueda' : 'Tocá + para agregar el primer alumno'}
            />
          }
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 90 }}
        />
      </View>
      <FAB onPress={() => navigation.navigate('AlumnoForm', {})} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, paddingTop: spacing.sm },
  headerTitle: { fontSize: 22, fontWeight: '600', color: '#fff' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  body: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  chips: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: radius.full, borderWidth: 0.5, borderColor: colors.border, backgroundColor: colors.surface },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  chipTextActive: { color: '#fff' },
});
