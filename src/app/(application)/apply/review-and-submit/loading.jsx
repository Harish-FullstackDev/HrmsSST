import { Shimmer } from "@/components/skeletons/SkeletonPrimitives";

// Stage content only; the header, banner and stepper come from the layout.
export default function ReviewSubmitLoading() {
    return (
        <div className="flex w-full flex-col gap-8">
            {[90, 511, 302, 524, 409].map((height, i) => (
                <div key={i} className="flex flex-col gap-4">
                    <Shimmer className="h-[22px] w-48" rounded="rounded-md" />
                    <Shimmer className="w-full" rounded="rounded-xl" style={{ height }} />
                </div>
            ))}
        </div>
    );
}
