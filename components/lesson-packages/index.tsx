import type { LessonClassStatus, LessonPackage } from "@/types/lesson-package";
import {
  formatLessonDate,
  getLessonPackageInterval,
  sortLessonClasses,
} from "@/utils/lesson-packages";
import {
  AlertTriangle,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  CircleX,
  Clock3,
  Eye,
} from "lucide-react-native";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const statusLabels = {
  active: "Ativo",
  paused: "Pausado",
  finished: "Finalizado",
};
const classStatus = {
  scheduled: { label: "Programada", color: "#9AA8BD", Icon: Clock3 },
  pending: { label: "Pendente", color: "#F5B84D", Icon: CalendarClock },
  finished: { label: "Finalizada", color: "#37DEBC", Icon: CheckCircle2 },
  canceled: { label: "Cancelada", color: "#FF7485", Icon: CircleX },
} satisfies Record<
  LessonClassStatus,
  { label: string; color: string; Icon: typeof Clock3 }
>;

export function PackageSchedule({
  lessonPackage,
}: {
  lessonPackage: LessonPackage;
}) {
  const classes = sortLessonClasses(lessonPackage.classes);
  const completed = classes.filter((item) => item.status === "finished").length;
  const barterCount = classes.filter((item) => item.type === "barter").length;
  const rescheduledCount = classes.filter(
    (item) => item.status === "pending" || item.type === "pending",
  ).length;
  const amount = Number(lessonPackage.totalAmount);
  const summary = [
    {
      label: "Valor total",
      value: Number.isFinite(amount)
        ? new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(amount)
        : "—",
    },
    { label: "Quantidade de aulas", value: classes.length },
    ...(barterCount > 0 ? [{ label: "Permutas", value: barterCount }] : []),
    ...(rescheduledCount > 0
      ? [{ label: "Remarcadas", value: rescheduledCount }]
      : []),
  ];
  return (
    <View style={styles.schedule}>
      <View style={styles.packageHeader}>
        <View style={styles.headingContent}>
          <Text style={styles.eyebrow}>
            {statusLabels[lessonPackage.status]}
          </Text>
          <Text accessibilityRole="header" style={styles.title}>
            {lessonPackage.title}
          </Text>
        </View>
        <View style={styles.calendarIcon}>
          <CalendarDays size={24} color="#37DEBC" />
        </View>
      </View>
      {!!lessonPackage.description && (
        <Text style={styles.description}>{lessonPackage.description}</Text>
      )}
      <Text style={styles.progress}>
        {completed} de {classes.length} aulas finalizadas
      </Text>
      <View style={styles.summary}>
        {summary.map(({ label, value }) => (
          <View
            key={label}
            style={styles.summaryItem}
            accessible
            accessibilityLabel={`${label}: ${value}`}
          >
            <Text style={styles.summaryLabel}>{label}</Text>
            <Text style={styles.summaryValue}>{value}</Text>
          </View>
        ))}
      </View>
      <View style={styles.sectionHeading}>
        <Text accessibilityRole="header" style={styles.sectionTitle}>
          Cronograma de aulas
        </Text>
        <Text style={styles.count}>
          {classes.length} {classes.length === 1 ? "aula" : "aulas"}
        </Text>
      </View>
      {classes.length === 0 && (
        <Text style={styles.description}>
          Nenhuma aula cadastrada neste pacote.
        </Text>
      )}
      {classes.map((lessonClass, index) => {
        const status = classStatus[lessonClass.status];
        const StatusIcon = status.Icon;
        const typeLabel =
          lessonClass.type === "barter"
            ? "Permuta"
            : lessonClass.type === "pending"
              ? "Aula pendente"
              : null;
        return (
          <View key={lessonClass.id} style={styles.classRow}>
            <View
              style={[
                styles.sequence,
                lessonClass.status === "finished" && styles.sequenceFinished,
              ]}
            >
              <Text
                style={[
                  styles.sequenceText,
                  lessonClass.status === "finished" && styles.finishedText,
                ]}
              >
                {index + 1}
              </Text>
            </View>
            <View style={styles.classContent}>
              <Text style={styles.classDate}>
                {formatLessonDate(lessonClass.scheduledDate, true)}
                {lessonClass.scheduledTime
                  ? ` · ${lessonClass.scheduledTime.slice(0, 5)}`
                  : ""}
              </Text>
              <View style={styles.classMeta}>
                <StatusIcon
                  size={14}
                  color={status.color}
                  accessibilityElementsHidden
                />
                <Text style={[styles.classStatus, { color: status.color }]}>
                  {status.label}
                </Text>
                {typeLabel && (
                  <Text style={styles.typeLabel}>· {typeLabel}</Text>
                )}
              </View>
              {!!lessonClass.notes && (
                <Text style={styles.classNotes}>{lessonClass.notes}</Text>
              )}
            </View>
          </View>
        );
      })}
      {!!lessonPackage.warnings && (
        <View style={styles.warnings}>
          <View style={styles.classMeta}>
            <AlertTriangle size={18} color="#F5B84D" />
            <Text accessibilityRole="header" style={styles.warningsTitle}>
              Avisos
            </Text>
          </View>
          <Text style={styles.warningsText}>{lessonPackage.warnings}</Text>
        </View>
      )}
    </View>
  );
}

