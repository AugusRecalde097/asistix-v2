import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SectionList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import {
  getAlumnos,
  getCursos,
  getEscuelas,
  getAsistenciasPorCurso,
  deleteAsistencia,
} from "../storage/db";
import { colors, spacing, radius, shadow } from "../theme/colors";

const ESTADOS = {
  presente: { label: "P", color: "#2E7D32", bg: "#E8F5E9" },
  ausente: { label: "A", color: "#C62828", bg: "#FFEBEE" },
  tardanza: { label: "T", color: "#E65100", bg: "#FFF3E0" },
  justificado: { label: "J", color: "#1565C0", bg: "#E3F2FD" },
};

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
const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const formatFechaBonita = (iso) => {
  if (!iso) return "";
  const d = new Date(iso + "T12:00:00");
  return `${diasSemana[d.getDay()]} ${d.getDate()} ${meses[d.getMonth()]}`;
};

const getMesAnio = (iso) => {
  const [y, m] = iso.split("-");
  return `${meses[parseInt(m) - 1]} ${y}`;
};

// ─── Grilla de chips de estado por alumno en un día ──────────────
function DiaCard({ asistencia, alumnos, onPress, onDelete }) {
  const alumnoMap = Object.fromEntries(alumnos.map((a) => [a.id, a]));
  const counts = { presente: 0, ausente: 0, tardanza: 0, justificado: 0 };
  asistencia.registros?.forEach((r) => {
    if (counts[r.estado] !== undefined) counts[r.estado]++;
  });
  const total = asistencia.registros?.length || 0;

  return (
    <TouchableOpacity
      style={diaCard.container}
      onPress={onPress}
      activeOpacity={0.75}>
      <View style={diaCard.top}>
        <View>
          <Text style={diaCard.fecha}>
            {formatFechaBonita(asistencia.fecha)}
          </Text>
          <Text style={diaCard.total}>{total} alumnos</Text>
        </View>
        <View style={diaCard.contadores}>
          {Object.entries(counts).map(([key, val]) =>
            val > 0 ? (
              <View
                key={key}
                style={[
                  diaCard.countChip,
                  { backgroundColor: ESTADOS[key]?.bg },
                ]}>
                <Text
                  style={[diaCard.countNum, { color: ESTADOS[key]?.color }]}>
                  {val}
                </Text>
                <Text
                  style={[diaCard.countLbl, { color: ESTADOS[key]?.color }]}>
                  {ESTADOS[key]?.label}
                </Text>
              </View>
            ) : null,
          )}
        </View>
        <TouchableOpacity onPress={onDelete} style={diaCard.trashBtn}>
          <Ionicons name="trash-outline" size={16} color={colors.textHint} />
        </TouchableOpacity>
      </View>
      {/* mini grilla de alumnos */}
      <View style={diaCard.grid}>
        {asistencia.registros?.map((r) => {
          const a = alumnoMap[r.alumnoId];
          const est = ESTADOS[r.estado] || ESTADOS.presente;
          if (!a) return null;
          return (
            <View
              key={r.alumnoId}
              style={[diaCard.pill, { backgroundColor: est.bg }]}>
              <Text
                style={[diaCard.pillText, { color: est.color }]}
                numberOfLines={1}>
                {a.apellido?.split(" ")[0]} {a.nombre?.[0]}.
              </Text>
            </View>
          );
        })}
      </View>
    </TouchableOpacity>
  );
}

