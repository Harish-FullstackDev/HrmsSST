"use client";

import AuthPageLayout from "@/components/CommonComponents/AuthPageLayout";
import UpdateYourPassword from "@/components/ResetPassword/UpdateYourPassword";

// Same frame as the sign-in page (Figma 1306:2565), with the new-password card.
const page = () => {
    return (
        <AuthPageLayout topClassName="lg:pt-[51px]" cardClassName="lg:mb-8">
            <UpdateYourPassword />
        </AuthPageLayout>
    );
};

export default page;
