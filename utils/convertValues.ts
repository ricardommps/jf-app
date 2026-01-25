const formatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function convertMetersToKilometersFormat(
  meters: number,
  hideKm: boolean = false,
  formatterStr?: string
): string {
  const kilometers = meters / 100;
  const formatted = formatter.format(kilometers);

  const suffix = hideKm ? "" : formatterStr ?? "km/h";

  return `${formatted}${suffix ? ` ${suffix}` : ""}`;
}

export function convertDistanceSave(
  meters: number,
  hideKm: boolean = false,
  formatterStr?: string
): string {
  const kilometers = meters / 1000;
  const formatted = formatter.format(kilometers);

  const suffix = hideKm ? "" : formatterStr ?? "km/h";

  return `${formatted}${suffix ? ` ${suffix}` : ""}`;
}

export function convertSecondsToHourMinuteFormat(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const remainingMinutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const formattedHours = hours.toString().padStart(2, "0");
  const formattedMinutes = remainingMinutes.toString().padStart(2, "0");
  const formattedSeconds = remainingSeconds.toString().padStart(2, "0");

  return hours > 0
    ? `${formattedHours}:${formattedMinutes}:${formattedSeconds}`
    : `${formattedMinutes}:${formattedSeconds}`;
}

export function convertPaceToSpeed(
  meters: number,
  hideKm: boolean = false
): string {
  const kilometers = meters / 100;
  const formatted = formatter.format(kilometers);
  return `${formatted}${!hideKm ? " km/h" : ""}`;
}

export function convertKilometersToMeters(kmString: string): number {
  if (!kmString) return 0;
  const normalized = kmString.replace(",", ".");
  const kmNumber = parseFloat(normalized);

  if (isNaN(kmNumber) || kmNumber < 0) {
    return 0;
  }

  return Math.round(kmNumber * 1000);
}
