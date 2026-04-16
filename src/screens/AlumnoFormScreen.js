import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getAlumnos, saveAlumno, getCursos, getEscuelas, getLocalidades } from '../storage/db';
import FormField from '../components/FormField';
import { colors, spacing, radius, shadow } from '../theme/colors';

function PickerModal({ visible, title, items, onSelect, onClose, keyExtractor, labelExtractor }) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={modal.overlay}>
        <View style={modal.sheet}>
          <View style={modal.header}>
            <Text style={modal.title}>{title}</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={22} color={colors.text} /></TouchableOpacity>
          </View>
          <FlatList
            data={items}
            keyExtractor={keyExtractor}
            renderItem={({ item }) => (
              <TouchableOpacity style={modal.item} onPress={() => { onSelect(item); onClose(); }}>
                <Text style={modal.itemText}>{labelExtractor(item)}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.border} />
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

export default function AlumnoFormScreen({ route, navigation }) {
  const alumnoId = route.params?.alumnoId;
  const isEdit = !!alumnoId;

  const [form, setForm] = useState({ apellido: '', nombre: '', dni: '', fechaNacimiento: '', cursoId: '', telefono: '', direccion: '' });
  const [errors, setErrors] = useState({});
  const [cursos, setCursos] = useState([]);
  const [escuelas, setEscuelas] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [showCursoPicker, setShowCursoPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [c, e, l] = await Promise.all([getCursos(), getEscuelas(), getLocalidades()]);
      setCursos(c); setEscuelas(e); setLocalidades(l);
      if (isEdit) {
        const alumnos = await getAlumnos();
        const a = alumnos.find((x) => x.id === alumnoId);
        if (a) setForm({ apellido: a.apellido || '', nombre: a.nombre || '', dni: a.dni || '', fechaNacimiento: a.fechaNacimiento || '', cursoId: a.cursoId || '', telefono: a.telefono || '', direccion: a.direccion || '' });
      }
    };
    load();
  }, [alumnoId]);

  const set = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));

  const validate = () => {
    const e = {};
    if (!form.apellido.trim()) e.apellido = 'El apellido es requerido';
    if (!form.nombre.trim()) e.nombre = 'El nombre es requerido';
    if (!form.dni.trim()) e.dni = 'El DNI es requerido';
    else if (!/^\d{7,8}$/.test(form.dni.replace(/\D/g, ''))) e.dni = 'DNI inválido';
    if (!form.cursoId) e.cursoId = 'Seleccioná un curso';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await saveAlumno({ ...form, id: alumnoId, dni: form.dni.replace(/\D/g, '') });
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'No se pudo guardar el alumno');
    } finally {
      setSaving(false);
    }
  };

  const cursoLabel = () => {
    const c = cursos.find((x) => x.id === form.cursoId);
    if (!c) return null;
    const e = escuelas.find((x) => x.id === c.escuelaId);
    const l = localidades.find((x) => x.id === e?.localidadId);
    return [c.nombre, e?.nombre, l?.nombre].filter(Boolean).join(' · ');
  };

  const cursoItems = cursos.map((c) => {
    const e = escuelas.find((x) => x.id === c.escuelaId);
    const l = localidades.find((x) => x.id === e?.localidadId);
    return { ...c, _label: [c.nombre, e?.nombre, l?.nombre].filter(Boolean).join(' · ') };
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEdit ? 'Editar alumno' : 'Nuevo alumno'}</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.groupLabel}>Datos personales</Text>
        <View style={styles.card}>
          <FormField label="Apellido" value={form.apellido} onChangeText={set('apellido')} placeholder="Ej: Gómez" required error={errors.apellido} icon="person-outline" />
          <FormField label="Nombre" value={form.nombre} onChangeText={set('nombre')} placeholder="Ej: María Celeste" required error={errors.nombre} icon="person-outline" />
          <FormField label="DNI" value={form.dni} onChangeText={set('dni')} placeholder="Ej: 45123456" keyboardType="numeric" required error={errors.dni} icon="card-outline" />
          <FormField label="Fecha de nacimiento" value={form.fechaNacimiento} onChangeText={set('fechaNacimiento')} placeholder="AAAA-MM-DD" icon="calendar-outline" />
        </View>

        <Text style={styles.groupLabel}>Contacto</Text>
        <View style={styles.card}>
          <FormField label="Dirección" value={form.direccion} onChangeText={set('direccion')} placeholder="Ej: Rivadavia 123" icon="home-outline" />
          <FormField label="Teléfono / contacto familiar" value={form.telefono} onChangeText={set('telefono')} placeholder="Ej: 3482 123456" keyboardType="phone-pad" icon="call-outline" />
        </View>

        <Text style={styles.groupLabel}>Escolaridad</Text>
        <View style={styles.card}>
          <FormField
            label="Curso"
            value={cursoLabel()}
            placeholder="Seleccionar curso..."
            required
            error={errors.cursoId}
            icon="book-outline"
            rightIcon="chevron-down"
            onPress={() => setShowCursoPicker(true)}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, saving && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Ionicons name="checkmark" size={20} color="#fff" />
          <Text style={styles.saveBtnText}>{saving ? 'Guardando...' : (isEdit ? 'Guardar cambios' : 'Guardar alumno')}</Text>
        </TouchableOpacity>
      </ScrollView>

      <PickerModal
        visible={showCursoPicker}
        title="Seleccionar curso"
        items={cursoItems}
        onSelect={(item) => set('cursoId')(item.id)}
        onClose={() => setShowCursoPicker(false)}
        keyExtractor={(item) => item.id}
        labelExtractor={(item) => item._label}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  headerBar: { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.md, paddingBottom: spacing.lg },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '500', color: '#fff', marginLeft: spacing.sm },
  scroll: { padding: spacing.lg, paddingBottom: 40 },
  groupLabel: { fontSize: 11, fontWeight: '600', color: colors.textHint, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: spacing.sm, marginTop: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, borderWidth: 0.5, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md, ...shadow.sm },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.primary, borderRadius: radius.lg, padding: spacing.lg, marginTop: spacing.sm },
  saveBtnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});

const modal = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, maxHeight: '70%' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  title: { fontSize: 16, fontWeight: '500', color: colors.text },
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg, borderBottomWidth: 0.5, borderBottomColor: colors.borderLight },
  itemText: { fontSize: 14, color: colors.text },
});
