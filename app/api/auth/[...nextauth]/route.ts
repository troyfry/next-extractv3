/**
 * NextAuth API route handler for App Router.
 * 
 * This file handles all authentication routes:
 * - GET/POST /api/auth/signin
 * - GET/POST /api/auth/signout
 * - GET /api/auth/session
 * - GET /api/auth/providers
 * - etc.
 * 
 * Uses the handlers exported from auth.ts.
 */

import { handlers } from "@/auth";

export const { GET, POST } = handlers;

