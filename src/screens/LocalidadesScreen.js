import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getLocalidades, saveLocalidad, deleteLocalidad, getEscuelas, getCursos, getAlumnos } from '../storage/db';
import SearchBar from '../components/SearchBar';
import ListCard from '../components/ListCard';
import FAB from '../components/FAB';
import EmptyState from '../components/EmptyState';
import SectionHeader from '../components/SectionHeader';
import FormField from '../components/FormField';
import { colors, spacing, radius } from '../theme/colors';

export default function LocalidadesScreen() {
  const [localidades, setLocalidades] = useState([]);
  const [escuelas, setEscuelas] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nombre: '', provincia: '' });

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const [l, e, c, a] = await Promise.all([getLocalidades(), getEscuelas(), getCursos(), getAlumnos()]);
        setLocalidades(l); setEscuelas(e); setCursos(c); setAlumnos(a);
      };
      load();
    }, [])
  );

  const countEscuelas = (locId) => escuelas.filter((e) => e.localidadId === locId).length;
  const countAlumnosLoc = (locId) => {
    const escIds = escuelas.filter((e) => e.localidadId === locId).map((e) => e.id);
    const curIds = cursos.filter((c) => escIds.includes(c.escuelaId)).map((c) => c.id);
    return alumnos.filter((a) => curIds.includes(a.cursoId)).length;
  };

  const filtered = localidades
    .filter((l) => !search || l.nombre?.toLowerCase().includes(search.toLowerCase()) || l.provincia?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.nombre?.localeCompare(b.nombre));

  const openForm = (loc = null) => {
    setEditing(loc);
    setForm(loc ? { nombre: loc.nombre || '', provincia: loc.provincia || '' } : { nombre: '', provincia: '' });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.nombre.trim()) return Alert.alert('El nombre es requerido');
    await saveLocalidad({ ...form, id: editing?.id });
    setModalVisible(false);
    const l = await getLocalidades();
    setLocalidades(l);
  };

  const handleDelete = (loc) => {
    Alert.alert('Eliminar localidad', `¿Eliminar ${loc.nombre}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => { await deleteLocalidad(loc.id); const l = await getLocalidades(); setLocalidades(l); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Localidades</Text>
        <Text style={styles.headerSub}>{localidades.length} registradas</Text>
      </View>
      <View style={styles.body}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar localidad..." />
        <SectionHeader title="Localidades" count={filtered.length} />
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <ListCard
              title={item.nombre}
              subtitle={item.provincia || '—'}
              avatarName={item.nombre}
              avatarColor="localidad"
              avatarSquare
              meta={`${countEscuelas(item.id)} esc · ${countAlumnosLoc(item.id)} alumnos`}
              onPress={() => openForm(item)}
            />
          )}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState icon="location-outline" title="No hay localidades" subtitle="Tocá + para agregar la primera localidad" />}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 90 }}
        />
      </View>
      <FAB onPress={() => openForm()} />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={modal.overlay}>
          <View style={modal.sheet}>
            <View style={modal.header}>
              <Text style={modal.title}>{editing ? 'Editar localidad' : 'Nueva localidad'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close" size={22} color={colors.text} /></TouchableOpacity>
            </View>
            <View style={{ padding: spacing.lg }}>
              <FormField label="Nombre de la localidad" value={form.nombre} onChangeText={(v) => setForm((f) => ({ ...f, nombre: v }))} placeholder="Ej: San Javier" required icon="location-outline" />
              <FormField label="Provincia" value={form.provincia} onChangeText={(v) => setForm((f) => ({ ...f, provincia: v }))} placeholder="Ej: Santa Fe" icon="map-outline" />
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>{editing ? 'Guardar cambios' : 'Crear localidad'}</Text>
              </TouchableOpacity>
              {editing && (
                <TouchableOpacity style={styles.deleteBtn} onPress={() => { setModalVisible(false); handleDelete(editing); }}>
                  <Text style={styles.deleteBtnText}>Eliminar localidad</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, paddingTop: spacing.sm },
  headerTitle: { fontSize: 22, fontWeight: '600', color: '#fff' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  body: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  saveBtn: { backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center', marginTop: spacing.sm },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  deleteBtn: { borderRadius: radius.md, padding: spacing.md, alignItems: 'center', marginTop: spacing.sm, borderWidth: 0.5, borderColor: colors.error + '40', backgroundColor: colors.errorSurface },
  deleteBtnText: { color: colors.error, fontSize: 14, fontWeight: '500' },
});

const modal = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, maxHeight: '70%' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  title: { fontSize: 16, fontWeight: '500', color: colors.text },
});
