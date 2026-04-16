import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  getAlumnos,
  getCursos,
  getEscuelas,
  getAsistenciaPorCursoFecha,
  saveAsistencia,
} from "../storage/db";
import Avatar from "../components/Avatar";
import { colors, spacing, radius, shadow } from "../theme/colors";

// ─── Constantes de estado ─────────────────────────────────────────
const ESTADOS = [
  {
    key: "presente",
    label: "P",
    labelFull: "Presente",
    color: "#2E7D32",
    bg: "#E8F5E9",
    icon: "checkmark-circle",
  },
  {
    key: "ausente",
    label: "A",
    labelFull: "Ausente",
    color: "#C62828",
    bg: "#FFEBEE",
    icon: "close-circle",
  },
  {
    key: "tardanza",
    label: "T",
    labelFull: "Tardanza",
    color: "#E65100",
    bg: "#FFF3E0",
    icon: "time",
  },
  {
    key: "justificado",
    label: "J",
    labelFull: "Justificado",
    color: "#1565C0",
    bg: "#E3F2FD",
    icon: "document-text",
  },
];

const estadoMap = Object.fromEntries(ESTADOS.map((e) => [e.key, e]));

// ─── Helpers de fecha ─────────────────────────────────────────────
const hoy = () => new Date().toISOString().slice(0, 10);

const formatFecha = (iso) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
};

const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const meses = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

