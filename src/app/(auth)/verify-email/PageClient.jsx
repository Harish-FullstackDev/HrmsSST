"use client";

import AuthPageLayout from "@/components/CommonComponents/AuthPageLayout";
import VerifyYourEmail from "@/components/VerifyEmail/VerifyYourEmail";

// Figma frame 1306:2758 (1440×800): the step after sign-up. Same frame as
// sign-up, card 62 under the header.
const page = () => {
    return (
        <AuthPageLayout topClassName="lg:pt-[62px]" cardClassName="lg:mb-8">
            <VerifyYourEmail />
        </AuthPageLayout>
    );
};

export default page;
