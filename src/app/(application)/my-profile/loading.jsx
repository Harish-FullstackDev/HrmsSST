import { SkeletonJobs } from "@/components/skeletons/SkeletonPrimitives";

// My Profile: identity header and application cards.
export default function MyProfileLoading() {
    return <SkeletonJobs cards={2} />;
}
