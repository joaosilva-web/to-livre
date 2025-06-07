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

  const data = await res.json();

  return data.success && (!("score" in data) || data.score >= 0.5);
}
