import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "previna_session";
const secretKey = () =>
  new TextEncoder().encode(process.env.AUTH_SECRET || "previna-dev-secret-troque-em-producao");

const PUBLIC_PATHS = ["/login", "/manifest.json"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;
  let authenticated = false;
  if (token) {
    try {
      await jwtVerify(token, secretKey());
      authenticated = true;
    } catch {
      authenticated = false;
    }
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL(authenticated ? "/dashboard" : "/login", req.url));
  }

  if (!authenticated) {
    const url = new URL("/login", req.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
