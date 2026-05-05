import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const legacyRedirects: Record<string, string> = {
    "/dashboard": "/app/campaigns",
    "/dashboard/campaigns": "/app/campaigns",
    "/dashboard/campaigns/new": "/app/campaigns/new",
    "/dashboard/insights": "/app/summary",
    "/dashboard/people": "/app/participants",
    "/dashboard/billing": "/app/billing",
    "/dashboard/settings": "/app/settings",
    "/dashboard/summary": "/app/summary",
  };

  if (pathname.startsWith("/dashboard/campaigns/")) {
    const targetPath = pathname.replace("/dashboard/campaigns/", "/app/campaigns/");
    const url = request.nextUrl.clone();
    url.pathname = targetPath;
    return NextResponse.redirect(url);
  }

  if (legacyRedirects[pathname]) {
    const url = request.nextUrl.clone();
    url.pathname = legacyRedirects[pathname];
    return NextResponse.redirect(url);
  }

  // Protect admin routes - require authentication
  if (!user && (pathname.startsWith("/app") || pathname.startsWith("/dashboard"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  if (
    user &&
    (request.nextUrl.pathname.startsWith("/auth/login") ||
      request.nextUrl.pathname.startsWith("/auth/register"))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/app/campaigns";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
