"use client";

import AuthPageLayout from "@/components/CommonComponents/AuthPageLayout";
import ResetYourPassword from "@/components/ForgotPassword/ResetYourPassword";

// Same frame as the sign-in page (Figma 1306:2565), with the reset card.
const page = () => {
    return (
        <AuthPageLayout topClassName="lg:pt-[51px]" cardClassName="lg:mb-8">
            <ResetYourPassword />
        </AuthPageLayout>
    );
};

export default page;
