import { describe, it, expect } from "vitest";
import {
  formatDateLocal,
  formatDateTimeLocal,
  parseDateTimeLocal,
} from "@/lib/date";

describe("date util local formatting", () => {
  it("formats date local YYYY-MM-DD correctly", () => {
    const d = new Date(2025, 8, 30, 15, 5); // 2025-09-30 15:05 local
    expect(formatDateLocal(d)).toBe("2025-09-30");
  });

  it("formats datetime-local correctly", () => {
    const d = new Date(2025, 8, 30, 6, 7); // 2025-09-30 06:07
    expect(formatDateTimeLocal(d)).toBe("2025-09-30T06:07");
  });

  it("parses datetime-local and roundtrips to ISO (approx)", () => {
    const s = "2025-09-30T21:30";
    const parsed = parseDateTimeLocal(s);
    // parsed should represent local 2025-09-30 21:30
    expect(parsed.getFullYear()).toBe(2025);
    expect(parsed.getMonth()).toBe(8);
    expect(parsed.getDate()).toBe(30);
    expect(parsed.getHours()).toBe(21);
    expect(parsed.getMinutes()).toBe(30);
  });
});
