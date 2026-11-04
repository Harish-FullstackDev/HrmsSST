"use client";

import { loadDocumentFile } from "@/components/Apply/applicationStorage";
import { DOCUMENTS_LIST } from "@/components/UploadDocuments/UploadDocumentsForm";
import { createClient } from "@/lib/supabase/client";

const BUCKET = "applications";

// Some browsers leave File.type empty for .doc/.docx; Storage checks the type
// against the bucket's allowed list, so fall back to the extension's.
const TYPE_BY_EXTENSION = {
    pdf: "application/pdf",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
};

const contentTypeOf = (file) => file.type || TYPE_BY_EXTENSION[file.name.split(".").pop()?.toLowerCase()] || "";

// A storage-safe version of a file name: letters, digits, dot, dash and
// underscore only, at most 80 characters.
const safeName = (name) => name.replace(/[^\w.-]+/g, "_").slice(-80);

// Uploads the resume and every attached document to the candidate's own
// folder in Storage (<uid>/<upload id>/<field>-<name>), straight from the
// browser so large files don't pass through a Server Action. Returns
// { resumePath, resumeName, documentPaths: { field: path } } for
// submitApplication, or throws an Error with a message for the candidate.
export async function uploadApplicationFiles({ resume, documents }) {
    const supabase = createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Your session has ended. Please sign in again, then submit.");

    const folder = `${user.id}/${crypto.randomUUID()}`;
    const upload = async (field, file) => {
        const path = `${folder}/${field}-${safeName(file.name)}`;
        const { error } = await supabase.storage
            .from(BUCKET)
            .upload(path, file, { contentType: contentTypeOf(file), upsert: false });
        if (error) throw new Error(`Uploading ${file.name} failed. Please try again.`);
        return path;
    };

    const documentPaths = {};
    // The files themselves were kept in this browser when attached; if the
    // browser dropped them, the candidate has to attach them again.
    for (const { field, label } of DOCUMENTS_LIST) {
        if (!documents?.[field]) continue;
        const file = await loadDocumentFile(field);
        if (!file) throw new Error(`Please attach your ${label.toLowerCase()} again in Upload Documents.`);
        documentPaths[field] = await upload(field, file);
    }

    return { resumePath: await upload("resume", resume), resumeName: resume.name, documentPaths };
}
