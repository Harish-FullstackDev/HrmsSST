"use client";

import { useEffect, useImperativeHandle, useRef, useState } from "react";

// Google reCAPTCHA v2 checkbox ("I'm not a robot"). The script loads once per
// page and the widget is rendered explicitly into our own box. `onChange`
// receives the token once ticked, and null when it expires (after two
// minutes) or errors. `ref.current.reset()` clears it so a new tick is needed,
// e.g. after the server rejected the token. The token must be checked on the
// server (verifyRecaptcha); this only collects it.
//
// Without NEXT_PUBLIC_RECAPTCHA_SITE_KEY, development uses Google's public test
// key, which always passes and shows a "for testing only" note.

const TEST_SITE_KEY = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI";
const SITE_KEY =
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || (process.env.NODE_ENV !== "production" ? TEST_SITE_KEY : "");

const ONLOAD = "__hrmsRecaptchaReady";
let scriptPromise = null;

function loadScript() {
    if (window.grecaptcha?.render) return Promise.resolve(window.grecaptcha);
    scriptPromise ??= new Promise((resolve, reject) => {
        window[ONLOAD] = () => resolve(window.grecaptcha);
        const script = document.createElement("script");
        script.src = `https://www.google.com/recaptcha/api.js?onload=${ONLOAD}&render=explicit`;
        script.async = true;
        script.defer = true;
        script.onerror = () => {
            scriptPromise = null;
            script.remove();
            reject(new Error("reCAPTCHA failed to load"));
        };
        document.head.appendChild(script);
    });
    return scriptPromise;
}

export default function Recaptcha({ ref, onChange, invalid, error }) {
    const boxRef = useRef(null);
    const widgetRef = useRef(null);
    const onChangeRef = useRef(onChange);
    const [loadFailed, setLoadFailed] = useState(!SITE_KEY);

    useEffect(() => {
        onChangeRef.current = onChange;
    });

    useImperativeHandle(ref, () => ({
        reset() {
            if (widgetRef.current != null) window.grecaptcha?.reset(widgetRef.current);
            onChangeRef.current?.(null);
        },
    }));

    useEffect(() => {
        if (!SITE_KEY) return;
        let cancelled = false;
        loadScript()
            .then((grecaptcha) => {
                if (cancelled || !boxRef.current || widgetRef.current != null) return;
                widgetRef.current = grecaptcha.render(boxRef.current, {
                    sitekey: SITE_KEY,
                    callback: (token) => onChangeRef.current?.(token),
                    "expired-callback": () => onChangeRef.current?.(null),
                    "error-callback": () => onChangeRef.current?.(null),
                });
            })
            .catch(() => !cancelled && setLoadFailed(true));
        return () => {
            cancelled = true;
        };
    }, []);

    const message = loadFailed
        ? "The security check couldn't load. Check your connection and reload the page."
        : error;

    return (
        <div className="flex flex-col items-center gap-1">
            {/* reCAPTCHA's own 304 x 78 box; a red ring marks it when missing. */}
            <div
                ref={boxRef}
                aria-describedby={message ? "recaptcha-message" : undefined}
                className={`min-h-[78px] rounded ${invalid ? "ring-1 ring-required ring-offset-2" : ""}`}
            />
            {message && (
                <p id="recaptcha-message" role="alert" className="text-sm leading-[1.4] text-required">
                    {message}
                </p>
            )}
        </div>
    );
}
