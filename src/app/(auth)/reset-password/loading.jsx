import { SkeletonLogin } from "@/components/skeletons/SkeletonPrimitives";

export default function ResetPasswordLoading() {
    return <SkeletonLogin fields={2} />;
}
