import { NextResponse } from "next/server";

import { APPLY_JOB_COOKIE, getJobBySlug } from "@/lib/jobs";

// Starts an application for one job: the website's "Apply" button and the
// portal's own job page both link here. proxy.js sends a signed-out visitor
// to sign-in first and back here afterwards (?next=). The job is kept in a
// cookie so every apply stage, and a reload, knows which job it is for.
// A closed or unknown job goes to its job page, which says so.
export async function GET(request, { params }) {
    const { slug } = await params;
    const job = await getJobBySlug(slug);
    if (!job) return NextResponse.redirect(new URL(`/jobs/${encodeURIComponent(slug)}`, request.url));

    const response = NextResponse.redirect(new URL("/apply/upload-resume", request.url));
    response.cookies.set(APPLY_JOB_COOKIE, job.slug, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
    });
    return response;
}
