import { vi, describe, it, expect, beforeEach } from "vitest";
import {
  __test_fetchUserOnce as fetchUserOnce,
  __test_clearSessionCache,
} from "@/context/SessionProvider";

describe("SessionProvider internals", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    __test_clearSessionCache();
  });

  it("returns user when whoami returns user", async () => {
    const fakeUser = {
      id: "u1",
      name: "Test User",
      companyId: "c1",
      email: "t@test.com",
      roles: ["admin"],
    };
    // @ts-ignore
    global.fetch = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ user: fakeUser }) });

    const res = await fetchUserOnce();
    expect(res).toEqual(fakeUser);
  });

  it("returns null when whoami returns not ok", async () => {
    // @ts-ignore
    global.fetch = vi
      .fn()
      .mockResolvedValue({
        ok: false,
        json: async () => ({ error: "unauth" }),
      });

    const res = await fetchUserOnce();
    expect(res).toBeNull();
  });
});
