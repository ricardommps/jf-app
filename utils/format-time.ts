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

export function convertDate(inputDate: string | number | Date): string {
  let date: Date;

  if (typeof inputDate === "string") {
    // Verifica se é uma string no formato YYYY-MM-DD
    if (inputDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // Parse manual para evitar problemas de timezone
      const [yearStr, monthStr, dayStr] = inputDate.split("-");
      const year = parseInt(yearStr);
      const month = parseInt(monthStr);
      const day = parseInt(dayStr);

      const monthFormatted = String(month).padStart(2, "0");
      const dayFormatted = String(day).padStart(2, "0");
      const hours = "12";
      const minutes = "00";
      const seconds = "00";
      const milliseconds = "00";

      const dataFormated = `${year}-${monthFormatted}-${dayFormatted} ${hours}:${minutes}:${seconds}.${milliseconds}`;
      return dataFormated;
    } else {
      // Para outros formatos de string, usa Date normalmente
      date = new Date(inputDate);
    }
  } else {
    // Para number ou Date
    date = new Date(inputDate);
  }

  // Se chegou até aqui, usa o objeto Date
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = "12";
  const minutes = "00";
  const seconds = "00";
  const milliseconds = "00";

  const dataFormated = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
  return dataFormated;
}
