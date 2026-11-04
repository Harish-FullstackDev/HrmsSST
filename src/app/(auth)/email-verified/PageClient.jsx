"use client";

import { Suspense } from "react";

import AuthPageLayout from "@/components/CommonComponents/AuthPageLayout";
import EmailVerifiedSuccessfully from "@/components/EmailVerified/EmailVerifiedSuccessfully";

// Figma frame 1306:2855 (1440×800): shown after the sign-up code is
// verified. Same frame as sign-up, card 62 under the header. The card reads
// ?next= with useSearchParams, hence the Suspense boundary.
const page = () => {
    return (
        <AuthPageLayout topClassName="lg:pt-[62px]" cardClassName="lg:mb-8">
            <Suspense>
                <EmailVerifiedSuccessfully />
            </Suspense>
        </AuthPageLayout>
    );
};

export default page;
