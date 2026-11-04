import AuthBackdrop from "@/components/CommonComponents/AuthBackdrop";
import JoinProfessionals from "@/components/CommonComponents/JoinProfessionals";
import MakeYourNextMove from "@/components/CommonComponents/MakeYourNextMove";
import PortalHeader from "@/components/CommonComponents/PortalHeader";

// Shared frame of the careers-portal auth screens (Figma 1306:2565 sign-in,
// 1306:2517 sign-up; both 1440×800). All sizes are Figma's own px values,
// with 64 to the screen edges at every desktop width.
//
// Desktop is a two-column grid: headline top-left, avatar strip pinned 68
// above the page bottom in the same column, and the card on the right
// spanning both rows. The card's right edge is 136 from the screen edge
// (64 + 72). The strip and the card are in different columns, so a tall card
// (sign-up) can run past the strip's line, as in Figma. Each screen passes
// its own top gap under the header and the space it needs below its card.
// Below lg everything stacks: headline, card, strip.
export default function AuthPageLayout({ topClassName, cardClassName = "", children }) {
    return (
        <div className="relative isolate flex min-h-dvh w-full flex-1 flex-col bg-white font-switzer text-ink">
            <AuthBackdrop />
            <PortalHeader />

            <main
                className={`grid w-full flex-1 gap-10 px-4 pt-10 pb-10 [grid-template-areas:'intro'_'card'_'strip'] sm:px-16 lg:grid-cols-[462px_minmax(380px,520px)] lg:grid-rows-[auto_1fr] lg:justify-between lg:gap-x-8 lg:gap-y-0 lg:pb-0 lg:[grid-template-areas:'intro_card'_'strip_card'] xl:pr-[136px] ${topClassName}`}
            >
                <MakeYourNextMove className="[grid-area:intro]" />
                <div className={`[grid-area:card] lg:self-start ${cardClassName}`}>{children}</div>
                <JoinProfessionals className="[grid-area:strip] lg:self-end lg:pt-8 lg:pb-[68px]" />
            </main>
        </div>
    );
}
