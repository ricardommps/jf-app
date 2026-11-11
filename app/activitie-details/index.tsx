import NotificationV2CommentsModal from "@/app/notifications-v2/components/notification-v2-comments-modal";
import { ActivityDetailsMap } from "@/app/activitie-details/components/activity-details-map";
import { IndoorIntensityChart } from "@/app/activitie-details/components/indoor-intensity-chart";
import Loading from "@/components/shared/loading";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { getFinishedActivitiesDetails } from "@/services/finished.service";
import { rpeConfiguration } from "@/utils/rpe-configuration";
import { ActivityDetailsResponse } from "@/types/activity-details";
import {
  convertMetersToKilometersFormat,
  convertSecondsToHourMinuteFormat,
} from "@/utils/convertValues";
import { formatRunningWorkoutTitle } from "@/utils/workout-labels";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useQuery } from "@tanstack/react-query";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  ArrowLeft,
  CalendarDays,
  Pencil,
  MessageCircleIcon,
  Share2,
} from "lucide-react-native";
import { useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const getStringParam = (value?: string | string[]) => {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
};

const displayValue = (value?: string | number | null) => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "-";
  }

  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized.length ? normalized : "-";
  }

  return "-";
};

const formatMetricValue = (value?: string | number | null) => {
  return displayValue(value);
};

const sanitizeMetricString = (value: string) => {
  return value
    .trim()
    .toLowerCase()
    .replace(/km\/h/g, "")
    .replace(/\/km/g, "")
    .replace(/bpm/g, "")
    .replace(/\s+/g, "");
};

const parseTimeLikeString = (value: string) => {
  const parts = value.split(":").map((item) => Number(item));

  if (
    parts.length < 2 ||
    parts.length > 3 ||
    parts.some((item) => Number.isNaN(item))
  ) {
    return null;
  }

  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  }

  const [hours, minutes, seconds] = parts;
  return hours * 3600 + minutes * 60 + seconds;
};

const parsePositiveMetricNumber = (value: unknown): number | null => {
  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  if (typeof value !== "string") {
    return null;
  }

  const sanitized = sanitizeMetricString(value);

  if (!sanitized || ["null", "undefined", "nan"].includes(sanitized)) {
    return null;
  }

  const timeInSeconds = parseTimeLikeString(sanitized);

  if (timeInSeconds !== null) {
    return timeInSeconds > 0 ? timeInSeconds : null;
  }

  if (!/^[-+]?\d+(?:[.,]\d+)?$/.test(sanitized)) {
    return null;
  }

  const parsed = Number(sanitized.replace(",", "."));

  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

const parsePaceDecimalNotationToSeconds = (value: unknown): number | null => {
  if (typeof value === "number") {
    if (!Number.isFinite(value) || value <= 0) {
      return null;
    }

    if (value > 60) {
      return Math.round(value);
    }

    const [rawMinutes, rawSeconds = ""] = value.toString().split(".");
    const minutes = Number(rawMinutes);

    if (!Number.isFinite(minutes) || minutes < 0) {
      return null;
    }

    if (!rawSeconds) {
      return minutes > 0 ? minutes * 60 : null;
    }

    const seconds = Number(rawSeconds.padEnd(2, "0").slice(0, 2));

    if (Number.isFinite(seconds) && seconds >= 0 && seconds < 60) {
      return minutes * 60 + seconds;
    }

    return Math.round(value * 60);
  }

  if (typeof value !== "string") {
    return null;
  }

  const sanitized = sanitizeMetricString(value);

  if (!sanitized || ["null", "undefined", "nan"].includes(sanitized)) {
    return null;
  }

  const timeInSeconds = parseTimeLikeString(sanitized);

  if (timeInSeconds !== null) {
    return timeInSeconds > 0 ? timeInSeconds : null;
  }

  const match = sanitized.match(/^(\d{1,2})(?:[.,](\d{1,2}))?$/);

  if (!match) {
    return null;
  }

  const minutes = Number(match[1]);
  const rawSeconds = match[2] ?? "";

  if (!Number.isFinite(minutes) || minutes < 0) {
    return null;
  }

  if (!rawSeconds) {
    return minutes > 0 ? minutes * 60 : null;
  }

  const seconds = Number(rawSeconds.padEnd(2, "0").slice(0, 2));

  if (Number.isFinite(seconds) && seconds >= 0 && seconds < 60) {
    return minutes * 60 + seconds;
  }

  const parsed = Number(sanitized.replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed * 60) : null;
};

const hasVisibleMetricValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === "string") {
    const normalized = value.trim();

    if (!normalized || normalized === "-") {
      return false;
    }

    const sanitized = sanitizeMetricString(normalized);

    if (
      ["", "0", "0.0", "0.00", "null", "undefined", "nan"].includes(
        sanitized,
      )
    ) {
      return false;
    }

    const parsed = parsePositiveMetricNumber(normalized);

    if (parsed !== null) {
      return parsed > 0;
    }

    return true;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0;
  }

  return true;
};

