"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// A button that opens a list of actions (Figma 1983:9165: white, rounded 8,
// soft shadow, 18 padding, 12px items 38 apart). The list is portalled to
// <body> and fixed under the button, so a table's scroller (which has paint
// containment) can't clip or offset it.
// Items: { label, onSelect, selected? }. `align` lines the list up with the
// button's right ("end") or left ("start") edge.
export default function HrMenu({ label, items, align = "end", className = "", menuClassName = "", children }) {
    const [position, setPosition] = useState(null);
    const buttonRef = useRef(null);
    const listRef = useRef(null);
    const menuId = useId();
    const open = position !== null;

    const close = (refocus = true) => {
        setPosition(null);
        if (refocus) buttonRef.current?.focus();
    };

    const toggle = () => {
        if (open) return close(false);
        const rect = buttonRef.current.getBoundingClientRect();
        setPosition({
            top: rect.bottom + 4,
            ...(align === "end" ? { right: window.innerWidth - rect.right } : { left: rect.left }),
        });
    };

    // Once the list is drawn, keep it on screen: if it would run past the
    // bottom of the window, open it above the button instead (where there's
    // more room), and cap its height to the room it has, scrolling inside.
    useLayoutEffect(() => {
        if (!open || position.placed) return;
        const list = listRef.current;
        const button = buttonRef.current?.getBoundingClientRect();
        if (!list || !button) return;
        const margin = 8;
        const below = window.innerHeight - button.bottom - 4 - margin;
        const above = button.top - 4 - margin;
        const height = list.scrollHeight;
        const horizontal = align === "end" ? { right: position.right } : { left: position.left };
        if (height <= below || below >= above) {
            setPosition({ top: button.bottom + 4, ...horizontal, maxHeight: below, placed: true });
        } else {
            setPosition({ bottom: window.innerHeight - button.top + 4, ...horizontal, maxHeight: above, placed: true });
        }
    }, [open, position, align]);

    // Focus the first item once the list is placed (a hidden one can't take focus).
    const placed = Boolean(position?.placed);
    useEffect(() => {
        if (placed) listRef.current?.querySelector("[role=menuitem], [role=menuitemradio]")?.focus();
    }, [placed]);

    useEffect(() => {
        if (!open) return;

        const onPointerDown = (event) => {
            if (!listRef.current?.contains(event.target) && !buttonRef.current?.contains(event.target)) close(false);
        };
        // A fixed list would drift from its button, so it closes instead.
        const onMove = () => close(false);
        document.addEventListener("pointerdown", onPointerDown);
        window.addEventListener("resize", onMove);
        window.addEventListener("scroll", onMove, true);
        return () => {
            document.removeEventListener("pointerdown", onPointerDown);
            window.removeEventListener("resize", onMove);
            window.removeEventListener("scroll", onMove, true);
        };
    }, [open]);

    const onKeyDown = (event) => {
        const options = [...listRef.current.querySelectorAll("[role=menuitem], [role=menuitemradio]")];
        const index = options.indexOf(document.activeElement);
        const focusAt = (i) => options[(i + options.length) % options.length]?.focus();
        if (event.key === "Escape") close();
        else if (event.key === "Tab") close(false);
        else if (event.key === "ArrowDown") focusAt(index + 1);
        else if (event.key === "ArrowUp") focusAt(index - 1);
        else if (event.key === "Home") focusAt(0);
        else if (event.key === "End") focusAt(options.length - 1);
        else return;
        if (event.key !== "Tab") event.preventDefault();
    };

    return (
        <>
            <button
                ref={buttonRef}
                type="button"
                aria-label={label}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-controls={open ? menuId : undefined}
                onClick={toggle}
                className={className}
            >
                {children}
            </button>
            {open &&
                createPortal(
                    <div
                        ref={listRef}
                        id={menuId}
                        role="menu"
                        aria-label={label}
                        onKeyDown={onKeyDown}
                        style={{
                            top: position.top,
                            bottom: position.bottom,
                            left: position.left,
                            right: position.right,
                            maxHeight: position.maxHeight,
                            // Hidden until placed, so it never flashes off screen.
                            visibility: position.placed ? undefined : "hidden",
                        }}
                        className={`fixed z-50 flex min-w-[169px] flex-col overflow-y-auto rounded-lg bg-white py-[7.5px] shadow-[0_1px_5.3px_rgba(0,0,0,0.25)] ${menuClassName}`}
                    >
                        {items.map((item) => (
                            <button
                                key={item.label}
                                type="button"
                                role={item.selected === undefined ? "menuitem" : "menuitemradio"}
                                aria-checked={item.selected}
                                onClick={() => {
                                    close();
                                    item.onSelect?.();
                                }}
                                className={`px-[18px] py-[10.5px] text-left text-xs leading-[1.4] whitespace-nowrap hover:bg-surface-brand-subtle focus-visible:bg-surface-brand-subtle focus-visible:outline-none ${
                                    item.selected ? "text-action" : "text-black"
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>,
                    document.body,
                )}
        </>
    );
}
