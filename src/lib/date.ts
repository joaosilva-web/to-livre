// Utilities to format Date objects using local timezone (not UTC)
export function pad(n: number) {
  return n.toString().padStart(2, "0");
}

// Returns YYYY-MM-DD using local timezone
export function formatDateLocal(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Returns YYYY-MM-DDTHH:mm (suitable for <input type="datetime-local"> value)
export function formatDateTimeLocal(d: Date) {
  return `${formatDateLocal(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Parse a local datetime-local string (YYYY-MM-DDTHH:mm) into a Date object
export function parseDateTimeLocal(s: string) {
  // s expected in form YYYY-MM-DDTHH:mm or YYYY-MM-DDTHH:mm:ss
  const [datePart, timePart] = s.split("T");
  const [y, m, day] = datePart.split("-").map(Number);
  if (!timePart) return new Date(y, (m || 1) - 1, day || 1);
  const [hh, mm] = timePart.split(":").map(Number);
  return new Date(y, (m || 1) - 1, day || 1, hh || 0, mm || 0, 0, 0);
}
