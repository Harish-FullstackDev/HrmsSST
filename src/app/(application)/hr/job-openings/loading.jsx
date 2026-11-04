import { Shimmer } from "@/components/skeletons/SkeletonPrimitives";

// Job Openings: tabs, the title row, then the table.
export default function JobOpeningsLoading() {
    return (
        <div className="flex flex-col gap-8 px-4 pt-8 pb-8 sm:px-8">
            <Shimmer className="h-[34px] w-full max-w-xl" rounded="rounded" />
            <Shimmer className="h-10 w-full max-w-sm" rounded="rounded" />
            <Shimmer className="h-[520px]" rounded="rounded" />
        </div>
    );
}