// ─── Pantalla ─────────────────────────────────────────────────────
export default function AsistenciaHistorialScreen({ route, navigation }) {
  const { cursoId } = route.params;

  const [curso, setCurso] = useState(null);
  const [escuela, setEscuela] = useState(null);
  const [alumnos, setAlumnos] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("historial"); // 'historial' | 'alumnos'
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState(null);

  const loadData = useCallback(async () => {
    const [cursos, escuelas, todosAlumnos, asists] = await Promise.all([
      getCursos(),
      getEscuelas(),
      getAlumnos(),
      getAsistenciasPorCurso(cursoId),
    ]);
    const c = cursos.find((x) => x.id === cursoId);
    const e = escuelas.find((x) => x.id === c?.escuelaId);
    const alumnosCurso = todosAlumnos
      .filter((a) => a.cursoId === cursoId)
      .sort((a, b) => a.apellido.localeCompare(b.apellido));
    setCurso(c);
    setEscuela(e);
    setAlumnos(alumnosCurso);
    setHistorial(asists);
    setLoading(false);
  }, [cursoId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const handleDelete = async (asist) => {
    await deleteAsistencia(asist.cursoId, asist.fecha);
    loadData();
  };

  // Agrupar historial por mes
  const secciones = React.useMemo(() => {
    const grupos = {};
    historial.forEach((a) => {
      const mes = getMesAnio(a.fecha);
      if (!grupos[mes]) grupos[mes] = [];
      grupos[mes].push(a);
    });
    return Object.entries(grupos).map(([title, data]) => ({ title, data }));
  }, [historial]);

  // Resumen por alumno
  const resumenAlumnos = React.useMemo(() => {
    return alumnos.map((a) => {
      const counts = {
        presente: 0,
        ausente: 0,
        tardanza: 0,
        justificado: 0,
        total: 0,
      };
      historial.forEach((asist) => {
        const reg = asist.registros?.find((r) => r.alumnoId === a.id);
        if (reg) {
          counts[reg.estado] = (counts[reg.estado] || 0) + 1;
          counts.total++;
        }
      });
      const pct =
        counts.total > 0
          ? Math.round((counts.presente / counts.total) * 100)
          : 100;
      return { ...a, counts, pct };
    });
  }, [alumnos, historial]);

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
          <Text style={styles.headerTitle}>Historial</Text>
          <Text style={styles.headerSub}>
            {curso?.nombre} · {escuela?.nombre}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate("AsistenciaTomar", { cursoId })}
          style={styles.hoyBtn}>
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === "historial" && styles.tabBtnActive]}
          onPress={() => setTab("historial")}>
          <Ionicons
            name="calendar-outline"
            size={15}
            color={tab === "historial" ? colors.primary : colors.textHint}
          />
          <Text
            style={[
              styles.tabText,
              tab === "historial" && styles.tabTextActive,
            ]}>
            Por fecha
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, tab === "alumnos" && styles.tabBtnActive]}
          onPress={() => setTab("alumnos")}>
          <Ionicons
            name="people-outline"
            size={15}
            color={tab === "alumnos" ? colors.primary : colors.textHint}
          />
          <Text
            style={[styles.tabText, tab === "alumnos" && styles.tabTextActive]}>
            Por alumno
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contenido */}
      {tab === "historial" ? (
        secciones.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="calendar-outline" size={48} color={colors.border} />
            <Text style={styles.emptyTitle}>Sin registros todavía</Text>
            <Text style={styles.emptySubtitle}>
              Tomá la asistencia de hoy para empezar
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() =>
                navigation.navigate("AsistenciaTomar", { cursoId })
              }>
              <Text style={styles.emptyBtnText}>Tomar asistencia hoy</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <SectionList
            sections={secciones}
            keyExtractor={(item) => item.id}
            renderSectionHeader={({ section }) => (
              <Text style={styles.mesHeader}>{section.title}</Text>
            )}
            renderItem={({ item }) => (
              <DiaCard
                asistencia={item}
                alumnos={alumnos}
                onPress={() =>
                  navigation.navigate("AsistenciaTomar", {
                    cursoId,
                    fecha: item.fecha,
                  })
                }
                onDelete={() => handleDelete(item)}
              />
            )}
            contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          />
        )
      ) : (
        <FlatList
          data={resumenAlumnos}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={alumnoRow.container}
              onPress={() =>
                setAlumnoSeleccionado(
                  alumnoSeleccionado?.id === item.id ? null : item,
                )
              }
              activeOpacity={0.75}>
              <View style={alumnoRow.top}>
                <View style={alumnoRow.info}>
                  <Text style={alumnoRow.nombre}>
                    {item.apellido}, {item.nombre}
                  </Text>
                  <Text style={alumnoRow.dias}>
                    {item.counts.total} días registrados
                  </Text>
                </View>
                <View style={alumnoRow.pctBox}>
                  <Text
                    style={[
                      alumnoRow.pct,
                      {
                        color:
                          item.pct >= 85
                            ? "#2E7D32"
                            : item.pct >= 70
                              ? "#E65100"
                              : "#C62828",
                      },
                    ]}>
                    {item.pct}%
                  </Text>
                  <Text style={alumnoRow.pctLabel}>asistencia</Text>
                </View>
              </View>
              {/* Barra de progreso */}
              <View style={alumnoRow.barTrack}>
                <View
                  style={[
                    alumnoRow.barFill,
                    {
                      width: `${item.pct}%`,
                      backgroundColor:
                        item.pct >= 85
                          ? "#2E7D32"
                          : item.pct >= 70
                            ? "#E65100"
                            : "#C62828",
                    },
                  ]}
                />
              </View>
              {/* Desglose expandido */}
              {alumnoSeleccionado?.id === item.id && (
                <View style={alumnoRow.desglose}>
                  {Object.entries(ESTADOS).map(([key, est]) => (
                    <View
                      key={key}
                      style={[
                        alumnoRow.desgloseChip,
                        { backgroundColor: est.bg },
                      ]}>
                      <Text
                        style={[alumnoRow.desgloseNum, { color: est.color }]}>
                        {item.counts[key] || 0}
                      </Text>
                      <Text
                        style={[alumnoRow.desgloseLbl, { color: est.color }]}>
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          )}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyTitle}>
                No hay alumnos en este curso
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxl,
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
  hoyBtn: { padding: 4 },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#fff" },
  headerSub: { fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 2 },
  tabs: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.lg,
  },
  tabBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabBtnActive: { borderBottomColor: colors.primary },
  tabText: { fontSize: 13, color: colors.textHint, fontWeight: "500" },
  tabTextActive: { color: colors.primary },
  mesHeader: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.textHint,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text,
    marginTop: spacing.md,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  emptyBtn: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
  },
  emptyBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
});

