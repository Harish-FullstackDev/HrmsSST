import { Shimmer } from "@/components/skeletons/SkeletonPrimitives";

export default function DashboardLoading() {
    return (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-zinc-50 p-8">
            <Shimmer className="h-9 w-56" />
            <Shimmer className="h-5 w-72" rounded="rounded-md" />
        </div>
    );
}
