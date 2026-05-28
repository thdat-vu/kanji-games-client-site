export function localDateInTimeZone(date: Date, timeZone: string): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date);
}

function parseISODate(yyyyMmDd: string): { y: number; m: number; d: number } {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  return { y, m, d };
}

export function daysBetween(earlier: string, later: string): number {
  const a = parseISODate(earlier);
  const b = parseISODate(later);
  const aMs = Date.UTC(a.y, a.m - 1, a.d);
  const bMs = Date.UTC(b.y, b.m - 1, b.d);
  return Math.round((bMs - aMs) / 86_400_000);
}

export function mondayOf(localDate: string): string {
  const { y, m, d } = parseISODate(localDate);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const dow = dt.getUTCDay();
  const offset = (dow + 6) % 7;
  dt.setUTCDate(dt.getUTCDate() - offset);
  return dt.toISOString().slice(0, 10);
}
