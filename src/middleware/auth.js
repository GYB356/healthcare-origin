import { NextResponse } from "next/server";

const ROLES = {
  ADMIN: "admin",
  PROVIDER: "provider",
  PATIENT: "patient",
};

const ROLE_ROUTES = {
  [ROLES.ADMIN]: ["/admin", "/admin/*"],
  [ROLES.PROVIDER]: ["/provider", "/provider/*"],
  [ROLES.PATIENT]: ["/patient", "/patient/*"],
};

export function middleware(request) {
  const token = request.cookies.get("auth_token");
  const userRole = request.cookies.get("user_role");

  // If no token or role, redirect to login
  if (!token || !userRole) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const path = request.nextUrl.pathname;

  // Check if user has access to the requested route
  const allowedRoutes = ROLE_ROUTES[userRole.value] || [];
  const hasAccess = allowedRoutes.some(route => {
    if (route.endsWith("/*")) {
      return path.startsWith(route.slice(0, -1));
    }
    return path === route;
  });

  if (!hasAccess) {
    // Redirect to appropriate dashboard based on role
    const redirectPath = `/${userRole.value}`;
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/provider/:path*",
    "/patient/:path*",
  ],
}; 