import { NextResponse } from "next/server";
export function middleware(request) {
  const authToken = request.cookies.get("token")?.value;

  if (!authToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/program/:path*"],
};
