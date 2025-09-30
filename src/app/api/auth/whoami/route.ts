import { NextResponse } from "next/server";
import { getUserFromCookie } from "@/app/libs/auth";

export async function GET() {
  const user = await getUserFromCookie();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({ success: true, user });
}
