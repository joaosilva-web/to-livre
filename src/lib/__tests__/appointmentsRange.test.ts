import { describe, test, expect } from "vitest";
import { parseDayRange, buildAppointmentWhere } from "../appointmentsRange";

describe("appointmentsRange utilities", () => {
  test("parseDayRange produces UTC day boundaries", () => {
    const { fromDate, toDate } = parseDayRange("2025-09-30", "2025-09-30");
    // fromDate should be 2025-09-30T00:00:00.000Z
    expect(fromDate.toISOString()).toBe("2025-09-30T00:00:00.000Z");
    // toDate should be 2025-09-30T23:59:59.999Z
    expect(toDate.toISOString()).toBe("2025-09-30T23:59:59.999Z");
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
    expect(where.startTime.gte.toISOString()).toBe("2025-09-30T00:00:00.000Z");
    expect(where.startTime.lte.toISOString()).toBe("2025-09-30T23:59:59.999Z");
  });
});
