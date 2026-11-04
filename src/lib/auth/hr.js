// Server code only.

import { cache } from "react";
import { connection } from "next/server";

import { createClient } from "@/lib/supabase/server";

// The signed-in user's profile ({ id, role, first_name, last_name, email }),
// or null when signed out. Once per request.
export const getProfile = cache(async () => {
    // Supabase checks the token's expiry against Date.now(), which Next
    // refuses while prerendering; connection() defers this to the request.
    await connection();
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
        .from("profiles")
        .select("id, role, first_name, last_name, email")
        .eq("id", user.id)
        .maybeSingle();
    return profile ?? { id: user.id, role: "candidate", first_name: "", last_name: "", email: user.email ?? "" };
});

// For HR Server Actions: the Supabase client and profile when the caller is
// HR, otherwise null. RLS checks the role again on every query.
export async function hrSession() {
    const profile = await getProfile();
    if (profile?.role !== "hr") return null;
    return { supabase: await createClient(), profile };
}
