import { Shimmer } from "@/components/skeletons/SkeletonPrimitives";

// Stage content only; the header, banner and stepper come from the layout.
export default function PersonalDetailsLoading() {
    return (
        <div className="grid w-full gap-x-5 gap-y-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 11 }, (_, i) => (
                <div key={i} className="flex h-[97px] flex-col gap-3">
                    <Shimmer className="h-[22px] w-32" rounded="rounded-md" />
                    <Shimmer className="h-[42px] w-full" />
                </div>
            ))}
        </div>
    );
}
