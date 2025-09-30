export function parseDayRange(from: string, to: string) {
  const fromDate = new Date(from);
  // normalize to UTC start of day
  fromDate.setUTCHours(0, 0, 0, 0);
  const toDate = new Date(to);
  // normalize to UTC end of day
  toDate.setUTCHours(23, 59, 59, 999);
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
