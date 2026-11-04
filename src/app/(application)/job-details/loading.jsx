import { Shimmer } from "@/components/skeletons/SkeletonPrimitives";

// Shape of the job-details page: header, banner, overview + role card.
export default function JobDetailsLoading() {
    return (
        <div className="flex min-h-dvh flex-1 flex-col bg-white">
            <div className="border-b border-primary-200">
                <div className="flex w-full items-center justify-between px-4 pt-6 pb-4 sm:px-16 lg:pt-8 lg:pb-6">
                    <div className="flex gap-8">
                        <Shimmer className="h-6 w-20" rounded="rounded-md" />
                        <Shimmer className="h-6 w-24" rounded="rounded-md" />
                        <Shimmer className="h-6 w-28" rounded="rounded-md" />
                    </div>
                    <Shimmer className="h-8 w-40" rounded="rounded-md" />
                </div>
            </div>
            <Shimmer className="h-[200px] w-full" rounded="rounded-none" />
            <div className="flex w-full flex-col gap-10 px-4 pt-8 pb-16 sm:px-16 lg:flex-row lg:justify-between lg:gap-8">
                <div className="flex w-full flex-col gap-6 lg:max-w-[738px]">
                    <Shimmer className="h-6 w-40" rounded="rounded-md" />
                    <Shimmer className="h-24 w-full" rounded="rounded-md" />
                    {Array.from({ length: 5 }, (_, i) => (
                        <Shimmer key={i} className="h-14 w-full" />
                    ))}
                </div>
                <Shimmer className="h-[278px] w-full lg:w-[421px] lg:shrink-0" rounded="rounded-xl" />
            </div>
        </div>
    );
}
