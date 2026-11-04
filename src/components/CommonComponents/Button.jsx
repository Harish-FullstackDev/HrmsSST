import Link from "next/link";

const base =
    "flex h-14 w-full items-center justify-center rounded-[10px] px-5 text-base leading-6 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

const variants = {
    primary:
        "bg-primary text-white hover:bg-navy-900 disabled:cursor-not-allowed disabled:bg-[#f0f1f1] disabled:text-[#a9adb2]",
    outline: "border border-[#171717] bg-white text-ink hover:bg-zinc-50",
};

// Full-width action button shared by every auth screen. Use ButtonLink when
// the action navigates instead of submitting.
export default function Button({ variant = "primary", className = "", ...props }) {
    return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function ButtonLink({ variant = "primary", className = "", ...props }) {
    return <Link className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