const hasVisibleIndoorMetricValue = (value: unknown) => {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === "string") {
    const normalized = value.trim();

    if (!normalized || normalized === "-") {
      return false;
    }

    const sanitized = sanitizeMetricString(normalized);

    if (
      [
        "",
        "0:00",
        "00:00",
        "0:00:00",
        "00:00:00",
        "null",
        "undefined",
        "nan",
      ].includes(sanitized)
    ) {
      return false;
    }

    const timeInSeconds = parseTimeLikeString(sanitized);

    if (timeInSeconds !== null) {
      return timeInSeconds > 0;
    }

    if (/^[-+]?\d+(?:[.,]\d+)?$/.test(sanitized)) {
      const numericValue = Number(sanitized.replace(",", "."));

      if (Number.isFinite(numericValue) && numericValue <= 0) {
        return false;
      }
    }

    const parsed = parsePositiveMetricNumber(normalized);

    if (parsed !== null) {
      return parsed > 0;
    }

    return true;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0;
  }

  return true;
};

const getFieldFromRecords = (
  records: Array<Record<string, unknown>>,
  fieldNames: string[],
) => {
  for (const record of records) {
    for (const fieldName of fieldNames) {
      const value = record[fieldName];

      if (value !== undefined && value !== null) {
        return value;
      }
    }
  }

  return null;
};

const getActivityField = (
  details: ActivityDetailsResponse,
  fieldNames: string[],
) => {
  return getFieldFromRecords(
    [
      details as Record<string, unknown>,
      details.metrics as Record<string, unknown>,
    ],
    fieldNames,
  );
};

const normalizeExplicitIndoorUnitMeasurement = (value: unknown) => {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedUnit = value.trim().toLowerCase();

  if (
    normalizedUnit.includes("pace") ||
    normalizedUnit.includes("/km") ||
    normalizedUnit.includes("min")
  ) {
    return "pace" as const;
  }

  if (normalizedUnit.includes("km")) {
    return "km" as const;
  }

  return null;
};

const hasKmHint = (value: unknown) => {
  return typeof value === "string" && /km\s*\/\s*h|kmh/i.test(value);
};

const hasPaceHint = (value: unknown) => {
  if (typeof value !== "string") {
    return false;
  }

  const normalizedValue = value.trim().toLowerCase();

  return (
    normalizedValue.includes("/km") ||
    /^\d{1,2}:\d{2}(?::\d{2})?$/.test(normalizedValue)
  );
};

const looksLikePaceDecimalNotation = (value: unknown) => {
  if (typeof value !== "string" && typeof value !== "number") {
    return false;
  }

  const normalized =
    typeof value === "number" ? value.toString() : sanitizeMetricString(value);

  if (!normalized || normalized.includes(":")) {
    return false;
  }

  const match = normalized.match(/^(\d{1,2})(?:[.,](\d{1,2}))$/);

  if (!match) {
    return false;
  }

  const minutes = Number(match[1]);
  const seconds = Number(match[2].padEnd(2, "0").slice(0, 2));

  return (
    Number.isFinite(minutes) &&
    Number.isFinite(seconds) &&
    minutes > 0 &&
    minutes <= 20 &&
    seconds > 0 &&
    seconds < 60
  );
};

const getIndoorIntensityEntries = (value: unknown): unknown[] => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return value === null || value === undefined ? [] : [value];
  }

  const normalized = value.trim();

  if (!normalized) {
    return [];
  }

  try {
    return getIndoorIntensityEntries(JSON.parse(normalized));
  } catch {
    // Ignore JSON parsing errors and try a looser extraction below.
  }

  const timeTokens = normalized.match(
    /\d{1,2}:\d{2}(?::\d{2})?(?:\s*\/km)?/gi,
  );

  if (timeTokens?.length) {
    return timeTokens;
  }

  const numericTokens = normalized.match(/-?\d+(?:[.,]\d+)?/g) ?? [];

  if (numericTokens.length > 1) {
    return numericTokens;
  }

  return [normalized];
};

const getIndoorIntensityEntryValue = (entry: unknown): unknown => {
  if (typeof entry === "string") {
    const normalized = entry.trim();

    if (!normalized) {
      return null;
    }

    try {
      return getIndoorIntensityEntryValue(JSON.parse(normalized));
    } catch {
      return normalized;
    }
  }

  if (entry && typeof entry === "object" && !Array.isArray(entry)) {
    const record = entry as Record<string, unknown>;
    const nestedValue =
      record.value ??
      record.intensitie ??
      record.intensity ??
      record.pace ??
      record.speed ??
      null;

    return nestedValue !== null
      ? getIndoorIntensityEntryValue(nestedValue)
      : null;
  }

  return entry;
};

