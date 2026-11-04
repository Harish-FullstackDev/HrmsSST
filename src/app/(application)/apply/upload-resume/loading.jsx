import { Shimmer } from "@/components/skeletons/SkeletonPrimitives";

// Stage content only; the header, banner and stepper come from the layout.
export default function UploadResumeLoading() {
    return (
        // Same column as the upload card (755 of the 755 / 533 split).
        <div className="flex w-full flex-col gap-6 rounded-xl bg-white p-6 lg:w-[calc((100%-24px)*755/1288)]">
            <div className="flex flex-col gap-2">
                <Shimmer className="h-6 w-48" rounded="rounded-md" />
                <Shimmer className="h-5 w-80 max-w-full" rounded="rounded-md" />
            </div>
            <Shimmer className="h-[218px] w-full" rounded="rounded-xl" />
        </div>
    );
}
