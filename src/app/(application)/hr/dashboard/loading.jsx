import { Shimmer } from "@/components/skeletons/SkeletonPrimitives";

// HR dashboard: toolbar, five metric cards, then the table and side cards.
export default function HrDashboardLoading() {
    return (
        <div className="flex flex-col gap-8 px-4 pt-8 pb-8 sm:px-8 lg:group-data-[sidebar=open]/hr:pl-4">
            <Shimmer className="h-10 w-full max-w-md" rounded="rounded" />
            <div className="grid grid-cols-[repeat(auto-fit,minmax(214px,1fr))] gap-4">
                {Array.from({ length: 5 }, (_, i) => (
                    <Shimmer key={i} className="h-[180px]" rounded="rounded-xl" />
                ))}
            </div>
            <Shimmer className="h-[443px]" rounded="rounded-xl" />
        </div>
    );
}
