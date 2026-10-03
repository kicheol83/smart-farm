import { format, subDays } from "date-fns";
import { dateLocale } from "@/i18n/core";

export function lastDaysLabel(days: number): string {
  const end = new Date();
  const start = subDays(end, days - 1);
  const locale = dateLocale();
  return `${format(start, "PP", { locale })} – ${format(end, "PP", { locale })}`;
}
