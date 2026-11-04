import { Shimmer } from "@/components/skeletons/SkeletonPrimitives";

// Stage content only; the header, banner and stepper come from the layout.
export default function UploadDocumentsLoading() {
    return (
        <div className="flex w-full flex-col gap-6 rounded-xl bg-white p-6">
            {Array.from({ length: 7 }, (_, i) => (
                <div key={i} className="flex flex-col gap-3">
                    <Shimmer className="h-[22px] w-40" rounded="rounded-md" />
                    <Shimmer className="h-[42px] w-full lg:w-[480px]" />
                </div>
            ))}
        </div>
    );
}
