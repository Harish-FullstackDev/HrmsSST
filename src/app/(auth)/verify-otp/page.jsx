import { Suspense } from "react";

import PageClient from "./PageClient";

export const metadata = {
    title: "OTP verification · HRMS Portal",
};

// VerifyYourEmail reads ?email= with useSearchParams, which needs a Suspense
// boundary under cacheComponents.
export default function Page() {
    return (
        <Suspense>
            <PageClient />
        </Suspense>
    );
}
