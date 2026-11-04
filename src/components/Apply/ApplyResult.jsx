import Image from "next/image";
import Link from "next/link";

import successCheck from "@/assets/Apply/icons/success-check-30.svg";
import ApplyStage from "@/components/Apply/ApplyStage";

// Figma 1878:22325: green tick tile, heading, a line under it, the reference
// on a light blue pill, and a link to My Profile (which lists the
// candidate's applications), 32 apart.
// Used for "submitted successfully" and for "you have already applied".
export default function ApplyResult({ title, message, reference, href = "/my-profile", linkLabel = "Go to My Applications" }) {
    return (
        <ApplyStage className="flex flex-col items-center px-4 py-16 text-center">
            <div role="status" className="flex flex-col items-center gap-8">
                <span className="flex size-16 items-center justify-center rounded-xl bg-[rgba(25,128,56,0.1)] motion-safe:animate-[apply-check-in_400ms_ease-out_backwards]">
                    <Image src={successCheck} alt="" width={30} height={30} />
                </span>
                <div className="flex flex-col items-center gap-2">
                    <h2 className="text-2xl leading-[1.2] font-medium text-[#161616] capitalize sm:text-[32px]">{title}</h2>
                    <p className="max-w-[560px] text-sm leading-[1.4] text-[#525252]">{message}</p>
                </div>
                {reference && (
                    <p className="rounded-lg bg-surface-brand-subtle px-6 py-3 text-lg leading-[1.2] font-medium text-action">
                        APPLICATION_REF_ID: {reference}
                    </p>
                )}
                <Link
                    href={href}
                    className="rounded-lg bg-action px-6 py-3 text-lg leading-[1.2] font-medium text-white transition-colors hover:bg-[#005192]"
                >
                    {linkLabel}
                </Link>
            </div>
        </ApplyStage>
    );
}
