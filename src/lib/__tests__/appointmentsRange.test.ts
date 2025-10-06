import { describe, test, expect } from "vitest";
import { parseDayRange, buildAppointmentWhere } from "../appointmentsRange";

describe("appointmentsRange utilities", () => {
  test("parseDayRange produces UTC day boundaries", () => {
    const { fromDate, toDate } = parseDayRange("2025-09-30", "2025-09-30");
    // build expected instants based on local date construction
    const expectedFrom = new Date(2025, 8, 30);
    expectedFrom.setHours(0, 0, 0, 0);
    const expectedTo = new Date(2025, 8, 30);
    expectedTo.setHours(23, 59, 59, 999);
    expect(fromDate.toISOString()).toBe(expectedFrom.toISOString());
    expect(toDate.toISOString()).toBe(expectedTo.toISOString());
  });

  test("buildAppointmentWhere contains companyId and startTime range", () => {
    const where = buildAppointmentWhere(
      "company_123",
      "2025-09-30",
      "2025-09-30"
    );
    expect(where.companyId).toBe("company_123");
    expect(where.startTime).toHaveProperty("gte");
    expect(where.startTime).toHaveProperty("lte");
    const expectedFrom = new Date(2025, 8, 30);
    expectedFrom.setHours(0, 0, 0, 0);
    const expectedTo = new Date(2025, 8, 30);
    expectedTo.setHours(23, 59, 59, 999);
    expect(where.startTime.gte.toISOString()).toBe(expectedFrom.toISOString());
    expect(where.startTime.lte.toISOString()).toBe(expectedTo.toISOString());
  });
});
