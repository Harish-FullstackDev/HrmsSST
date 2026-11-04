import { Suspense } from "react";
import { redirect } from "next/navigation";

import HrShell from "@/components/HrShell/HrShell";
import { getProfile } from "@/lib/auth/hr";

// Only HR accounts (profiles.role = 'hr') get past here; candidates go to
// their dashboard. The signed-in check itself comes from the (application)
// layout above, and RLS checks the role again on every query.
async function HrOnly({ children }) {
    const profile = await getProfile();
    if (profile?.role !== "hr") redirect("/dashboard");

    const user = {
        name: [profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.email,
        role: "HR",
    };
    return <HrShell user={user}>{children}</HrShell>;
}

// The check reads cookies, so it runs per request inside a Suspense boundary.
export default function HrLayout({ children }) {
    return (
        <Suspense fallback={null}>
            <HrOnly>{children}</HrOnly>
        </Suspense>
    );
}
