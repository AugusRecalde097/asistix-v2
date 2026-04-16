import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getAlumnos, getCursos, getEscuelas, getLocalidades, deleteAlumno } from '../storage/db';
import Avatar from '../components/Avatar';
import { colors, spacing, radius, shadow } from '../theme/colors';

function InfoRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={16} color={colors.primary} style={styles.infoIcon} />
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

function calcEdad(fechaNacimiento) {
  if (!fechaNacimiento) return null;
  const hoy = new Date();
  const nac = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nac.getFullYear();
  if (hoy.getMonth() < nac.getMonth() || (hoy.getMonth() === nac.getMonth() && hoy.getDate() < nac.getDate())) edad--;
  return edad;
}

function formatFecha(fecha) {
  if (!fecha) return null;
  const [y, m, d] = fecha.split('-');
  return `${d}/${m}/${y}`;
}

export default function AlumnoDetalleScreen({ route, navigation }) {
  const { alumnoId } = route.params;
  const [alumno, setAlumno] = useState(null);
  const [curso, setCurso] = useState(null);
  const [escuela, setEscuela] = useState(null);
  const [localidad, setLocalidad] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const [alumnos, cursos, escuelas, locs] = await Promise.all([getAlumnos(), getCursos(), getEscuelas(), getLocalidades()]);
        const a = alumnos.find((x) => x.id === alumnoId);
        setAlumno(a);
        if (a) {
          const c = cursos.find((x) => x.id === a.cursoId);
          setCurso(c);
          if (c) {
            const e = escuelas.find((x) => x.id === c.escuelaId);
            setEscuela(e);
            if (e) setLocalidad(locs.find((x) => x.id === e.localidadId));
          }
        }
      };
      load();
    }, [alumnoId])
  );

  const handleDelete = () => {
    Alert.alert(
      'Eliminar alumno',
      `¿Estás seguro que querés eliminar a ${alumno?.nombre} ${alumno?.apellido}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: async () => {
          await deleteAlumno(alumnoId);
          navigation.goBack();
        }},
      ]
    );
  };

  if (!alumno) return <View style={{ flex: 1, backgroundColor: colors.background }} />;

  const edad = calcEdad(alumno.fechaNacimiento);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerBarTitle}>Detalle alumno</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AlumnoForm', { alumnoId })} style={styles.editBtn}>
          <Ionicons name="pencil-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <Avatar name={`${alumno.nombre} ${alumno.apellido}`} size={72} color="alumno" />
          <Text style={styles.heroName}>{alumno.apellido}, {alumno.nombre}</Text>
          {edad !== null && <Text style={styles.heroAge}>{edad} años</Text>}
          {curso && (
            <View style={styles.cursoChip}>
              <Text style={styles.cursoChipText}>{curso.nombre}</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos personales</Text>
          <View style={styles.card}>
            <InfoRow icon="card-outline" label="DNI" value={alumno.dni ? alumno.dni.replace(/(\d)(?=(\d{3})+$)/g, '$1.') : null} />
            <InfoRow icon="calendar-outline" label="Fecha de nacimiento" value={formatFecha(alumno.fechaNacimiento)} />
            <InfoRow icon="home-outline" label="Dirección" value={alumno.direccion} />
            <InfoRow icon="call-outline" label="Teléfono / contacto" value={alumno.telefono} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Escolaridad</Text>
          <View style={styles.card}>
            <InfoRow icon="book-outline" label="Curso" value={curso?.nombre} />
            <InfoRow icon="business-outline" label="Escuela" value={escuela?.nombre} />
            <InfoRow icon="location-outline" label="Localidad" value={localidad ? `${localidad.nombre}, ${localidad.provincia}` : null} />
          </View>
        </View>

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={16} color={colors.error} />
          <Text style={styles.deleteBtnText}>Eliminar alumno</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  headerBar: { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.md, paddingBottom: spacing.lg },
  backBtn: { padding: 4 },
  editBtn: { padding: 4 },
  headerBarTitle: { flex: 1, fontSize: 16, fontWeight: '500', color: '#fff', marginLeft: spacing.sm },
  scroll: { padding: spacing.lg, paddingBottom: 40 },
  heroCard: { backgroundColor: colors.surface, borderRadius: radius.xl, alignItems: 'center', padding: spacing.xxl, marginBottom: spacing.lg, borderWidth: 0.5, borderColor: colors.border, ...shadow.sm },
  heroName: { fontSize: 20, fontWeight: '600', color: colors.text, marginTop: spacing.md, textAlign: 'center' },
  heroAge: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  cursoChip: { backgroundColor: colors.primarySurface, borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 5, marginTop: spacing.sm },
  cursoChipText: { fontSize: 13, fontWeight: '500', color: colors.primary },
  section: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: 11, fontWeight: '600', color: colors.textHint, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 0.5, borderColor: colors.border, padding: spacing.md, ...shadow.sm },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: spacing.sm, borderBottomWidth: 0.5, borderBottomColor: colors.borderLight },
  infoIcon: { marginRight: spacing.md, marginTop: 2 },
  infoLabel: { fontSize: 11, color: colors.textHint, marginBottom: 2 },
  infoValue: { fontSize: 14, color: colors.text },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, borderWidth: 0.5, borderColor: colors.error + '40', backgroundColor: colors.errorSurface },
  deleteBtnText: { fontSize: 14, color: colors.error, fontWeight: '500' },
});
