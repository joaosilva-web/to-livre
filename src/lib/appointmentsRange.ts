export function parseDayRange(from: string, to: string) {
  // Interpret incoming date strings `YYYY-MM-DD` as local dates.
  // Build Date objects at local start/end of day and return them as instants.
  function parseLocal(dateStr: string) {
    const [y, m, d] = dateStr.split("-").map(Number);
    // new Date(year, monthIndex, day) constructs local midnight
    const dt = new Date(y, (m || 1) - 1, d || 1);
    return dt;
  }

  const fromDate = parseLocal(from);
  fromDate.setHours(0, 0, 0, 0);
  const toDate = parseLocal(to);
  toDate.setHours(23, 59, 59, 999);
  return { fromDate, toDate };
}

export function buildAppointmentWhere(
  companyId: string,
  from: string,
  to: string
) {
  const { fromDate, toDate } = parseDayRange(from, to);
  return {
    companyId,
    startTime: { gte: fromDate, lte: toDate },
  } as const;
}

// named exports only to satisfy linting/compile rules
