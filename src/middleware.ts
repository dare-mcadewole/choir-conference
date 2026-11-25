import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getAdminEmails, isAdminEmail } from "@/lib/supabase/admin";

function copyCookies(source: NextResponse, destination: NextResponse) {
  source.cookies.getAll().forEach((cookie) => {
    destination.cookies.set(cookie);
  });
  return destination;
}

function redirectToLogin(
  request: NextRequest,
  response: NextResponse,
  error: string,
) {
  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = "";
  url.searchParams.set("error", error);
  return copyCookies(response, NextResponse.redirect(url));
}

export async function middleware(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname === "/admin/login";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_API_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    if (isLoginPage) return NextResponse.next();
    return redirectToLogin(
      request,
      NextResponse.next({ request }),
      "supabase_not_configured",
    );
  }

  if (!getAdminEmails().length) {
    if (isLoginPage) return NextResponse.next();
    return redirectToLogin(
      request,
      NextResponse.next({ request }),
      "admin_allowlist_not_configured",
    );
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data } = await supabase.auth.getUser();
  const user = data.user;

  if (isLoginPage) {
    if (user && isAdminEmail(user.email)) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      url.search = "";
      return copyCookies(response, NextResponse.redirect(url));
    }
    if (
      user &&
      request.nextUrl.searchParams.get("error") !== "not_authorized"
    ) {
      return redirectToLogin(request, response, "not_authorized");
    }
    return response;
  }

  if (!user) {
    return redirectToLogin(request, response, "sign_in_required");
  }
  if (!isAdminEmail(user.email)) {
    return redirectToLogin(request, response, "not_authorized");
  }
  return response;
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