const getExplicitIndoorUnitMeasurement = (
  details: ActivityDetailsResponse,
) => {
  const unitCandidates = [
    getFieldFromRecords(
      [
        details as Record<string, unknown>,
        details.metrics as Record<string, unknown>,
      ],
      ["unitMeasurement", "unitmeasurement"],
    ),
  ];

  for (const candidate of unitCandidates) {
    const normalizedCandidate = normalizeExplicitIndoorUnitMeasurement(candidate);

    if (normalizedCandidate) {
      return normalizedCandidate;
    }
  }

  return null;
};

const inferIndoorUnitMeasurementFromCandidates = (
  candidates: unknown[],
  explicitUnit: "pace" | "km" | null = null,
) => {
  if (explicitUnit) {
    return explicitUnit;
  }

  if (candidates.some(hasKmHint)) {
    return "km" as const;
  }

  if (candidates.some(hasPaceHint)) {
    return "pace" as const;
  }

  const flattenedCandidates = candidates.flatMap((candidate) =>
    Array.isArray(candidate) ? candidate : [candidate],
  );

  if (flattenedCandidates.some(looksLikePaceDecimalNotation)) {
    return "pace" as const;
  }

  const numericCandidates = candidates.flatMap((candidate) => {
    if (Array.isArray(candidate)) {
      return candidate
        .map((entry) => parsePositiveMetricNumber(entry))
        .filter((entry): entry is number => entry !== null);
    }

    const parsed = parsePositiveMetricNumber(candidate);
    return parsed !== null ? [parsed] : [];
  });

  if (!numericCandidates.length) {
    return explicitUnit;
  }

  const maxValue = Math.max(...numericCandidates);
  const hasFractionalValues = numericCandidates.some(
    (entry) => !Number.isInteger(entry),
  );

  if (maxValue <= 30) {
    return "km" as const;
  }

  if (hasFractionalValues && maxValue < 100) {
    return "km" as const;
  }

  return "pace" as const;
};

const inferIndoorIntensityUnitMeasurement = (
  details: ActivityDetailsResponse,
  explicitUnit: "pace" | "km" | null,
) => {
  const intensityEntryValues = getIndoorIntensityEntries(
    getActivityField(details, ["intensities"]),
  )
    .map((entry) => getIndoorIntensityEntryValue(entry))
    .filter((entry): entry is string | number => entry !== null);

  return inferIndoorUnitMeasurementFromCandidates(
    intensityEntryValues,
    explicitUnit,
  );
};

const inferIndoorWarmUpCoolDownUnitMeasurement = (
  details: ActivityDetailsResponse,
  explicitUnit: "pace" | "km" | null,
) => {
  const candidates = [
    getActivityField(details, [
      "warmUpIntensitiesLabel",
      "warmUpIntensityLabel",
      "warmUpPaceLabel",
      "warmupIntensitiesLabel",
      "warmupIntensityLabel",
      "warmupPaceLabel",
    ]),
    getActivityField(details, [
      "warmUpIntensities",
      "warmUpIntensity",
      "warmUpPace",
      "warmupIntensities",
      "warmupIntensity",
      "warmupPace",
    ]),
    getActivityField(details, [
      "coolDownIntensitiesLabel",
      "coolDownIntensityLabel",
      "coolDownPaceLabel",
      "cooldownIntensitiesLabel",
      "cooldownIntensityLabel",
      "cooldownPaceLabel",
    ]),
    getActivityField(details, [
      "coolDownIntensities",
      "coolDownIntensity",
      "coolDownPace",
      "cooldownIntensities",
      "cooldownIntensity",
      "cooldownPace",
    ]),
  ];

  return inferIndoorUnitMeasurementFromCandidates(candidates, explicitUnit);
};

const normalizeIndoorSpeedValue = (value: number) => {
  return value > 60 ? value / 100 : value;
};

const formatKmPerHourValue = (value: number) => {
  return `${normalizeIndoorSpeedValue(value)
    .toFixed(2)
    .replace(/\.00$/, "")
    .replace(/(\.\d*[1-9])0$/, "$1")} km/h`;
};

