"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

import checkOff from "@/assets/Apply/icons/doc-check-off-16.svg";
import checkOn from "@/assets/Apply/icons/doc-check-on-16.svg";
import { FileChip } from "@/components/Apply/ApplyFilePicker";
import { loadDocumentFile } from "@/components/Apply/applicationStorage";
import { applyStepHref } from "@/components/Apply/applySteps";
import { experienceSummary } from "@/components/ExperienceEducation/ExperienceEducationForm";
import { phoneCodeFor } from "@/components/PersonalDetails/PersonalDetailsForm";
import { certificationsOf, workLinks } from "@/components/SkillsCertifications/SkillsCertificationsForm";
import { DOCUMENTS_LIST } from "@/components/UploadDocuments/UploadDocumentsForm";
import { ReviewCard, ReviewField, ReviewGrid, ReviewTags } from "@/components/ReviewSubmit/ReviewParts";

const phone = (code, number) => (number ? `${phoneCodeFor(code).code} ${number}` : "");

// Object URL for a file kept in this browser (see applicationStorage), or
// null while loading or when there is none.
function useDocumentUrl(field, fileName) {
    const [file, setFile] = useState(null);
    useEffect(() => {
        let cancelled = false;
        if (fileName) loadDocumentFile(field).then((found) => !cancelled && setFile(found));
        return () => {
            cancelled = true;
        };
    }, [field, fileName]);
    const url = useMemo(() => (fileName && file ? URL.createObjectURL(file) : null), [fileName, file]);
    useEffect(() => () => url && URL.revokeObjectURL(url), [url]);
    return url;
}

// Figma 1919:5985: the photograph (240 square) over the signature (240 x 120
// on white), 24 apart on a grey panel.
function PhotoAndSignature({ documents }) {
    const photoUrl = useDocumentUrl("photograph", documents.photograph);
    const signatureUrl = useDocumentUrl("signature", documents.signature);
    const frame = "relative overflow-hidden rounded flex items-center justify-center text-sm text-hint";

    return (
        <div className="flex w-full flex-col gap-6 rounded-xl bg-[#f8f9fa] p-6 lg:w-auto lg:shrink-0">
            <p className="text-sm leading-[1.4] text-ink">Photograph &amp; Signature</p>
            <div className="flex flex-wrap items-center gap-6 lg:flex-col lg:items-start">
                <div className={`${frame} size-[240px] bg-white`}>
                    {photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- a local object URL
                        <img src={photoUrl} alt="Your photograph" className="size-full object-cover" />
                    ) : (
                        "No photograph"
                    )}
                </div>
                <div className={`${frame} h-[120px] w-[240px] bg-white`}>
                    {signatureUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- a local object URL
                        <img src={signatureUrl} alt="Your signature" className="max-h-[71px] max-w-[157px] object-contain" />
                    ) : (
                        "No signature"
                    )}
                </div>
            </div>
        </div>
    );
}

// Figma 1919:5939: the resume, then each other document, with its file and a
// tick once attached (the photograph and signature show in the panel
// instead). On desktop the rows share the panel's height evenly. The resume's
// name opens it in a new tab.
function DocumentList({ resume, resumeUrl, documents }) {
    const rows = [
        { field: "resume", label: "Resume", files: resume ? [resume.name] : [], href: resumeUrl },
        ...DOCUMENTS_LIST.filter(({ field }) => field !== "photograph" && field !== "signature").map(
            ({ field, label, multiple }) => ({
                field,
                label,
                files: multiple ? documents[field] ?? [] : documents[field] ? [documents[field]] : [],
            }),
        ),
    ];
    return (
        <ul className="flex min-w-0 flex-1 flex-col lg:self-stretch">
            {rows.map(({ field, label, files, href }) => {
                return (
                    <li
                        key={field}
                        className="grid grid-cols-[1fr_auto] items-center gap-x-5 gap-y-2 border-b border-[#f1f3f5] py-6 last:border-b-0 md:grid-cols-[minmax(0,296px)_1fr_auto] lg:flex-1 lg:py-8"
                    >
                        <span className="text-sm leading-[1.4] text-black">{label}</span>
                        <span className="col-span-2 row-start-2 flex flex-wrap gap-2 md:col-span-1 md:row-start-1 md:col-start-2">
                            {files.map((name, index) =>
                                href ? (
                                    <a key={name} href={href} target="_blank" rel="noreferrer" className="max-w-full hover:underline">
                                        <FileChip name={name} />
                                    </a>
                                ) : (
                                    <FileChip key={`${name}-${index}`} name={name} />
                                ),
                            )}
                        </span>
                        <Image
                            src={files.length > 0 ? checkOn : checkOff}
                            alt={files.length > 0 ? "Attached" : "Not attached"}
                            width={16}
                            height={16}
                            className="col-start-2 row-start-1 md:col-start-3"
                        />
                    </li>
                );
            })}
        </ul>
    );
}

