"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import Button from "@/components/CommonComponents/Button";

// Ends the Supabase session and returns to the login page.
export default function SignOutButton() {
    const router = useRouter();
    const [signingOut, setSigningOut] = useState(false);

    const handleClick = async () => {
        setSigningOut(true);
        await createClient().auth.signOut();
        router.push("/");
        router.refresh();
    };

    return (
        <Button variant="outline" onClick={handleClick} disabled={signingOut} className="w-auto px-8">
            {signingOut ? "Signing out…" : "Sign out"}
        </Button>
    );
}
