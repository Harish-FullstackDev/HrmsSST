"use client";

import AuthPageLayout from "@/components/CommonComponents/AuthPageLayout";
import PasswordResetSuccessfully from "@/components/ResetPasswordSuccess/PasswordResetSuccessfully";

// Same frame and card as /email-verified (Figma 1306:2855), shown after the
// new password is saved.
const page = () => {
    return (
        <AuthPageLayout topClassName="lg:pt-[62px]" cardClassName="lg:mb-8">
            <PasswordResetSuccessfully />
        </AuthPageLayout>
    );
};

export default page;
