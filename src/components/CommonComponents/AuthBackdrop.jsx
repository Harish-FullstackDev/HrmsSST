import Image from "next/image";

import blobBlue from "@/assets/CommonComponents/blob-blue.svg";
import blobGreen from "@/assets/CommonComponents/blob-green.svg";

// Figma 1306:2567 / 1306:2566: the two blurred gradient blobs behind the
// careers-portal auth screens, at the centres and rotations Figma gives them
// in the 1440 frame: the blue one measured from the left edge, the green one
// from the right. The rotation matters: each blob's gradient turns with
// it. The blue one hangs off the top edge; the green one is pinned to the
// bottom-right corner so it stays there whatever the screen height. Each SVG
// keeps its own size (blur margin included).
export default function AuthBackdrop() {
    return (
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="relative h-full w-full">
                <Image
                    src={blobBlue}
                    alt=""
                    priority
                    className="absolute top-[-168px] left-[83px] h-[680px] w-[680px] max-w-none rotate-45"
                />
                <Image
                    src={blobGreen}
                    alt=""
                    priority
                    className="absolute right-[-219px] bottom-[-328px] h-[941px] w-[631px] max-w-none -rotate-[105deg]"
                />
            </div>
        </div>
    );
}
