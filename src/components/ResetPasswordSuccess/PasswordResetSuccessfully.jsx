import AuthSuccessCard from "@/components/CommonComponents/AuthSuccessCard";

// Shown after the new password is saved, the end of forgot-password.
export default function PasswordResetSuccessfully() {
    return <AuthSuccessCard titleId="password-reset-title" title="Password Reset Successfully!" />;
}
