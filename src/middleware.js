import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("crowd_token")?.value;
  const { pathname } = req.nextUrl;

  // Protect dashboard routes
  if (pathname.startsWith("/dashboard")) {
    if (!token) {
      // Redirect to login if no token cookie exists
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect logged-in users away from auth pages
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    if (token) {
      const dashboardUrl = new URL("/dashboard", req.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

// Apply middleware only to relevant paths
export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