// Figma 1878:21982 onwards: stage 6's cards, one per earlier stage, each
// echoing that stage's answers read-only with an Edit link back to it.
// `data` is the apply context's stepData; missing answers show "Not provided".
export default function ApplicationReview({ resume, resumeUrl, data }) {
    const personal = data["personal-details"] ?? {};
    const experience = data["experience-and-education"] ?? {};
    const skills = data["skills-and-certifications"] ?? {};
    const documents = data["upload-documents"] ?? {};

    const links = workLinks(skills).filter((link) => link.url.trim());

    return (
        <div className="flex w-full flex-col gap-8">
            <ReviewCard title="Personal Details" editHref={applyStepHref(1)}>
                {/* Figma 1947:13765: five columns; the optional middle name and
                    LinkedIn show only when given. */}
                <ReviewGrid columns={5}>
                    <ReviewField label="First Name" value={personal.firstName} />
                    {personal.middleName && <ReviewField label="Middle Name" value={personal.middleName} />}
                    <ReviewField label="Last Name" value={personal.lastName} />
                    <ReviewField label="Email" value={personal.email} />
                    <ReviewField label="Mobile Number" value={phone(personal.phoneCode, personal.phone)} />
                    <ReviewField label="Alternate Mobile Number" value={phone(personal.altPhoneCode, personal.altPhone)} />
                    <ReviewField label="Gender" value={personal.gender} />
                    <ReviewField label="PAN No." value={personal.pan} />
                    <ReviewField label="Country" value={personal.country} />
                    <ReviewField label="State" value={personal.state} />
                    <ReviewField label="City" value={personal.city} />
                    {personal.linkedIn && <ReviewField label="LinkedIn Profile URL" value={personal.linkedIn} />}
                    <ReviewField
                        label="Languages"
                        className="md:col-span-2"
                        value={
                            personal.languages?.length ? (
                                <span className="flex flex-wrap gap-x-3">
                                    {personal.languages.map(({ language, fluency }) => (
                                        <span key={language}>
                                            {language} | {fluency}
                                        </span>
                                    ))}
                                </span>
                            ) : (
                                ""
                            )
                        }
                    />
                </ReviewGrid>
            </ReviewCard>

            <ReviewCard title="Experience and Education" editHref={applyStepHref(2)}>
                <ReviewGrid columns={5}>
                    {experienceSummary(experience).map(({ field, label, value }) => (
                        <ReviewField
                            key={field}
                            label={label}
                            value={field === "realWorldWork" && Array.isArray(value) ? value.join(", ") : value}
                            tags={field === "workHistory"}
                            className={field === "workHistory" ? "md:col-span-2 lg:col-span-3" : ""}
                        />
                    ))}
                </ReviewGrid>
            </ReviewCard>

            <ReviewCard title="Skills and Certifications" editHref={applyStepHref(3)}>
                <ReviewTags
                    label="Certifications"
                    items={certificationsOf(skills).map(({ name, provider, month, year }) => (
                        <>
                            {name} <span className="text-ink-secondary">| {provider} | {`${month} ${year}`}</span>
                        </>
                    ))}
                />
                {/* Figma 1947:13893: skills across the full row, then each work
                    link under its own type on the rows below, five to a row. */}
                <dl className="grid w-full gap-x-8 gap-y-6 md:grid-cols-2 lg:grid-cols-5">
                    <ReviewTags as="dl-item" label="Skills" items={skills.skills ?? []} className="md:col-span-2 lg:col-span-5" />
                    {links.map((link, index) => (
                        <ReviewField
                            key={`${link.type}-${index}`}
                            label={link.type}
                            value={link.url.trim()}
                            className="self-start"
                        />
                    ))}
                </dl>
            </ReviewCard>

            <ReviewCard title="Upload Documents" editHref={applyStepHref(4)}>
                <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-16">
                    <DocumentList resume={resume} resumeUrl={resumeUrl} documents={documents} />
                    <PhotoAndSignature documents={documents} />
                </div>
            </ReviewCard>
        </div>
    );
}
