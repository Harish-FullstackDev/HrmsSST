"use client";

import { setJobSaved, useSavedJobSlugs } from "./candidateStorage";

// Saved state of one job; the Saved Jobs page reads the same list.
export default function useSavedJob(slug) {
    const saved = useSavedJobSlugs()?.includes(slug) ?? false;
    const toggle = () => setJobSaved(slug, !saved);
    return [saved, toggle];
}
