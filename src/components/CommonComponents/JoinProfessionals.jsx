import Image from "next/image";

import avatar1 from "@/assets/CommonComponents/avatars/avatar-1.jpg";
import avatar2 from "@/assets/CommonComponents/avatars/avatar-2.jpg";
import avatar3 from "@/assets/CommonComponents/avatars/avatar-3.jpg";
import avatar4 from "@/assets/CommonComponents/avatars/avatar-4.jpg";
import avatar5 from "@/assets/CommonComponents/avatars/avatar-5.jpg";

const AVATARS = [avatar1, avatar2, avatar3, avatar4, avatar5];

// Figma 1306:2568 / 1306:2520: overlapping avatars + tagline, pinned 68
// above the bottom of the sign-in and sign-up screens.
export default function JoinProfessionals({ className = "" }) {
    return (
        <div className={`flex items-center gap-4 ${className}`}>
            <div className="flex shrink-0">
                {AVATARS.map((src, i) => (
                    <Image
                        key={i}
                        src={src}
                        alt=""
                        sizes="32px"
                        className="-mr-1 size-6 rounded-full border-[1.5px] border-white object-cover last:mr-0"
                    />
                ))}
            </div>
            <p className="text-sm leading-[1.4]">Join professionals exploring their next opportunity.</p>
        </div>
    );
}
