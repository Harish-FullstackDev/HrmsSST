"use client";

import { useState } from "react";
import Image from "next/image";

// Password field with a show/hide toggle. `hiddenIcon` / `visibleIcon` are
// static SVG imports; each renders at its intrinsic size.
export default function PasswordInput({
    fieldClassName = "",
    focusClassName = "focus-within:border-accent",
    toggleClassName = "size-[2.125rem]",
    hiddenIcon,
    visibleIcon,
    className = "",
    ...inputProps
}) {
    const [visible, setVisible] = useState(false);
    const icon = visible ? visibleIcon : hiddenIcon;

    return (
        <div className={`flex items-center bg-white ${focusClassName} ${fieldClassName}`}>
            <input
                suppressHydrationWarning
                {...inputProps}
                type={visible ? "text" : "password"}
                className={`h-full min-w-0 flex-1 bg-transparent outline-none ${className}`}
            />
            <button
                suppressHydrationWarning
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? "Hide password" : "Show password"}
                aria-pressed={visible}
                className={`grid ${toggleClassName} shrink-0 place-items-center rounded-md focus-visible:outline-2 focus-visible:outline-accent`}
            >
                <Image
                    src={icon}
                    alt=""
                    style={{ width: icon.width, height: icon.height }}
                />
            </button>
        </div>
    );
}
