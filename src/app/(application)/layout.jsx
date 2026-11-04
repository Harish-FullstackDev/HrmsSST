import { Suspense } from "react";
import { connection } from "next/server";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

// Every page in this group (dashboard, jobs, saved jobs, applications, apply)
// needs a signed-in user. proxy.js already redirects; this checks the session
// with Supabase on the server before the page renders, in case the proxy is
// skipped.
async function SignedInOnly({ children }) {
    // Supabase checks the token's expiry against Date.now(), which Next
    // refuses while prerendering (also during partial prefetching, when the
    // cookies are already known). connection() defers this to the request.
    await connection();
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/"); // proxy.js normally redirects first, keeping ?next=

    return children;
}

// The check reads cookies, so it runs per request. With cacheComponents it
// must sit inside a Suspense boundary, or Next reports the route as blocking.
// The fallback is empty, as before: nothing shows until the session is known.
export default function ApplicationLayout({ children }) {
    return (
        <Suspense fallback={null}>
            <SignedInOnly>{children}</SignedInOnly>
        </Suspense>
    );
}
