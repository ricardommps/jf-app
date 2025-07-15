import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function fDate(
  date: Date | string | number | null | undefined,
  newFormat?: string
): string {
  const fm = newFormat || "dd MMM yyyy";

  if (!date) return "";

  let parsedDate: Date;

  // Se for string no formato YYYY-MM-DD, trata como data local
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [year, month, day] = date.split("-").map(Number);
    parsedDate = new Date(year, month - 1, day); // month é 0-based no JS
  } else {
    parsedDate = new Date(date);
  }
  return format(parsedDate, fm, { locale: ptBR });
}
