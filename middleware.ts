/**
 * Next.js middleware for protecting routes.
 * 
 * This middleware checks authentication status and redirects
 * unauthenticated users to a sign-in page.
 * 
 * All users (including free users) must sign in with Google via NextAuth.
 * 
 * Currently protects all routes except:
 * - /api/auth/* (authentication endpoints)
 * - /auth/* (sign-in pages)
 */

import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  
  // Handle auth errors gracefully
  let isAuthenticated = false;
  try {
    isAuthenticated = !!req.auth;
  } catch (error) {
    console.error("[Middleware] Auth error:", error);
    // If auth fails, treat as unauthenticated and redirect to sign-in
    // This prevents server errors from breaking the app
  }

  // Allow access to auth API routes
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Allow access to auth pages (sign-in page)
  if (pathname.startsWith("/auth")) {
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

