import { SkeletonLogin } from "@/components/skeletons/SkeletonPrimitives";

export default function VerifyEmailLoading() {
    return <SkeletonLogin fields={1} />;
}
