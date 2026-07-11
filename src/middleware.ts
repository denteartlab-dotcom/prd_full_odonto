import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE = "odonto-session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApp = pathname.startsWith("/app");
  const isLogin = pathname === "/login";
  const token = request.cookies.get(COOKIE)?.value;

  let valid = false;
  if (token) {
    try {
      await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret"));
      valid = true;
    } catch {
      valid = false;
    }
  }

  if (isApp && !valid) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (isLogin && valid) {
    return NextResponse.redirect(new URL("/app", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/login"],
};
