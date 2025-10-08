import { getUserFromCookie } from "@/app/libs/auth";
import * as api from "@/app/libs/apiResponse";

export async function GET() {
  const user = await getUserFromCookie();
  if (!user) return api.unauthorized();

  return api.ok({ user });
}
