import { NextRequest, NextResponse } from "next/server";
import { getUserFromCookie } from "./libs/auth";

export function middleware(req: NextRequest) {
  // Protege qualquer rota que comece com /dashboard ou /app/protected
  if (
    req.nextUrl.pathname.startsWith("/dashboard") ||
    req.nextUrl.pathname.startsWith("/app/protected")
  ) {
    const user = getUserFromCookie();
    if (!user) {
      return NextResponse.redirect(new URL("/auth", req.url));
    }
  }

  return NextResponse.next();
}

// Configura as rotas que o middleware vai rodar
export const config = {
  matcher: ["/dashboard/:path*", "/app/protected/:path*"],
};