export function FinishedPackageCard({
  lessonPackage,
  onPress,
}: {
  lessonPackage: LessonPackage;
  onPress: () => void;
}) {
  const interval = getLessonPackageInterval(lessonPackage.classes);
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`Ver pacote ${lessonPackage.title}`}
      activeOpacity={0.8}
      onPress={onPress}
      style={styles.archiveCard}
    >
      <View style={styles.packageHeader}>
        <Text style={[styles.title, styles.headingContent]}>
          {lessonPackage.title}
        </Text>
        <View style={styles.calendarIcon}>
          <Eye size={22} color="#37DEBC" />
        </View>
      </View>
      {!!lessonPackage.description && (
        <Text style={styles.description}>{lessonPackage.description}</Text>
      )}
      <View style={styles.archiveDates}>
        <Text style={styles.description}>
          Início:{" "}
          <Text style={styles.dateValue}>
            {formatLessonDate(interval.start)}
          </Text>
        </Text>
        <Text style={styles.description}>
          Fim:{" "}
          <Text style={styles.dateValue}>{formatLessonDate(interval.end)}</Text>
        </Text>
      </View>
      <Text style={styles.count}>
        Total de aulas: {lessonPackage.classes.length}
      </Text>
    </TouchableOpacity>
  );
}

export function PackageState({
  title,
  description,
  loading,
  onRetry,
}: {
  title: string;
  description?: string;
  loading?: boolean;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.state}>
      {loading ? (
        <ActivityIndicator color="#37DEBC" size="large" />
      ) : (
        <CalendarDays color="#37DEBC" size={36} />
      )}
      <Text accessibilityRole="header" style={styles.stateTitle}>
        {title}
      </Text>
      {!!description && (
        <Text style={styles.stateDescription}>{description}</Text>
      )}
      {onRetry && (
        <TouchableOpacity
          accessibilityRole="button"
          onPress={onRetry}
          style={styles.retry}
        >
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  schedule: {
    padding: 20,
    borderRadius: 22,
    backgroundColor: "#0D1D2E",
    borderWidth: 1,
    borderColor: "#223247",
    gap: 14,
  },
  packageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  headingContent: { flex: 1 },
  eyebrow: {
    color: "#37DEBC",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  title: { color: "#F7F8FA", fontWeight: "700", fontSize: 21, lineHeight: 28 },
  calendarIcon: {
    width: 44,
    height: 44,
    backgroundColor: "rgba(55,222,188,0.10)",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },
  description: { color: "#AAB7C9", fontSize: 14, lineHeight: 21 },
  progress: { color: "#37DEBC", fontSize: 13, fontWeight: "600" },
  summary: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#12263A",
  },
  summaryItem: { flexGrow: 1, flexBasis: "45%", minWidth: 120, gap: 6 },
  summaryLabel: { color: "#AAB7C9", fontSize: 12, lineHeight: 18 },
  summaryValue: { color: "#F7F8FA", fontSize: 18, fontWeight: "700" },
  sectionHeading: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#223247",
  },
  sectionTitle: { color: "#F7F8FA", fontSize: 15, fontWeight: "600" },
  count: { color: "#AAB7C9", fontSize: 13 },
  classRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
    paddingVertical: 8,
  },
  sequence: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: "#192C40",
    alignItems: "center",
    justifyContent: "center",
  },
  sequenceFinished: { backgroundColor: "rgba(55,222,188,0.12)" },
  sequenceText: { fontSize: 13, fontWeight: "600", color: "#AAB7C9" },
  finishedText: { color: "#37DEBC" },
  classContent: { flex: 1, gap: 5 },
  classDate: {
    color: "#F7F8FA",
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 21,
  },
  classMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
  },
  classStatus: { fontSize: 12 },
  typeLabel: { color: "#CED7E4", fontSize: 12 },
  classNotes: { color: "#92A0B7", fontSize: 12, lineHeight: 18 },
  warnings: {
    gap: 10,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "rgba(245,184,77,0.08)",
    borderWidth: 1,
    borderColor: "rgba(245,184,77,0.22)",
    marginTop: 8,
  },
  warningsTitle: { color: "#F5B84D", fontWeight: "700", fontSize: 14 },
  warningsText: { color: "#E2D6BD", fontSize: 14, lineHeight: 21 },
  archiveCard: {
    padding: 20,
    gap: 14,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#223247",
    backgroundColor: "#0D1D2E",
  },
  archiveDates: {
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 18,
    rowGap: 6,
  },
  dateValue: { color: "#F7F8FA" },
  state: {
    paddingVertical: 64,
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 16,
  },
  stateTitle: {
    color: "#F7F8FA",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  stateDescription: {
    color: "#9AA8BD",
    fontSize: 14,
    lineHeight: 22,
    textAlign: "center",
  },
  retry: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "rgba(55,222,188,0.12)",
  },
  retryText: { color: "#37DEBC", fontSize: 14, fontWeight: "600" },
});