const formatPaceValue = (seconds: number) => {
  const totalSeconds = Math.max(0, Math.round(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}/km`;
  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}/km`;
};

const formatIndoorDurationValue = (
  rawValue: unknown,
  rawLabel?: unknown,
): string | null => {
  if (hasVisibleIndoorMetricValue(rawLabel)) {
    return String(rawLabel).trim();
  }

  const parsedValue = parsePositiveMetricNumber(rawValue);

  if (parsedValue !== null) {
    return convertSecondsToHourMinuteFormat(parsedValue);
  }

  if (hasVisibleIndoorMetricValue(rawValue)) {
    return String(rawValue).trim();
  }

  return null;
};

const formatIndoorIntensityValue = (
  rawValue: unknown,
  rawLabel: unknown,
  unitMeasurement: "pace" | "km" | null,
): string | null => {
  const effectiveUnit =
    unitMeasurement ??
    (hasPaceHint(rawValue) || looksLikePaceDecimalNotation(rawValue)
      ? "pace"
      : "km");
  const parsedValue =
    parsePositiveMetricNumber(rawValue) ?? parsePositiveMetricNumber(rawLabel);

  if (parsedValue !== null) {
    if (effectiveUnit === "pace") {
      return convertSecondsToHourMinuteFormat(parsedValue);
    }

    return convertMetersToKilometersFormat(parsedValue);
  }

  if (hasVisibleIndoorMetricValue(rawLabel)) {
    return String(rawLabel).trim();
  }

  if (hasVisibleIndoorMetricValue(rawValue)) {
    return String(rawValue).trim();
  }

  return null;
};

const parseIntensitySeries = (value: unknown): number[] => {
  return getIndoorIntensityEntries(value)
    .map((entry) => parsePositiveMetricNumber(getIndoorIntensityEntryValue(entry)))
    .filter((entry): entry is number => entry !== null);
};

const formatIndoorIntensityChartLabel = (
  rawValue: unknown,
  unitMeasurement: "pace" | "km" | null,
): string | null => {
  const effectiveUnit =
    unitMeasurement ??
    (hasPaceHint(rawValue) || looksLikePaceDecimalNotation(rawValue)
      ? "pace"
      : "km");
  const parsedValue =
    effectiveUnit === "pace"
      ? parsePaceDecimalNotationToSeconds(rawValue)
      : parsePositiveMetricNumber(rawValue);

  if (parsedValue !== null) {
    return effectiveUnit === "km"
      ? formatKmPerHourValue(parsedValue)
      : formatPaceValue(parsedValue);
  }

  if (typeof rawValue !== "string") {
    return null;
  }

  const normalized = rawValue.trim();

  if (!normalized) {
    return null;
  }

  if (effectiveUnit === "km") {
    return hasKmHint(normalized) ? normalized : `${normalized} km/h`;
  }

  if (normalized.includes("/km")) {
    return normalized;
  }

  if (/^\d{1,2}:\d{2}(?::\d{2})?$/.test(normalized)) {
    return `${normalized}/km`;
  }

  return normalized;
};

const buildIndoorIntensityChartItems = (
  value: unknown,
  unitMeasurement: "pace" | "km" | null,
) => {
  return getIndoorIntensityEntries(value).flatMap((entry, index) => {
    const rawValue = getIndoorIntensityEntryValue(entry);
    const effectiveUnit =
      unitMeasurement ??
      (hasPaceHint(rawValue) || looksLikePaceDecimalNotation(rawValue)
        ? "pace"
        : "km");
    const numericValue =
      effectiveUnit === "pace"
        ? parsePaceDecimalNotationToSeconds(rawValue)
        : parsePositiveMetricNumber(rawValue);
    const label = formatIndoorIntensityChartLabel(rawValue, unitMeasurement);

    if (numericValue === null || label === null) {
      return [];
    }

    return [
      {
        effort: index + 1,
        value: numericValue,
        label,
      },
    ];
  });
};

const getRunningTitle = (details: ActivityDetailsResponse) => {
  const formattedTitle = formatRunningWorkoutTitle(details.trainingTitle);

  return (
    formattedTitle ??
    (details.trainingTitle ? displayValue(details.trainingTitle) : null) ??
    displayValue(details.title)
  );
};

const getActivityTypeLabel = (details: ActivityDetailsResponse) => {
  if (typeof details.outdoor !== "boolean") {
    return "-";
  }

  return details.outdoor ? "Corrida na rua" : "Corrida na esteira";
};

const getStrengthTitle = (details: ActivityDetailsResponse) => {
  const candidates = [
    details.title,
    details.trainingSubtitle,
    details.workout?.subtitle,
    details.trainingTitle,
    details.workout?.title,
  ];

  for (const candidate of candidates) {
    const normalized = displayValue(candidate);

    if (normalized !== "-") {
      return normalized;
    }
  }

  return "Treino de força";
};

const getStrengthSubtitle = (details: ActivityDetailsResponse) => {
  const title = getStrengthTitle(details);
  const candidates = [details.trainingTitle, details.workout?.title];

  for (const candidate of candidates) {
    const normalized = displayValue(candidate);

    if (normalized !== "-" && normalized !== title) {
      return normalized;
    }
  }

  return "Treino de força";
};

const getStrengthDurationLabel = (details: ActivityDetailsResponse) => {
  const directLabel = displayValue(details.metrics?.movingTimeLabel);

  if (directLabel !== "-") {
    return directLabel;
  }

  const durationInSeconds = parsePositiveMetricNumber(
    details.metrics?.movingTimeInSeconds ?? details.durationInSeconds,
  );

  if (durationInSeconds !== null) {
    return convertSecondsToHourMinuteFormat(durationInSeconds);
  }

  return "-";
};

function MetricBlock({
  label,
  value,
  icon,
  containerClassName,
}: {
  label: string;
  value: string | number | null | undefined;
  icon?: any;
  containerClassName?: string;
}) {
  return (
    <View className={containerClassName ?? "w-[31%]"}>
      <Text
        allowFontScaling={false}
        className="text-[13px] font-semibold leading-[15px] tracking-[0.6px] text-[#6C7385]"
      >
        {label}
      </Text>
      <View className="mt-[2px] flex-row items-center gap-2">
        <Text
          allowFontScaling={false}
          className="text-[25px] font-bold leading-[29px] text-white"
        >
          {formatMetricValue(value)}
        </Text>
        {icon ? <Icon as={icon} size="lg" className="text-white" /> : null}
      </View>
    </View>
  );
}

export default function ActivitieDetailsScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const { finishedId, source } = useLocalSearchParams<{
    finishedId?: string | string[];
    source?: string | string[];
  }>();

  const finishedIdStr = getStringParam(finishedId);
  const sourceStr = getStringParam(source);

  const {
    data: details,
    isLoading,
    isError,
    refetch,
  } = useQuery<ActivityDetailsResponse>({
    queryKey: ["finished-activity-details", finishedIdStr],
    queryFn: async () => getFinishedActivitiesDetails(finishedIdStr),
    enabled: !!finishedIdStr,
    staleTime: 0,
    gcTime: 0,
  });


  const handleBack = () => {
    if (sourceStr === "history") {
      router.replace("/(tabs)/(history)" as any);
      return;
    }

    if (navigation.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)/(home)" as any);
  };

  const handleOpenActivityLink = async () => {
    const url = details?.strava?.url ?? details?.link ?? null;

    if (!url) {
      return;
    }

    try {
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível abrir o link da atividade.");
    }
  };

  const handleShare = () => {
    if (!details) {
      return;
    }

    router.push({
      pathname: "/shared",
      params: {
        id: finishedIdStr,
        layout: details.unrealized ? "2" : "1",
        ...(details.unrealized ? { unrealizedTraining: "true" } : {}),
      },
    } as any);
  };

  const handleOpenComments = () => {
    if (!details) {
      return;
    }

    setCommentsOpen(true);
  };

  const canEdit =
    sourceStr === "history" &&
    details?.review !== true &&
    details?.unrealized !== true;

  const handleEdit = () => {
    if (!canEdit || !details) {
      return;
    }

    const isStrengthTraining = details.workoutKind === "strength";
    router.push({
      pathname: isStrengthTraining ? "/workout/gym-finish" : "/workout/runner-finish",
      params: {
        id: String(details.workoutsId ?? details.workoutId ?? ""),
        editFinishedId: String(details.finishedId),
        title: details.trainingTitle ?? details.title ?? "",
        subtitle: details.trainingSubtitle ?? "",
        outdoor: String(details.outdoor === true),
        intensities: String(Boolean(details.intensities)),
      },
    } as any);
  };

  const isRunning = details?.workoutKind === "running";
  const isIndoor = isRunning && details?.outdoor === false;
  const isStrength = details?.workoutKind === "strength";
  const title = details
    ? isRunning
      ? getRunningTitle(details)
      : getStrengthTitle(details)
    : "-";
  const strengthSubtitle = details ? getStrengthSubtitle(details) : "Treino de força";
  const strengthDurationLabel = details ? getStrengthDurationLabel(details) : "-";
  const activityType = details ? getActivityTypeLabel(details) : "-";
  const distanceLabel = displayValue(details?.metrics.distanceLabel);
  const activityDateLabel = displayValue(details?.activityDateLabel);
  const stravaUrl = details?.strava?.url ?? null;
  const activityLinkUrl = stravaUrl ?? details?.link ?? null;
  const activityLinkLabel = stravaUrl
    ? "Visualizar no Strava"
    : activityLinkUrl
      ? "Visualizar atividade"
      : null;
  const activityLinkIconName = stravaUrl ? "strava" : "external-link-alt";
  const activityLinkIconColor = stravaUrl ? "#FC5200" : "#8C95AA";
  const commentsCount = details?.comments?.length ?? 0;
  const encodedPolyline =
    details?.map?.summaryPolyline?.trim() ||
    details?.summaryPolyline?.trim() ||
    null;
  const hasMap = Boolean(encodedPolyline);
  const explicitIndoorUnitMeasurement = details
    ? getExplicitIndoorUnitMeasurement(details)
    : null;
  const indoorIntensityUnitMeasurement = details
    ? inferIndoorIntensityUnitMeasurement(details, explicitIndoorUnitMeasurement)
    : explicitIndoorUnitMeasurement;
  const indoorWarmUpCoolDownUnitMeasurement = details
    ? explicitIndoorUnitMeasurement ??
      indoorIntensityUnitMeasurement ??
      inferIndoorWarmUpCoolDownUnitMeasurement(details, null)
    : explicitIndoorUnitMeasurement ?? indoorIntensityUnitMeasurement;

const indoorMetricItems =
  details && isIndoor
    ? [
        {
          label: "Tempo de aquec. (min)",
          value: formatIndoorDurationValue(
            getActivityField(details, ["warmUpDuration", "warmupDuration"]),
            getActivityField(details, [
              "warmUpDurationLabel",
              "warmupDurationLabel",
            ]),
          ),
        },
        {
          label:
            indoorWarmUpCoolDownUnitMeasurement === "km"
              ? "Intensidade de aquecimento (km/h)"
              : "Intensidade de aquecimento (min)",
          value: formatIndoorIntensityValue(
            getActivityField(details, [
              "warmUpIntensities",
              "warmUpIntensity",
              "warmUpPace",
              "warmupIntensities",
              "warmupIntensity",
              "warmupPace",
            ]),
            getActivityField(details, [
              "warmUpIntensitiesLabel",
              "warmUpIntensityLabel",
              "warmUpPaceLabel",
              "warmupIntensitiesLabel",
              "warmupIntensityLabel",
              "warmupPaceLabel",
            ]),
            indoorWarmUpCoolDownUnitMeasurement,
          ),
        },
        {
          label: "Tempo de desaquecimento. (min)",
          value: formatIndoorDurationValue(
            getActivityField(details, ["coolDownDuration", "cooldownDuration"]),
            getActivityField(details, [
              "coolDownDurationLabel",
              "cooldownDurationLabel",
            ]),
          ),
        },
        {
          label:
            indoorWarmUpCoolDownUnitMeasurement === "km"
              ? "Intensidade de desaquecimento (km/h)"
              : "Intensidade de desaquecimento (min)",
          value: formatIndoorIntensityValue(
            getActivityField(details, [
              "coolDownIntensities",
              "coolDownIntensity",
              "coolDownPace",
              "cooldownIntensities",
              "cooldownIntensity",
              "cooldownPace",
            ]),
            getActivityField(details, [
              "coolDownIntensitiesLabel",
              "coolDownIntensityLabel",
              "coolDownPaceLabel",
              "cooldownIntensitiesLabel",
              "cooldownIntensityLabel",
              "cooldownPaceLabel",
            ]),
            indoorWarmUpCoolDownUnitMeasurement,
          ),
        },
      ].filter(
        (item): item is { label: string; value: string } => item.value !== null,
      )
    : [];
  const indoorIntensityChartItems =
    details && isIndoor
      ? buildIndoorIntensityChartItems(
          getActivityField(details, ["intensities"]),
          indoorIntensityUnitMeasurement,
        )
      : [];
  const effortIcon =
    rpeConfiguration.find((item) => item.value === (details?.rpe ?? 0))?.icon ??
    null;

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar style="light" />

      <View className="px-5 pb-4 pt-2">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={handleBack}
            className="-ml-2 h-11 w-11 items-center justify-center"
          >
            <ArrowLeft color="#FFFFFF" size={27} strokeWidth={2.2} />
          </TouchableOpacity>

          <View className="ml-1 flex-1">
            <Text
              allowFontScaling={false}
              className="text-[27px] font-semibold leading-[31px] text-white"
            >
              Detalhes
            </Text>
          </View>
        </View>
      </View>

      {isLoading ? (
        <Loading />
      ) : isError || !details ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-base text-[#8F8FA3]">
            Não foi possível carregar os detalhes da atividade.
          </Text>
        </View>
      ) : isStrength ? (
        <>
          <ScrollView
            className="flex-1 bg-black"
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="px-5 pb-2 pt-1">
              <View className="overflow-hidden rounded-[28px] border border-[#1A1E27] bg-black px-5 py-6">
                <View className="relative">
                  <Text
                    allowFontScaling={false}
                    className="text-[28px] font-bold leading-[34px] text-white"
                  >
                    {title}
                  </Text>

                  <View className="mt-5 flex-row items-center">
                    <CalendarDays
                      color="#8C95AA"
                      size={21}
                      strokeWidth={2.1}
                    />
                    <Text
                      allowFontScaling={false}
                      className="ml-3 flex-1 text-[16px] font-medium leading-[22px] text-white"
                    >
                      {activityDateLabel}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View className="bg-black px-5 pb-2 pt-6">
              <View className="mb-3 flex-row justify-between">
                <MetricBlock label="TEMPO" value={strengthDurationLabel} />
                <MetricBlock label="TRIMP" value={details.trimp} />
                <MetricBlock
                  label="ESFORÇO"
                  value={details.rpe}
                  icon={effortIcon}
                />
              </View>

            </View>
          </ScrollView>

          <View className="border-t border-[#1D1F24] bg-black px-5 pb-5 pt-3">
            <View className="flex-row items-center justify-start gap-5">
              {canEdit ? (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleEdit}
                  className="h-11 w-11 items-center justify-center rounded-full bg-[#1D212A]"
                >
                  <Pencil color="#FFFFFF" size={21} strokeWidth={2.1} />
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleOpenComments}
                className="relative h-11 w-11 items-center justify-center rounded-full bg-[#1D212A]"
              >
                <MessageCircleIcon
                  color="#FFFFFF"
                  size={22}
                  strokeWidth={2.1}
                />
                {commentsCount ? (
                  <View className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-[#2FD16F]">
                    <Text className="text-[10px] font-bold text-white">
                      {commentsCount}
                    </Text>
                  </View>
                ) : null}
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleShare}
                className="h-11 w-11 items-center justify-center rounded-full bg-[#E7EBF3]"
              >
                <Share2 color="#29303B" size={22} strokeWidth={2.2} />
              </TouchableOpacity>
            </View>
          </View>

          <NotificationV2CommentsModal
            open={commentsOpen}
            onClose={() => setCommentsOpen(false)}
            finishedId={details.finishedId}
            content={{
              executionDay: details.activityDate ?? "",
              updatedAt: details.activityDate ?? "",
              comments: details.comments ?? [],
            }}
            onCommentSent={async () => {
              await refetch();
            }}
          />
        </>
      ) : !isRunning ? (
        <View className="flex-1 bg-black" />
      ) : (
        <>
          <ScrollView
            className="flex-1 bg-black"
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            {hasMap ? (
              <View className="relative">
                <ActivityDetailsMap encodedPolyline={encodedPolyline} />

                <LinearGradient
                  colors={[
                    "rgba(0,0,0,0.06)",
                    "rgba(0,0,0,0.18)",
                    "rgba(0,0,0,0.72)",
                    "#000000",
                  ]}
                  locations={[0, 0.35, 0.72, 1]}
                  style={StyleSheet.absoluteFillObject}
                />

                <View className="absolute bottom-0 left-0 right-0 px-6 pb-6">
                  <Text
                    allowFontScaling={false}
                    className="text-[28px] font-bold leading-[34px] text-white"
                  >
                    {title}
                  </Text>

                  <View className="mt-4 flex-row items-center">
                    <View className="flex-row items-center rounded-[10px] bg-[#3D4353]/70 px-3 py-[7px]">
                      <MaterialCommunityIcons
                        name="run-fast"
                        size={18}
                        color="#FFFFFF"
                      />
                      <Text
                        allowFontScaling={false}
                        className="ml-2 text-[14px] font-medium text-white"
                      >
                        {activityType}
                      </Text>
                    </View>

                    <Text
                      allowFontScaling={false}
                      className="mx-3 text-[20px] text-[#D9DDE5]"
                    >
                      ·
                    </Text>

                    <Text
                      allowFontScaling={false}
                      className="text-[18px] font-medium text-white"
                    >
                      {distanceLabel}
                    </Text>
                  </View>

                  <View className="mt-5 flex-row items-end">
                    <View className="flex-1 pr-4">
                      <View className="flex-row items-center">
                        <CalendarDays
                          color="#8C95AA"
                          size={23}
                          strokeWidth={2.1}
                        />
                        <Text
                          allowFontScaling={false}
                          className="ml-3 flex-1 text-[17px] font-medium leading-[24px] text-white"
                        >
                          {activityDateLabel}
                        </Text>
                      </View>

                      {activityLinkLabel ? (
                        <TouchableOpacity
                          activeOpacity={0.85}
                          onPress={handleOpenActivityLink}
                          className="mt-3 flex-row items-center"
                        >
                          <FontAwesome5
                            name={activityLinkIconName}
                            size={22}
                            color={activityLinkIconColor}
                          />
                          <Text
                            allowFontScaling={false}
                            className="ml-3 text-[17px] font-medium text-white"
                          >
                            {activityLinkLabel}
                          </Text>
                        </TouchableOpacity>
                      ) : null}
                    </View>

                    <View className="mb-1 h-[72px] w-[56px] overflow-hidden rounded-[18px] border border-[#8390B0] bg-[#1A1D24]/60">
                      <ActivityDetailsMap
                        encodedPolyline={encodedPolyline}
                        height={72}
                        lineWeight={3}
                        fitPadding={10}
                      />
                    </View>
                  </View>
                </View>
              </View>
            ) : (
              <View className="bg-black px-6 pb-2 pt-3">
                <Text
                  allowFontScaling={false}
                  className="text-[28px] font-bold leading-[34px] text-white"
                >
                  {title}
                </Text>

                <View className="mt-4 flex-row items-center">
                  <View className="flex-row items-center rounded-[10px] bg-[#3D4353]/70 px-3 py-[7px]">
                    <MaterialCommunityIcons
                      name="run-fast"
                      size={18}
                      color="#FFFFFF"
                    />
                    <Text
                      allowFontScaling={false}
                      className="ml-2 text-[14px] font-medium text-white"
                    >
                      {activityType}
                    </Text>
                  </View>

                  <Text
                    allowFontScaling={false}
                    className="mx-3 text-[20px] text-[#D9DDE5]"
                  >
                    ·
                  </Text>

                  <Text
                    allowFontScaling={false}
                    className="text-[18px] font-medium text-white"
                  >
                    {distanceLabel}
                  </Text>
                </View>

                <View className="mt-5">
                  <View className="flex-row items-center">
                    <CalendarDays
                      color="#8C95AA"
                      size={23}
                      strokeWidth={2.1}
                    />
                    <Text
                      allowFontScaling={false}
                      className="ml-3 flex-1 text-[17px] font-medium leading-[24px] text-white"
                    >
                      {activityDateLabel}
                    </Text>
                  </View>

                  {stravaUrl ? (
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={handleOpenActivityLink}
                      className="mt-3 flex-row items-center"
                    >
                      <FontAwesome5
                        name="strava"
                        size={22}
                        color="#FC5200"
                      />
                      <Text
                        allowFontScaling={false}
                        className="ml-3 text-[17px] font-medium text-white"
                      >
                        Visualizar no Strava
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            )}

            <View className="bg-black px-6 pb-2 pt-6">
              <View className="mb-3 flex-row justify-between">
                <MetricBlock
                  label="DISTÂNCIA"
                  value={details.metrics.distanceLabel}
                />
                <MetricBlock
                  label="TEMPO"
                  value={details.metrics.movingTimeLabel}
                />
                <MetricBlock
                  label="RITMO MÉDIO"
                  value={details.metrics.paceLabel}
                />
              </View>

              {!isIndoor ? (
                <>
                  <View className="mb-3 flex-row justify-between">
                    <MetricBlock
                      label="ELEVAÇÃO"
                      value={details.metrics.elevationGainLabel}
                    />
                    <MetricBlock
                      label="FC MÉDIA"
                      value={details.metrics.averageHeartRate}
                    />
                    <MetricBlock
                      label="CADÊNCIA"
                      value={details.metrics.cadenceInStepsPerMinute}
                    />
                  </View>

                  <View className="flex-row justify-between">
                    <MetricBlock
                      label="CALORIAS"
                      value={details.metrics.caloriesLabel}
                    />
                    <MetricBlock
                      label="ESFORÇO"
                      value={details.rpe}
                      icon={effortIcon}
                    />
                    <View className="w-[31%]" />
                  </View>
                </>
              ) : (
                <View className="flex-row justify-between">
                  <MetricBlock
                    label="ESFORÇO"
                    value={details.rpe}
                    icon={effortIcon}
                  />
                  <View className="w-[31%]" />
                  <View className="w-[31%]" />
                </View>
              )}

              {isIndoor && indoorMetricItems.length ? (
                <View className="mt-8">
                  <Text
                    allowFontScaling={false}
                    className="mb-4 text-[18px] font-semibold text-white"
                  >
                    Aquecimento e desaquecimento
                  </Text>

                  <View className="flex-row flex-wrap justify-between">
                    {indoorMetricItems.map((item) => (
                      <MetricBlock
                        key={item.label}
                        label={item.label}
                        value={item.value}
                        containerClassName="mb-5 w-[48%]"
                      />
                    ))}
                  </View>
                </View>
              ) : null}

              {isIndoor && indoorIntensityChartItems.length ? (
                <View className="mt-3">
                  <Text
                    allowFontScaling={false}
                    className="mb-4 text-[18px] font-semibold text-white"
                  >
                    Intensidades
                  </Text>

                  <IndoorIntensityChart
                    items={indoorIntensityChartItems}
                    unitMeasurement={indoorIntensityUnitMeasurement}
                  />
                </View>
              ) : null}
            </View>
          </ScrollView>

          <View className="border-t border-[#1D1F24] bg-black px-5 pb-5 pt-3">
            <View className="flex-row items-center justify-start gap-5">
              {canEdit ? (
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={handleEdit}
                  className="h-11 w-11 items-center justify-center rounded-full bg-[#1D212A]"
                >
                  <Pencil color="#FFFFFF" size={21} strokeWidth={2.1} />
                </TouchableOpacity>
              ) : null}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleOpenComments}
                className="relative h-11 w-11 items-center justify-center rounded-full bg-[#1D212A]"
              >
                <MessageCircleIcon
                  color="#FFFFFF"
                  size={22}
                  strokeWidth={2.1}
                />
                {commentsCount ? (
                  <View className="absolute -right-1 -top-1 h-5 w-5 items-center justify-center rounded-full bg-[#2FD16F]">
                    <Text className="text-[10px] font-bold text-white">
                      {commentsCount}
                    </Text>
                  </View>
                ) : null}
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleShare}
                className="h-11 w-11 items-center justify-center rounded-full bg-[#E7EBF3]"
              >
                <Share2 color="#29303B" size={22} strokeWidth={2.2} />
              </TouchableOpacity>
            </View>
          </View>

          <NotificationV2CommentsModal
            open={commentsOpen}
            onClose={() => setCommentsOpen(false)}
            finishedId={details.finishedId}
            content={{
              executionDay: details.activityDate ?? "",
              updatedAt: details.activityDate ?? "",
              comments: details.comments ?? [],
            }}
            onCommentSent={async () => {
              await refetch();
            }}
          />
        </>
      )}
    </SafeAreaView>
  );
}
