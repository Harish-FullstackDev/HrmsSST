import { Shimmer } from "@/components/skeletons/SkeletonPrimitives";

// Stage content only; the header, banner and stepper come from the layout.
export default function SkillsCertificationsLoading() {
    return (
        <div className="flex w-full flex-col gap-6">
            <Shimmer className="h-[22px] w-24" rounded="rounded-md" />
            <Shimmer className="h-[42px] w-full max-w-[417px]" />
            <Shimmer className="h-[235px] w-full" rounded="rounded-[10px]" />
        </div>
    );
}
