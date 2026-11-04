// Lets `node --test` load the app's modules the way Next does: the "@/"
// alias (jsconfig.json) and imports without a file extension.
// Registered by tests/setup/register.mjs.

import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";

const SRC = new URL("../../src/", import.meta.url);

export async function resolve(specifier, context, nextResolve) {
    let target = specifier;
    if (target.startsWith("@/")) target = new URL(target.slice(2), SRC).href;
    if (target.startsWith(".") || target.startsWith("file:")) {
        const url = new URL(target, context.parentURL);
        const path = fileURLToPath(url);
        if (!existsSync(path) || !/\.\w+$/.test(path)) {
            for (const ext of [".js", ".jsx", ".mjs"]) {
                if (existsSync(path + ext)) return nextResolve(pathToFileURL(path + ext).href, context);
            }
        }
        return nextResolve(url.href, context);
    }
    // Packages without an "exports" map, like next/headers, are imported
    // without the ".js" their files have.
    try {
        return await nextResolve(target, context);
    } catch (error) {
        if (error?.code !== "ERR_MODULE_NOT_FOUND" || /\.\w+$/.test(target)) throw error;
        return nextResolve(`${target}.js`, context);
    }
}
