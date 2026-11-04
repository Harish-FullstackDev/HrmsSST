import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

import { safeNext, withNext } from "@/lib/nextPath";

// Pages that need a signed-in user. /reset-password needs the session the
// recovery code creates; /reset-password/success does not (the password
// update signs the user out).
const PROTECTED = ["/dashboard", "/apply", "/job-details", "/jobs", "/saved-jobs", "/my-profile", "/hr"];
const PROTECTED_EXACT = ["/reset-password", "/email-verified"];

// Sign-in and sign-up: a signed-in user goes straight to the dashboard.
const GUEST_ONLY = ["/", "/sign-up"];

const matches = (path, prefix) => path === prefix || path.startsWith(`${prefix}/`);

// Refreshes the Supabase auth session on every request, keeps cookies in sync
// between the request and the response, and redirects by sign-in state. This
// is the optimistic check; the (application) layout checks again on the
// server before rendering.
export async function updateSession(request) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not run code between createServerClient and getClaims().
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims?.sub);

  // A signed-out visitor goes to sign-in with the page they wanted as ?next=,
  // and returns there once signed in.
  const { pathname: path, search, searchParams } = request.nextUrl;
  let target = null;
  if (!signedIn && (PROTECTED.some((p) => matches(path, p)) || PROTECTED_EXACT.includes(path))) {
    target = withNext("/", `${path}${search}`);
  }
  if (signedIn && GUEST_ONLY.includes(path)) target = safeNext(searchParams.get("next")) ?? "/dashboard";
  if (!target) return response;

  // Keep any refreshed session cookies on the redirect.
  const redirect = NextResponse.redirect(new URL(target, request.url));
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}