const diaCard = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 0.5,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.sm,
  },
  top: { flexDirection: "row", alignItems: "center", marginBottom: spacing.sm },
  fecha: { fontSize: 14, fontWeight: "500", color: colors.text },
  total: { fontSize: 11, color: colors.textHint, marginTop: 1 },
  contadores: {
    flex: 1,
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
  },
  countChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    alignItems: "center",
    flexDirection: "row",
    gap: 3,
  },
  countNum: { fontSize: 13, fontWeight: "700" },
  countLbl: { fontSize: 11, fontWeight: "600" },
  trashBtn: { padding: 4 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  pill: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: radius.full },
  pillText: { fontSize: 11, fontWeight: "500" },
});

const alumnoRow = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 0.5,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadow.sm,
  },
  top: { flexDirection: "row", alignItems: "center", marginBottom: spacing.sm },
  info: { flex: 1 },
  nombre: { fontSize: 14, fontWeight: "500", color: colors.text },
  dias: { fontSize: 11, color: colors.textHint, marginTop: 1 },
  pctBox: { alignItems: "center" },
  pct: { fontSize: 20, fontWeight: "700" },
  pctLabel: { fontSize: 10, color: colors.textHint },
  barTrack: {
    height: 5,
    backgroundColor: colors.borderLight,
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: { height: 5, borderRadius: 3 },
  desglose: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
  desgloseChip: {
    flex: 1,
    borderRadius: radius.md,
    paddingVertical: 6,
    alignItems: "center",
  },
  desgloseNum: { fontSize: 16, fontWeight: "700" },
  desgloseLbl: { fontSize: 9, fontWeight: "600", marginTop: 1 },
});
