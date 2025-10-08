// lib/verifyRecaptcha.ts
export async function verifyRecaptcha(token: string): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;

  if (!secret) {
    console.warn("RECAPTCHA_SECRET_KEY não configurada.");
    return false;
  }

  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `secret=${secret}&response=${token}`,
  });

  const data = await res.json().catch(() => null);
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  const success = d.success === true;
  const scoreOk =
    !("score" in d) || (typeof d.score === "number" && d.score >= 0.5);
  return success && scoreOk;
}
