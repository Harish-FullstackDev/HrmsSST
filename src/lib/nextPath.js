// The `?next=` page to return to after signing in (set by proxy.js when a
// signed-out visitor opens a protected page, e.g. the website's Apply link).
// Only same-site paths are accepted, so the parameter can't send the user to
// another site.
export function safeNext(value) {
    if (typeof value !== "string" || !value.startsWith("/")) return null;
    if (value.startsWith("//") || value.startsWith("/\\")) return null;
    return value;
}

// `href` with `next` carried along, when there is one.
export function withNext(href, next) {
    if (!next) return href;
    return `${href}${href.includes("?") ? "&" : "?"}next=${encodeURIComponent(next)}`;
}
