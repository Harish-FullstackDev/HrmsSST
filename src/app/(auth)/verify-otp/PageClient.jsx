"use client";

import AuthPageLayout from "@/components/CommonComponents/AuthPageLayout";
import VerifyYourEmail from "@/components/VerifyEmail/VerifyYourEmail";

// Forgot-password OTP step: the verify-email card (Figma 1306:2758) in the
// same frame, checking a recovery code instead of a sign-up one.
const page = () => {
    return (
        <AuthPageLayout topClassName="lg:pt-[62px]" cardClassName="lg:mb-8">
            <VerifyYourEmail flow="recovery" />
        </AuthPageLayout>
    );
};

export default page;
