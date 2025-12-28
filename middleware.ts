import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "./lib/better-auth/auth";

export const runtime = "nodejs";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Allow /admin (exact path) to be public - it's the landing page
  // Return early for /admin to skip protection
  if (pathname === "/admin") {
    return NextResponse.next();
  }
  
  // Protect all /admin/* sub-routes (except /admin itself)
  // Also protect /welcome-admin route
  if ((pathname.startsWith("/admin") && pathname !== "/admin") || pathname === "/welcome-admin") {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // If no session or user is not admin, redirect to sign-in
    const userRole = (session?.user as { role?: string })?.role;
    if (!session || userRole !== "admin") {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/admin", "/welcome-admin"],
};