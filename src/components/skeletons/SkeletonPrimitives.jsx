/**
 * Primitive skeleton atoms shared by every route's loading.jsx.
 * Zero dependencies beyond React and Tailwind CSS.
 */

// A single shimmering block. Pass width/height via className.
export function Shimmer({ className = "", rounded = "rounded-lg", style }) {
    return (
        <div
            className={`relative overflow-hidden bg-slate-100 ${rounded} ${className}`}
            style={style}
            aria-hidden="true"
        >
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-white/70 to-transparent" />
        </div>
    );
}

// Label + input pair, matching the auth form fields.
export function SkeletonField({ inputClassName = "h-14" }) {
    return (
        <div className="flex flex-col gap-3">
            <Shimmer className="h-4 w-32" rounded="rounded-md" />
            <Shimmer className={`w-full ${inputClassName}`} rounded="rounded-[10px]" />
        </div>
    );
}

// Shape of the job pages (components/Jobs): header bar, an optional banner
// (a job), then a column of job cards.
export function SkeletonJobs({ banner = false, cards = 3 }) {
    return (
        <div className="flex min-h-dvh flex-1 flex-col bg-white">
            <div className="border-b border-primary-200">
                <div className="flex w-full items-center justify-between px-4 pt-6 pb-4 sm:px-16 lg:pt-8 lg:pb-6">
                    <div className="flex gap-8">
                        <Shimmer className="h-6 w-20" rounded="rounded-md" />
                        <Shimmer className="h-6 w-24" rounded="rounded-md" />
                        <Shimmer className="h-6 w-24" rounded="rounded-md" />
                        <Shimmer className="h-6 w-28" rounded="rounded-md" />
                    </div>
                    <Shimmer className="h-8 w-40" rounded="rounded-md" />
                </div>
            </div>
            {banner && <Shimmer className="h-[220px] w-full" rounded="rounded-none" />}
            <div className="flex w-full flex-col gap-7 px-4 py-10 sm:px-16 sm:py-16">
                {Array.from({ length: cards }, (_, i) => (
                    <Shimmer key={i} className="h-[188px] w-full" rounded="rounded-xl" />
                ))}
            </div>
        </div>
    );
}

// Shape of the sign-in / sign-up pages: header bar, headline on the left,
// card on the right, avatar strip at the bottom.
export function SkeletonLogin({ fields = 2 }) {
    return (
        <div className="flex min-h-dvh flex-1 flex-col bg-white">
            <div className="border-b border-primary-200">
                <div className="flex w-full items-center justify-between px-4 pt-6 pb-4 sm:px-16 lg:pt-8 lg:pb-6">
                    <div className="flex gap-8">
                        <Shimmer className="h-6 w-24" rounded="rounded-md" />
                        <Shimmer className="h-6 w-28" rounded="rounded-md" />
                    </div>
                    <Shimmer className="h-8 w-40" rounded="rounded-md" />
                </div>
            </div>
            <div className="flex w-full flex-1 flex-col px-4 pt-10 pb-10 sm:px-16 lg:pt-[51px] lg:pb-[68px]">
                <div className="flex flex-col gap-10 lg:flex-row lg:justify-between xl:pr-[72px]">
                    <div className="flex flex-col gap-3 lg:w-[462px]">
                        <Shimmer className="h-12 w-full" />
                        <Shimmer className="h-12 w-1/3" />
                        <Shimmer className="mt-5 h-5 w-11/12" rounded="rounded-md" />
                        <Shimmer className="h-5 w-1/2" rounded="rounded-md" />
                    </div>
                    <div className="flex w-full flex-col gap-6 rounded-2xl border border-[rgba(229,231,235,0.8)] p-8 lg:w-[520px]">
                        <Shimmer className="h-4 w-48" rounded="rounded-md" />
                        <Shimmer className="h-10 w-full" rounded="rounded-md" />
                        {Array.from({ length: fields }, (_, i) => (
                            <SkeletonField key={i} inputClassName="h-[46px]" />
                        ))}
                        <Shimmer className="h-10 w-full" rounded="rounded-lg" />
                    </div>
                </div>
                <div className="flex flex-1 items-end pt-10">
                    <Shimmer className="h-6 w-80" rounded="rounded-md" />
                </div>
            </div>
        </div>
    );
}
