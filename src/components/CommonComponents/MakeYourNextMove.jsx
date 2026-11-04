// Figma 1306:2609 / 1306:2561: the headline block left of the auth card on
// the sign-in and sign-up screens.
export default function MakeYourNextMove({ className = "" }) {
    return (
        <div className={`capitalize ${className}`}>
            <h1 className="text-[32px] leading-[1.2] font-light sm:text-[48px]">
                Make your next move
                <br />
                <span className="font-bold text-action">matter</span>
            </h1>
            <p className="mt-6 text-base leading-[1.5] lg:mt-8">
                Find opportunities where your skills, ideas, and ambitions{" "}
                <br className="hidden xl:block" />
                can move you forward
            </p>
        </div>
    );
}
