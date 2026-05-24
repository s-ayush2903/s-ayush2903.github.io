/**
 * Normalises both YAML-parsed Date objects (ISO frontmatter) and
 * ordinal date strings ("25th January 2025 04:12:00") to YYYY-MM-DD.
 */
export function toISODate(val: unknown): string {
  if (val instanceof Date) {
    // YAML-parsed dates are UTC — toISOString is safe here.
    return val.toISOString().split('T')[0];
  }
  if (typeof val === 'string') {
    // Strip ordinal suffixes: "25th" → "25", "1st" → "1", etc.
    const cleaned = val.replace(/(\d+)(st|nd|rd|th)\b/i, '$1');
    const d = new Date(cleaned);
    if (isNaN(d.getTime())) throw new Error(`Cannot parse date: "${val}"`);
    // Use local date parts — new Date("1 January 2025") parses in local time,
    // so toISOString() would shift the date backward in UTC+ timezones.
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  throw new Error(`Expected a date string or Date object, got ${typeof val}`);
}
