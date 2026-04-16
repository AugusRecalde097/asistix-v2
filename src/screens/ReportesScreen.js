import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getAlumnos, getCursos, getEscuelas, getLocalidades } from '../storage/db';
import { colors, spacing, radius, shadow } from '../theme/colors';

function StatCard({ label, value, color = colors.primary, bg = colors.primarySurface }) {
  return (
    <View style={[styles.statCard, { backgroundColor: bg }]}>
      <Text style={[styles.statNum, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function BarRow({ label, value, total, color = colors.primary }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <View style={styles.barRow}>
      <View style={styles.barMeta}>
        <Text style={styles.barLabel}>{label}</Text>
        <Text style={styles.barVal}>{value}</Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

export default function ReportesScreen() {
  const [data, setData] = useState({ alumnos: [], cursos: [], escuelas: [], localidades: [] });

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const [a, c, e, l] = await Promise.all([getAlumnos(), getCursos(), getEscuelas(), getLocalidades()]);
        setData({ alumnos: a, cursos: c, escuelas: e, localidades: l });
      };
      load();
    }, [])
  );

  const { alumnos, cursos, escuelas, localidades } = data;

  // Alumnos por localidad
  const porLocalidad = localidades.map((l) => {
    const escIds = escuelas.filter((e) => e.localidadId === l.id).map((e) => e.id);
    const curIds = cursos.filter((c) => escIds.includes(c.escuelaId)).map((c) => c.id);
    const count = alumnos.filter((a) => curIds.includes(a.cursoId)).length;
    return { nombre: l.nombre, count };
  }).sort((a, b) => b.count - a.count);

  // Alumnos por curso (top 5)
  const porCurso = cursos.map((c) => {
    const esc = escuelas.find((e) => e.id === c.escuelaId);
    const count = alumnos.filter((a) => a.cursoId === c.id).length;
    return { nombre: `${c.nombre} · ${esc?.nombre || ''}`, count };
  }).sort((a, b) => b.count - a.count).slice(0, 6);

  // Promedio alumnos por curso
  const promAlumnosCurso = cursos.length > 0 ? Math.round(alumnos.length / cursos.length) : 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reportes</Text>
        <Text style={styles.headerSub}>Estadísticas generales</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <View style={styles.statsGrid}>
          <StatCard label="Alumnos" value={alumnos.length} color={colors.primary} bg={colors.primarySurface} />
          <StatCard label="Cursos" value={cursos.length} color={colors.success} bg={colors.successSurface} />
          <StatCard label="Escuelas" value={escuelas.length} color="#F57F17" bg="#FFF8E1" />
          <StatCard label="Localidades" value={localidades.length} color="#6A1B9A" bg="#F3E5F5" />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Promedio de alumnos por curso</Text>
          <Text style={styles.bigNum}>{promAlumnosCurso}</Text>
          <Text style={styles.cardSub}>alumnos / curso en promedio</Text>
        </View>

        {porLocalidad.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Alumnos por localidad</Text>
            <View style={styles.card}>
              {porLocalidad.map((item, i) => (
                <BarRow key={i} label={item.nombre} value={item.count} total={alumnos.length} color={colors.primary} />
              ))}
            </View>
          </View>
        )}

        {porCurso.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Alumnos por curso</Text>
            <View style={styles.card}>
              {porCurso.map((item, i) => (
                <BarRow key={i} label={item.nombre} value={item.count} total={alumnos.length} color={colors.primaryLight} />
              ))}
            </View>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, paddingTop: spacing.sm },
  headerTitle: { fontSize: 22, fontWeight: '600', color: '#fff' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  scroll: { padding: spacing.lg, paddingBottom: 40 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
  statCard: { flex: 1, minWidth: '45%', borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center', ...shadow.sm },
  statNum: { fontSize: 32, fontWeight: '700' },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 0.5, borderColor: colors.border, padding: spacing.lg, marginBottom: spacing.md, ...shadow.sm },
  cardTitle: { fontSize: 13, color: colors.textSecondary, marginBottom: spacing.sm },
  bigNum: { fontSize: 48, fontWeight: '700', color: colors.primary },
  cardSub: { fontSize: 12, color: colors.textHint },
  section: { marginBottom: spacing.sm },
  sectionTitle: { fontSize: 11, fontWeight: '600', color: colors.textHint, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: spacing.sm },
  barRow: { marginBottom: spacing.md },
  barMeta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  barLabel: { fontSize: 13, color: colors.text },
  barVal: { fontSize: 13, fontWeight: '500', color: colors.primary },
  barTrack: { height: 6, backgroundColor: colors.borderLight, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: 6, borderRadius: 3 },
});
