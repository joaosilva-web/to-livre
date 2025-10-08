// app/api/auth/logout/route.ts
import * as api from "@/app/libs/apiResponse";

export async function POST() {
  const res = api.ok({ message: "Logout realizado" });
  res.cookies.set({
    name: "token",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  // keep same response shape as api.ok
  // returning res (NextResponse) directly so cookie is included
  return res;
}
