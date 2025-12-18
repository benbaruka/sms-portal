import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
class DateFormatter {
  static safeParse(dateString?: string): Date | null {
    try {
      if (!dateString) return null;
      const date = parseISO(dateString);
      // Check if the date is valid (parseISO returns Invalid Date for invalid strings)
      if (isNaN(date.getTime())) {
        return null;
      }
      return date;
    } catch {
      return null;
    }
  }
  static formatDateLong(dateString?: string): string {
    const date = this.safeParse(dateString);
    if (!date || isNaN(date.getTime())) {
      return "Date inconnue";
    }
    return format(date, "EEEE dd, MMMM yyyy", { locale: fr });
  }
  static formatDateShort(dateString?: string): string {
    const date = this.safeParse(dateString);
    if (!date || isNaN(date.getTime())) {
      return "—";
    }
    return format(date, "dd/MM/yyyy");
  }
  static formatTimeAndDay(dateString?: string): string {
    const date = this.safeParse(dateString);
    if (!date || isNaN(date.getTime())) {
      return "—";
    }
    return format(date, "HH:mm, dd MMMM", { locale: fr });
  }
  static formatISO(dateString?: string): string {
    const date = this.safeParse(dateString);
    if (!date || isNaN(date.getTime())) {
      return "";
    }
    return date.toISOString();
  }
}
export default DateFormatter;
