"use client";

import { Suspense } from "react";

import AuthPageLayout from "@/components/CommonComponents/AuthPageLayout";
import SignInToYourAccount from "@/components/SignIn/SignInToYourAccount";

// Figma frame 1306:2565 (1440×800): the sign-in page is the landing page.
// The card starts 51 under the header; 32 is kept below it on short screens.
// The card reads ?next= with useSearchParams, which needs a Suspense boundary
// under cacheComponents.
const page = () => {
    return (
        <AuthPageLayout topClassName="lg:pt-[51px]" cardClassName="lg:mb-8">
            <Suspense>
                <SignInToYourAccount />
            </Suspense>
        </AuthPageLayout>
    );
};

export default page;
