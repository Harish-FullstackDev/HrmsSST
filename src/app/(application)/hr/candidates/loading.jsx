import { Shimmer } from "@/components/skeletons/SkeletonPrimitives";

// Applicants: the search bar, then the list card.
export default function CandidatesLoading() {
    return (
        <div className="flex flex-col gap-8 px-4 pt-8 pb-8 sm:px-8">
            <Shimmer className="h-10 w-full max-w-[435px]" rounded="rounded" />
            <Shimmer className="h-[640px]" rounded="rounded-[18px]" />
        </div>
    );
}
