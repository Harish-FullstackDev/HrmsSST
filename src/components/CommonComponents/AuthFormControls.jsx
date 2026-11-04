import Image from "next/image";
import Link from "next/link";

import PasswordInput from "@/components/CommonComponents/PasswordInput";

import iconEye from "@/assets/CommonComponents/icons/eye-16.svg";
import iconArrowRight from "@/assets/CommonComponents/icons/arrow-right-14.svg";

// Building blocks of the careers-portal auth card (Figma "Login and signup"
// component, variants Sign In 1306:2612 and Sign Up 1306:2212).

// Figma sets 14px text at 140% but lays every line out in a 20 box (labels,
// intro, button, footer), so 20 is used to keep Figma's block heights.
export const textClass = "text-sm leading-5";

// Form controls here (and in PasswordInput / VerifyYourEmail) carry
// suppressHydrationWarning: Edge autofill and password-manager extensions
// add `fdprocessedid` to inputs and buttons before React hydrates, which
// otherwise logs a dev-only hydration mismatch. It only silences attribute
// differences on that one element.

// Figma's field is 46 tall: 13 from the outer edge to a 20 line (1 border +
// 12 padding here).
const fieldClass = "rounded-lg border bg-white p-3 transition-colors";
const borderClass = (invalid) => (invalid ? "border-required" : "border-border-default");

// The white card surface. Screens set their own padding and gap.
export function AuthCardShell({ className = "", ...props }) {
    return (
        <section
            className={`flex w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-[rgba(229,231,235,0.8)] bg-white shadow-[4px_4px_12px_rgba(0,0,0,0.05)] backdrop-blur-[8px] ${className}`}
            {...props}
        />
    );
}

// Eyebrow title (Figma "Body_Eyebrow": 14 medium, 16 line, 5% tracking).
export function CardTitle({ id, className = "", children }) {
    return (
        <h2 id={id} className={`text-sm leading-4 font-medium tracking-[0.05em] uppercase ${className}`}>
            {children}
        </h2>
    );
}

// The form card: eyebrow title, intro line, then the screen's form.
// 1 border + 32 padding = Figma's 33; 24 between every block.
export function AuthCard({ titleId, title, description, children }) {
    return (
        <AuthCardShell aria-labelledby={titleId} className="gap-6 p-6 sm:p-8">
            <CardTitle id={titleId}>{title}</CardTitle>
            <p className={textClass}>{description}</p>
            {children}
        </AuthCardShell>
    );
}

function FieldLabel({ htmlFor, required, children }) {
    return (
        <label htmlFor={htmlFor} className={textClass}>
            {children}
            {required && (
                <>
                    {" "}
                    <span className="text-required">*</span>
                </>
            )}
        </label>
    );
}

// Label + text input, 8 apart. `required` only draws the red asterisk
// (sign-in has them, sign-up doesn't); validation is the form's job.
export function TextField({ id, label, required = false, invalid = false, className = "", ...inputProps }) {
    return (
        <div className={`flex min-w-0 flex-col gap-2 ${className}`}>
            <FieldLabel htmlFor={id} required={required}>
                {label}
            </FieldLabel>
            <input
                suppressHydrationWarning
                id={id}
                aria-invalid={invalid || undefined}
                className={`${fieldClass} ${borderClass(invalid)} ${textClass} w-full outline-none placeholder:text-hint focus:border-action`}
                {...inputProps}
            />
        </div>
    );
}

// Label + password input with the eye toggle 13 in from the right edge. The
// design has a single eye icon, so it is used for both states.
export function PasswordField({ id, label, required = false, invalid = false, children, ...inputProps }) {
    return (
        <div className="flex flex-col gap-2">
            <FieldLabel htmlFor={id} required={required}>
                {label}
            </FieldLabel>
            <PasswordInput
                id={id}
                aria-invalid={invalid || undefined}
                fieldClassName={`${fieldClass} ${borderClass(invalid)} gap-2`}
                focusClassName="focus-within:border-action"
                toggleClassName="size-4"
                className={`${textClass} min-h-5 placeholder:text-hint`}
                hiddenIcon={iconEye}
                visibleIcon={iconEye}
                {...inputProps}
            />
            {children}
        </div>
    );
}

// 16px checkbox + label, 8 apart. The two Figma variants draw the box
// differently, so the screen passes its box style.
export function Checkbox({ checked, onChange, boxClassName, children, ...inputProps }) {
    return (
        <label className={`flex cursor-pointer items-center gap-2 text-neutral-700 ${textClass}`}>
            <input
                suppressHydrationWarning
                type="checkbox"
                checked={checked}
                onChange={onChange}
                className="peer sr-only"
                {...inputProps}
            />
            <span
                className={`grid size-4 shrink-0 place-items-center border bg-white peer-checked:border-action peer-checked:bg-action peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-action ${boxClassName}`}
            >
                {checked && <span className="mb-[2px] h-2 w-[5px] rotate-45 border-r-[1.5px] border-b-[1.5px] border-white" />}
            </span>
            {children}
        </label>
    );
}

// Full-width primary button with the trailing arrow (Figma "Button").
export function SubmitButton({ busy, children }) {
    return (
        <button
            suppressHydrationWarning
            type="submit"
            disabled={busy}
            className={`flex w-full items-center justify-center gap-3 rounded-lg bg-action px-3 py-2.5 text-white shadow-[0_1px_1px_rgba(0,0,0,0.05)] transition-colors hover:bg-action/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action disabled:cursor-wait disabled:opacity-70 ${textClass}`}
        >
            {children}
            <Image src={iconArrowRight} alt="" className="size-[14px]" />
        </button>
    );
}

// Full-width outline link under the primary button (Cancel / Back). Figma
// "Button" secondary: action-blue border, ink text, 1 border + 9 padding so
// it is 40 tall like the primary one.
export function SecondaryLink({ href, children }) {
    return (
        <Link
            href={href}
            className={`flex w-full items-center justify-center rounded-lg border border-action bg-white px-3 py-[9px] text-ink shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition-colors hover:bg-action/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-action ${textClass}`}
        >
            {children}
        </Link>
    );
}

// Error (red) or success (green) line in the form. Not in the design.
export function FormMessage({ id, tone = "error", children }) {
    return (
        <p
            id={id}
            role={tone === "error" ? "alert" : "status"}
            className={`${textClass} ${tone === "error" ? "text-required" : "text-success"}`}
        >
            {children}
        </p>
    );
}
