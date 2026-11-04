"use client";

import { useMemo, useSyncExternalStore } from "react";

// Saved jobs and the contact details shown on My Profile, kept in this
// browser until the candidate account has tables for them (ported from the
// website's src/lib/candidateStorage.js). Applications live in the database. Storage can be blocked (private mode, site
// data cleared), so every read falls back to an empty list and every write is
// best effort. Components read through the hooks below, which re-render on
// every write here and on changes from other tabs.

const SAVED_JOBS_KEY = "hrms-saved-jobs";

const listeners = new Set();

function subscribe(listener) {
    listeners.add(listener);
    window.addEventListener("storage", listener);
    return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", listener);
    };
}

function readRaw(key) {
    try {
        return localStorage.getItem(key) ?? "[]";
    } catch {
        return "[]";
    }
}

function parseList(raw) {
    try {
        const list = JSON.parse(raw);
        return Array.isArray(list) ? list : [];
    } catch {
        return [];
    }
}

const readList = (key) => parseList(readRaw(key));

function writeList(key, list) {
    try {
        localStorage.setItem(key, JSON.stringify(list));
    } catch {
        // Storage blocked: nothing to keep the change in.
    }
    listeners.forEach((listener) => listener());
}

// The list under `key`, or null until it has been read in the browser.
function useStoredList(key) {
    const raw = useSyncExternalStore(
        subscribe,
        () => readRaw(key),
        () => null,
    );
    return useMemo(() => (raw === null ? null : parseList(raw)), [raw]);
}

export const useSavedJobSlugs = () => useStoredList(SAVED_JOBS_KEY);

export function setJobSaved(slug, saved) {
    const list = readList(SAVED_JOBS_KEY).filter((s) => s !== slug);
    writeList(SAVED_JOBS_KEY, saved ? [...list, slug] : list);
}

// Contact details from the candidate's latest submitted application, shown on
// My Profile: { phone, location, jobTitle, employer }. The account itself
// only holds the name and email.
const PROFILE_KEY = "hrms-profile";

export function useProfile() {
    const raw = useSyncExternalStore(
        subscribe,
        () => readRaw(PROFILE_KEY),
        () => null,
    );
    return useMemo(() => {
        if (raw === null) return null;
        try {
            const profile = JSON.parse(raw);
            return profile && typeof profile === "object" && !Array.isArray(profile) ? profile : {};
        } catch {
            return {};
        }
    }, [raw]);
}

export function recordProfile(profile) {
    try {
        localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } catch {
        // Storage blocked: nothing to keep the change in.
    }
    listeners.forEach((listener) => listener());
}
