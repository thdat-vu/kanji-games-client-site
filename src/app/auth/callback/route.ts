import { NextResponse, type NextRequest } from "next/server";

// This route acts as the OAuth redirect URL.
// Configure it in Supabase: Authentication → URL Configuration → Redirect URLs.
export async function GET(request: NextRequest) {
  const redirectUrl = request.nextUrl.searchParams.get("redirectTo") ?? "/";

  return NextResponse.redirect(new URL(redirectUrl, request.url));
}

