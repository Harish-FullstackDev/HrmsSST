import Image from "next/image";
import Link from "next/link";

import { AuthCardShell, CardTitle } from "@/components/CommonComponents/AuthFormControls";

import iconVerified from "@/assets/EmailVerified/verified-check-32.svg";
import iconArrowRight from "@/assets/CommonComponents/icons/arrow-right-blue-14.svg";

// Figma 1306:2505 "Login and signup" (verified mail): the success card that
// ends a flow. 1 border + 32 / 48 padding = Figma's 33 / 49; icon, title and
// link centred, 16 apart (202 tall). `href` is the Sign in link's target.
export default function AuthSuccessCard({ titleId, title, href = "/" }) {
    return (
        <AuthCardShell aria-labelledby={titleId} className="items-center gap-4 px-8 py-12">
            <Image src={iconVerified} alt="" className="size-8" />
            <CardTitle id={titleId} className="text-center">
                {title}
            </CardTitle>
            <Link
                href={href}
                className="group flex items-center gap-1 text-base leading-6 text-action capitalize"
            >
                <span className="underline [text-underline-position:from-font] decoration-from-font group-hover:no-underline">
                    Sign in
                </span>
                <Image src={iconArrowRight} alt="" className="size-[14px]" />
            </Link>
        </AuthCardShell>
    );
}
