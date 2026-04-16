import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getEscuelas, saveEscuela, deleteEscuela, getLocalidades, getCursos, getAlumnos } from '../storage/db';
import SearchBar from '../components/SearchBar';
import ListCard from '../components/ListCard';
import FAB from '../components/FAB';
import EmptyState from '../components/EmptyState';
import SectionHeader from '../components/SectionHeader';
import FormField from '../components/FormField';
import { colors, spacing, radius } from '../theme/colors';

export default function EscuelasScreen() {
  const [escuelas, setEscuelas] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nombre: '', localidadId: '' });
  const [showLocalidadPicker, setShowLocalidadPicker] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const [e, l, c, a] = await Promise.all([getEscuelas(), getLocalidades(), getCursos(), getAlumnos()]);
        setEscuelas(e); setLocalidades(l); setCursos(c); setAlumnos(a);
      };
      load();
    }, [])
  );

  const getLocalidad = (id) => localidades.find((l) => l.id === id);
  const countCursos = (escuelaId) => cursos.filter((c) => c.escuelaId === escuelaId).length;
  const countAlumnosEscuela = (escuelaId) => {
    const cursosEsc = cursos.filter((c) => c.escuelaId === escuelaId).map((c) => c.id);
    return alumnos.filter((a) => cursosEsc.includes(a.cursoId)).length;
  };

  const filtered = escuelas.filter((e) => {
    const term = search.toLowerCase();
    const l = getLocalidad(e.localidadId);
    return !term || e.nombre?.toLowerCase().includes(term) || l?.nombre?.toLowerCase().includes(term);
  }).sort((a, b) => a.nombre?.localeCompare(b.nombre));

  const openForm = (escuela = null) => {
    setEditing(escuela);
    setForm(escuela ? { nombre: escuela.nombre || '', localidadId: escuela.localidadId || '' } : { nombre: '', localidadId: '' });
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.nombre.trim() || !form.localidadId) return Alert.alert('Completá nombre y localidad');
    await saveEscuela({ ...form, id: editing?.id });
    setModalVisible(false);
    const e = await getEscuelas();
    setEscuelas(e);
  };

  const handleDelete = (escuela) => {
    Alert.alert('Eliminar escuela', `¿Eliminar ${escuela.nombre}?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => { await deleteEscuela(escuela.id); const e = await getEscuelas(); setEscuelas(e); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Escuelas</Text>
        <Text style={styles.headerSub}>{escuelas.length} registradas</Text>
      </View>
      <View style={styles.body}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar por nombre o localidad..." />
        <SectionHeader title="Escuelas" count={filtered.length} />
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => {
            const l = getLocalidad(item.localidadId);
            const nc = countCursos(item.id);
            const na = countAlumnosEscuela(item.id);
            return (
              <ListCard
                title={item.nombre}
                subtitle={l ? `${l.nombre}, ${l.provincia}` : '—'}
                avatarName={item.nombre}
                avatarColor="escuela"
                avatarSquare
                meta={`${nc} cursos · ${na} alumnos`}
                onPress={() => openForm(item)}
              />
            );
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState icon="business-outline" title="No hay escuelas" subtitle="Tocá + para agregar la primera escuela" />}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 90 }}
        />
      </View>
      <FAB onPress={() => openForm()} />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={modal.overlay}>
          <View style={modal.sheet}>
            <View style={modal.header}>
              <Text style={modal.title}>{editing ? 'Editar escuela' : 'Nueva escuela'}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><Ionicons name="close" size={22} color={colors.text} /></TouchableOpacity>
            </View>
            <View style={{ padding: spacing.lg }}>
              <FormField label="Nombre de la escuela" value={form.nombre} onChangeText={(v) => setForm((f) => ({ ...f, nombre: v }))} placeholder="Ej: E.P. N°5" required icon="business-outline" />
              <FormField
                label="Localidad"
                value={localidades.find((l) => l.id === form.localidadId)?.nombre}
                placeholder="Seleccionar localidad..."
                required icon="location-outline" rightIcon="chevron-down"
                onPress={() => setShowLocalidadPicker(true)}
              />
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>{editing ? 'Guardar cambios' : 'Crear escuela'}</Text>
              </TouchableOpacity>
              {editing && (
                <TouchableOpacity style={styles.deleteBtn} onPress={() => { setModalVisible(false); handleDelete(editing); }}>
                  <Text style={styles.deleteBtnText}>Eliminar escuela</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showLocalidadPicker} animationType="slide" transparent>
        <View style={modal.overlay}>
          <View style={modal.sheet}>
            <View style={modal.header}>
              <Text style={modal.title}>Seleccionar localidad</Text>
              <TouchableOpacity onPress={() => setShowLocalidadPicker(false)}><Ionicons name="close" size={22} color={colors.text} /></TouchableOpacity>
            </View>
            <FlatList
              data={localidades}
              keyExtractor={(i) => i.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={modal.item} onPress={() => { setForm((f) => ({ ...f, localidadId: item.id })); setShowLocalidadPicker(false); }}>
                  <Text style={modal.itemText}>{item.nombre}, {item.provincia}</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.border} />
                </TouchableOpacity>
              )}
            />
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
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, maxHeight: '80%' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  title: { fontSize: 16, fontWeight: '500', color: colors.text },
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, borderBottomWidth: 0.5, borderBottomColor: colors.borderLight },
  itemText: { fontSize: 14, color: colors.text },
});
