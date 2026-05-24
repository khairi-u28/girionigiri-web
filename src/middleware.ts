import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const OPERATOR_BLOCKED = [
  "/admin/inventory",
  "/admin/recipes",
  "/admin/settings",
  "/admin/menu",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === "/admin/login";
  const role = request.cookies.get("admin_role")?.value;

  // Unauthenticated → redirect to login
  if (!isLoginPage && !role) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  // Operator trying to access restricted pages → redirect to dashboard
  if (
    role === "operator" &&
    OPERATOR_BLOCKED.some((path) => pathname.startsWith(path))
  ) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  // Pass role as header so server components / layouts can read it
  const response = NextResponse.next();
  if (role) {
    response.headers.set("x-admin-role", role);
  }
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
