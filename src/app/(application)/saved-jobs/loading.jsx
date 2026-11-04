import { SkeletonJobs } from "@/components/skeletons/SkeletonPrimitives";

// Saved Jobs: header and saved job rows.
export default function SavedJobsLoading() {
    return <SkeletonJobs cards={2} />;
}
