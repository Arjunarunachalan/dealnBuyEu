import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") || "";

  let countryCode = "";

  // Handle local development logic vs production domain mappings
  if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
    countryCode = process.env.NEXT_PUBLIC_DEV_COUNTRY || "FR";
  } else {
    // Attempt basic TLD extraction (dealnbuy.fr -> fr -> FR)
    const parts = hostname.split(".");
    const tld = parts[parts.length - 1].toLowerCase(); // e.g., 'fr', 'de'
    
    // Use central config keys to define supported TLDs
    const supportedTLDs = ["fr", "es", "de", "pt"]; // These match our config keys in lowercase
    
    if (supportedTLDs.includes(tld)) {
      countryCode = tld.toUpperCase();
    } else {

      // If we don't recognize the TLD or it's a structural domain like dealnbuy.eu
      // We must decide a fallback or block. Strict rule: NO GLOBAL FALLBACK.
      // But middleware shouldn't crash the frontend, it should just set it to empty
      // and let the backend reject the request or the frontend display an error.
      countryCode = "";
    }
  }

  // Create a response object so we can set cookies and headers
  const response = NextResponse.next();

  if (countryCode) {
    // Set a cookie so the client-side axios or other tools can read it
    response.cookies.set("country_market", countryCode, {
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      sameSite: "lax",
    });

    // Also attach it as a header for SSR requests fetching from backend directly
    response.headers.set("x-country-code", countryCode);
  }

  return response;
}

// Config ensures middleware only runs on relevant paths, avoiding static assets
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
