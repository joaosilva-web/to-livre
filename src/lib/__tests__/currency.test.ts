import { describe, it, expect } from "vitest";
import formatBRL from "@/lib/currency";

describe("formatBRL", () => {
  it("formats integers correctly", () => {
    expect(formatBRL(2100)).toBe("R$ 2.100,00");
  });

  it("formats cents correctly", () => {
    expect(formatBRL(35)).toBe("R$ 35,00");
    expect(formatBRL(1234.5)).toBe("R$ 1.234,50");
  });
});
