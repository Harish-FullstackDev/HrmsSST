import { SkeletonJobs } from "@/components/skeletons/SkeletonPrimitives";

// A job: header, banner, then the body.
export default function JobLoading() {
    return <SkeletonJobs banner cards={2} />;
}
