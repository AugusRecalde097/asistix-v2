import React, { useState, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import {
  getCursos,
  saveCurso,
  deleteCurso,
  getEscuelas,
  getLocalidades,
  getAlumnos,
} from "../storage/db";
import SearchBar from "../components/SearchBar";
import ListCard from "../components/ListCard";
import FAB from "../components/FAB";
import EmptyState from "../components/EmptyState";
import SectionHeader from "../components/SectionHeader";
import FormField from "../components/FormField";
import { colors, spacing, radius, shadow } from "../theme/colors";

export default function CursosScreen({ navigation }) {
  const [cursos, setCursos] = useState([]);
  const [escuelas, setEscuelas] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [alumnos, setAlumnos] = useState([]);
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    anio: "",
    division: "",
    escuelaId: "",
  });
  const [showEscuelaPicker, setShowEscuelaPicker] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const [c, e, l, a] = await Promise.all([
          getCursos(),
          getEscuelas(),
          getLocalidades(),
          getAlumnos(),
        ]);
        setCursos(c);
        setEscuelas(e);
        setLocalidades(l);
        setAlumnos(a);
      };
      load();
    }, []),
  );

  const getEscuela = (id) => escuelas.find((e) => e.id === id);
  const getLocalidad = (id) => localidades.find((l) => l.id === id);
  const countAlumnos = (cursoId) =>
    alumnos.filter((a) => a.cursoId === cursoId).length;

  const filtered = cursos
    .filter((c) => {
      const term = search.toLowerCase();
      const e = getEscuela(c.escuelaId);
      return (
        !term ||
        c.nombre?.toLowerCase().includes(term) ||
        e?.nombre?.toLowerCase().includes(term)
      );
    })
    .sort((a, b) => a.anio - b.anio || a.division?.localeCompare(b.division));

  const openForm = (curso = null) => {
    setEditing(curso);
    setForm(
      curso
        ? {
            nombre: curso.nombre || "",
            anio: String(curso.anio || ""),
            division: curso.division || "",
            escuelaId: curso.escuelaId || "",
          }
        : { nombre: "", anio: "", division: "", escuelaId: "" },
    );
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!form.nombre.trim() || !form.escuelaId)
      return Alert.alert("Completá nombre y escuela");
    await saveCurso({
      ...form,
      anio: parseInt(form.anio) || 0,
      id: editing?.id,
    });
    setModalVisible(false);
    const c = await getCursos();
    setCursos(c);
  };

  const handleDelete = (curso) => {
    Alert.alert("Eliminar curso", `¿Eliminar ${curso.nombre}?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          await deleteCurso(curso.id);
          const c = await getCursos();
          setCursos(c);
        },
      },
    ]);
  };

  const escuelaLabel = (id) => {
    const e = getEscuela(id);
    if (!e) return null;
    const l = getLocalidad(e.localidadId);
    return [e.nombre, l?.nombre].filter(Boolean).join(" · ");
  };

  const escuelasConLabel = escuelas.map((e) => {
    const l = getLocalidad(e.localidadId);
    return { ...e, _label: [e.nombre, l?.nombre].filter(Boolean).join(" · ") };
  });

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Cursos</Text>
        <Text style={styles.headerSub}>{cursos.length} activos</Text>
      </View>
      <View style={styles.body}>
        <SearchBar
          value={search}
          onChangeText={setSearch}
          placeholder="Buscar curso o escuela..."
        />
        <SectionHeader title="Cursos" count={filtered.length} />
        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => {
            const e = getEscuela(item.escuelaId);
            const l = getLocalidad(e?.localidadId);
            const subtitle = [e?.nombre, l?.nombre].filter(Boolean).join(" · ");
            const n = countAlumnos(item.id);
            return (
              <View style={styles.cursoCard}>
                <TouchableOpacity
                  style={styles.cursoCardMain}
                  onPress={() => openForm(item)}
                  activeOpacity={0.75}>
                  <View
                    style={[
                      styles.cursoAvatar,
                      { backgroundColor: colors.curso.bg },
                    ]}>
                    <Text
                      style={[
                        styles.cursoAvatarText,
                        { color: colors.curso.text },
                      ]}>
                      {item.nombre?.split(" ")[0]}
                    </Text>
                  </View>
                  <View style={styles.cursoInfo}>
                    <Text style={styles.cursoNombre}>{item.nombre}</Text>
                    <Text style={styles.cursoSub} numberOfLines={1}>
                      {subtitle}
                    </Text>
                    <Text style={styles.cursoAlumnos}>{n} alumnos</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.asistenciaBtn}
                  onPress={() =>
                    navigation.navigate("AsistenciaTomar", { cursoId: item.id })
                  }
                  activeOpacity={0.8}>
                  <Ionicons
                    name="search"
                    size={16}
                    color={colors.primarySurface}
                  />
                  <Text style={styles.asistenciaBtnText}>Asistencia</Text>
                </TouchableOpacity>
              </View>
            );
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              icon="book-outline"
              title="No hay cursos"
              subtitle="Tocá + para agregar el primer curso"
            />
          }
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 90 }}
        />
      </View>
      <FAB onPress={() => openForm()} />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={modal.overlay}>
          <View style={modal.sheet}>
            <View style={modal.header}>
              <Text style={modal.title}>
                {editing ? "Editar curso" : "Nuevo curso"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>
            <View style={{ padding: spacing.lg }}>
              <FormField
                label="Nombre del curso"
                value={form.nombre}
                onChangeText={(v) => setForm((f) => ({ ...f, nombre: v }))}
                placeholder="Ej: 3° A"
                required
                icon="book-outline"
              />
              <View style={{ flexDirection: "row", gap: spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <FormField
                    label="Año"
                    value={form.anio}
                    onChangeText={(v) => setForm((f) => ({ ...f, anio: v }))}
                    placeholder="3"
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <FormField
                    label="División"
                    value={form.division}
                    onChangeText={(v) =>
                      setForm((f) => ({ ...f, division: v }))
                    }
                    placeholder="A"
                  />
                </View>
              </View>
              <FormField
                label="Escuela"
                value={escuelaLabel(form.escuelaId)}
                placeholder="Seleccionar escuela..."
                required
                icon="business-outline"
                rightIcon="chevron-down"
                onPress={() => setShowEscuelaPicker(true)}
              />
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>
                  {editing ? "Guardar cambios" : "Crear curso"}
                </Text>
              </TouchableOpacity>
              {editing && (
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => {
                    setModalVisible(false);
                    handleDelete(editing);
                  }}>
                  <Text style={styles.deleteBtnText}>Eliminar curso</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showEscuelaPicker} animationType="slide" transparent>
        <View style={modal.overlay}>
          <View style={modal.sheet}>
            <View style={modal.header}>
              <Text style={modal.title}>Seleccionar escuela</Text>
              <TouchableOpacity onPress={() => setShowEscuelaPicker(false)}>
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={escuelasConLabel}
              keyExtractor={(i) => i.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={modal.item}
                  onPress={() => {
                    setForm((f) => ({ ...f, escuelaId: item.id }));
                    setShowEscuelaPicker(false);
                  }}>
                  <Text style={modal.itemText}>{item._label}</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={colors.border}
                  />
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
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
  headerTitle: { fontSize: 22, fontWeight: "600", color: "#fff" },
  headerSub: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  body: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
    marginTop: spacing.sm,
  },
  saveBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  deleteBtn: {
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: "center",
    marginTop: spacing.sm,
    borderWidth: 0.5,
    borderColor: colors.error + "40",
    backgroundColor: colors.errorSurface,
  },
  deleteBtnText: { color: colors.error, fontSize: 14, fontWeight: "500" },
  cursoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 0.5,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    overflow: "hidden",
  },
  cursoCardMain: {
    flexDirection: "row",
    alignItems: "center",
    padding: spacing.md,
    gap: spacing.md,
  },
  cursoAvatar: {
    width: 42,
    height: 42,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  cursoAvatarText: { fontSize: 13, fontWeight: "600" },
  cursoInfo: { flex: 1 },
  cursoNombre: { fontSize: 14, fontWeight: "500", color: colors.text },
  cursoSub: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  cursoAlumnos: { fontSize: 11, color: colors.textHint, marginTop: 1 },
  asistenciaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
    paddingVertical: spacing.sm + 2,
    backgroundColor: colors.primary,
  },
  asistenciaBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.primarySurface,
  },
});

const modal = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 16, fontWeight: "500", color: colors.text },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.lg,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.borderLight,
  },
  itemText: { fontSize: 14, color: colors.text },
});