// ─── Chips de resumen ─────────────────────────────────────────────
function ResumenChips({ registros }) {
  const counts = { presente: 0, ausente: 0, tardanza: 0, justificado: 0 };
  registros.forEach((r) => {
    if (counts[r.estado] !== undefined) counts[r.estado]++;
  });
  return (
    <View style={resumen.row}>
      {ESTADOS.map((e) => (
        <View key={e.key} style={[resumen.chip, { backgroundColor: e.bg }]}>
          <Text style={[resumen.chipNum, { color: e.color }]}>
            {counts[e.key]}
          </Text>
          <Text style={[resumen.chipLabel, { color: e.color }]}>
            {e.labelFull}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ─── Fila de alumno ───────────────────────────────────────────────
function AlumnoRow({ alumno, estado, onToggle }) {
  // const est = estadoMap[estado] || estadoMap["presente"];
  const est = estadoMap[estado];
  return (
    <View style={row.container}>
      <Avatar
        name={`${alumno.nombre} ${alumno.apellido}`}
        size={38}
        color="alumno"
      />
      <Text style={row.nombre} numberOfLines={1}>
        {alumno.apellido}, {alumno.nombre}
      </Text>
      <View style={row.buttons}>
        {ESTADOS.map((e) => {
          const active = estado === e.key;
          return (
            <TouchableOpacity
              key={e.key}
              style={[
                row.btn,
                active && { backgroundColor: e.bg, borderColor: e.color },
              ]}
              onPress={() => onToggle(alumno.id, e.key)}
              activeOpacity={0.7}>
              <Text
                style={[
                  row.btnText,
                  { color: active ? e.color : colors.textHint },
                ]}>
                {e.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ─── Pantalla principal ───────────────────────────────────────────
export default function AsistenciaScreen({ route, navigation }) {
  const { cursoId } = route.params;

  const [fecha, setFecha] = useState(hoy());
  const [curso, setCurso] = useState(null);
  const [escuela, setEscuela] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [registros, setRegistros] = useState({}); // { alumnoId: estado }
  const [guardado, setGuardado] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Carga datos del curso y alumnos
  useEffect(() => {
    const load = async () => {
      const [cursos, escuelas, todosAlumnos] = await Promise.all([
        getCursos(),
        getEscuelas(),
        getAlumnos(),
      ]);
      const c = cursos.find((x) => x.id === cursoId);
      const e = escuelas.find((x) => x.id === c?.escuelaId);
      const alumnosCurso = todosAlumnos
        .filter((a) => a.cursoId === cursoId)
        .sort((a, b) => a.apellido.localeCompare(b.apellido));
      setCurso(c);
      setEscuela(e);
      setAlumnos(alumnosCurso);
      setLoading(false);
    };
    load();
  }, [cursoId]);

  // Carga asistencia cuando cambia la fecha
  useEffect(() => {
    const loadAsistencia = async () => {
      const asist = await getAsistenciaPorCursoFecha(cursoId, fecha);
      if (asist) {
        const map = {};
        asist.registros.forEach((r) => {
          map[r.alumnoId] = r.estado;
        });
        setRegistros(map);
        setGuardado(true);
      } else {
        // Por defecto todos presentes
        const map = {};
        alumnos.forEach((a) => {
          map[a.id] = "";
        });
        setRegistros(map);
        setGuardado(false);
      }
    };
    if (alumnos.length > 0) loadAsistencia();
  }, [fecha, alumnos]);

  const toggleEstado = (alumnoId, estado) => {
    setRegistros((prev) => ({ ...prev, [alumnoId]: estado }));
    setGuardado(false);
  };

  const marcarTodos = (estado) => {
    const map = {};
    alumnos.forEach((a) => {
      map[a.id] = estado;
    });
    setRegistros(map);
    setGuardado(false);
  };

  const handleGuardar = async () => {
    setSaving(true);
    const regs = alumnos.map((a) => ({
      alumnoId: a.id,
      estado: registros[a.id],
      // estado: registros[a.id] || "presente",
    }));
    await saveAsistencia(cursoId, fecha, regs);
    setSaving(false);
    setGuardado(true);
  };

  // Navegar entre fechas
  const cambiarFecha = (dias) => {
    const d = new Date(fecha + "T12:00:00");
    d.setDate(d.getDate() + dias);
    setFecha(d.toISOString().slice(0, 10));
  };

  const esFutura = fecha > hoy();
  const fechaObj = new Date(fecha + "T12:00:00");
  const esHoy = fecha === hoy();

  const regsArray = alumnos.map((a) => ({
    alumnoId: a.id,
    estado: registros[a.id],
    // estado: registros[a.id] || "presente",
  }));

  if (loading) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Asistencia</Text>
          <Text style={styles.headerSub}>
            {curso?.nombre} · {escuela?.nombre}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("AsistenciaHistorial", { cursoId })
          }
          style={styles.histBtn}>
          <Ionicons name="calendar-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Selector de fecha */}
      <View style={styles.fechaBar}>
        <TouchableOpacity
          onPress={() => cambiarFecha(-1)}
          style={styles.fechaArrow}>
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
        </TouchableOpacity>
        <View style={styles.fechaCenter}>
          <Text style={styles.fechaDia}>
            {esHoy ? "Hoy · " : ""}
            {diasSemana[fechaObj.getDay()]} {fechaObj.getDate()} de{" "}
            {meses[fechaObj.getMonth()]} {fechaObj.getFullYear()}
          </Text>
          {guardado && (
            <View style={styles.guardadoBadge}>
              <Ionicons
                name="checkmark-circle"
                size={12}
                color={colors.success}
              />
              <Text style={styles.guardadoText}>Guardado</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={() => !esFutura && cambiarFecha(1)}
          style={[styles.fechaArrow, esFutura && { opacity: 0.3 }]}
          disabled={esFutura}>
          <Ionicons name="chevron-forward" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Acciones rápidas */}
      <View style={styles.accionesBar}>
        <Text style={styles.accionesLabel}>Marcar todos:</Text>
        {ESTADOS.map((e) => (
          <TouchableOpacity
            key={e.key}
            style={[styles.accionBtn, { backgroundColor: e.bg }]}
            onPress={() => marcarTodos(e.key)}>
            <Text style={[styles.accionText, { color: e.color }]}>
              {e.labelFull}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Resumen */}
      <ResumenChips registros={regsArray} />

      {/* Lista de alumnos */}
      {alumnos.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="people-outline" size={48} color={colors.border} />
          <Text style={styles.emptyText}>No hay alumnos en este curso</Text>
        </View>
      ) : (
        <FlatList
          data={alumnos}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <AlumnoRow
              alumno={item}
              estado={registros[item.id]}
              // estado={registros[item.id] || "presente"}
              onToggle={toggleEstado}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: spacing.lg,
            paddingBottom: 100,
          }}
        />
      )}

      {/* Botón guardar */}
      {!guardado && alumnos.length > 0 && (
        <View style={styles.saveBar}>
          <TouchableOpacity
            style={[styles.saveBtn, saving && { opacity: 0.7 }]}
            onPress={handleGuardar}
            disabled={saving}>
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="checkmark" size={20} color="#fff" />
            )}
            <Text style={styles.saveBtnText}>
              {saving ? "Guardando..." : "Guardar asistencia"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },

  header: {
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
  backBtn: { padding: 4 },
  histBtn: { padding: 4 },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#fff" },
  headerSub: { fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 2 },

  fechaBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
  },
  fechaArrow: { padding: spacing.sm },
  fechaCenter: { flex: 1, alignItems: "center" },
  fechaDia: { fontSize: 14, fontWeight: "500", color: colors.text },
  guardadoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  guardadoText: { fontSize: 11, color: colors.success },

  accionesBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    flexWrap: "wrap",
  },
  accionesLabel: { fontSize: 12, color: colors.textSecondary, marginRight: 2 },
  accionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  accionText: { fontSize: 11, fontWeight: "600" },

  saveBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    backgroundColor: colors.background,
    borderTopWidth: 0.5,
    borderTopColor: colors.border,
  },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  saveBtnText: { fontSize: 15, fontWeight: "600", color: "#fff" },
});

const resumen = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  chip: {
    flex: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    alignItems: "center",
  },
  chipNum: { fontSize: 18, fontWeight: "700" },
  chipLabel: { fontSize: 9, fontWeight: "600", marginTop: 1 },
});

const row = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 0.5,
    borderColor: colors.border,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
    ...shadow.sm,
  },
  nombre: { flex: 1, fontSize: 13, fontWeight: "500", color: colors.text },
  buttons: { flexDirection: "row", gap: 5 },
  btn: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    borderWidth: 0.5,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceAlt,
  },
  btnText: { fontSize: 12, fontWeight: "700" },
});
