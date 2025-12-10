/**
 * Next.js middleware for protecting routes.
 * 
 * This middleware checks authentication status and redirects
 * unauthenticated users to a sign-in page.
 * 
 * Free version routes are accessible without authentication:
 * - /manual (manual upload page)
 * - /api/process-pdf (PDF processing)
 * - /api/work-orders (work orders API)
 * - /api/work-orders/export (CSV export)
 * 
 * Currently protects all routes except:
 * - /api/auth/* (authentication endpoints)
 * - /auth/* (sign-in pages)
 * - Free version routes (listed above)
 */

import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;

  // Allow access to auth API routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Allow access to auth pages (sign-in page)
  if (pathname.startsWith("/auth")) {
    return NextResponse.next();
  }

  // Free version routes - accessible without authentication
  const freeVersionRoutes = [
    "/manual",
    "/work-orders",
    "/api/process-pdf",
    "/api/work-orders",
    "/api/work-orders/export",
  ];

  const isFreeVersionRoute = freeVersionRoutes.some((route) =>
    pathname === route || pathname.startsWith(route + "/")
  );

  if (isFreeVersionRoute) {
    return NextResponse.next();
  }

  // Protect all other routes
  if (!isAuthenticated) {
    // Redirect to sign-in page
    const signInUrl = new URL("/auth/signin", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

// Configure which routes this middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

