import type { LessonPackage, LessonPackageClass } from "@/types/lesson-package";

export function sortLessonClasses(classes: LessonPackageClass[]) {
  return [...classes].sort(
    (a, b) =>
      a.scheduledDate.localeCompare(b.scheduledDate) ||
      (a.scheduledTime ?? "").localeCompare(b.scheduledTime ?? "") ||
      a.id - b.id,
  );
}

export function groupLessonPackages(packages: LessonPackage[]) {
  const ordered = [...packages].sort(
    (a, b) =>
      (b.createdAt ?? "").localeCompare(a.createdAt ?? "") || b.id - a.id,
  );
  return {
    active: ordered.filter(
      (item) => item.status === "active" || item.status === "paused",
    ),
    finished: ordered.filter((item) => item.status === "finished"),
  };
}

export function getLessonPackageInterval(classes: LessonPackageClass[]) {
  const ordered = sortLessonClasses(classes);
  return {
    start: ordered[0]?.scheduledDate ?? null,
    end: ordered.at(-1)?.scheduledDate ?? null,
  };
}

const weekdays = [
  "domingo",
  "segunda",
  "terça",
  "quarta",
  "quinta",
  "sexta",
  "sábado",
];

export function formatLessonDate(
  value: string | null,
  withWeekday = false,
): string {
  if (!value) return "—";
  const [year, month, day] = value.split("T")[0].split("-").map(Number);
  const date = new Date(year, month - 1, day, 12);
  if (
    !year ||
    !month ||
    !day ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  )
    return "—";
  const formatted = `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}`;
  return withWeekday
    ? `${formatted} (${weekdays[date.getDay()]})`
    : `${formatted}/${year}`;
}
