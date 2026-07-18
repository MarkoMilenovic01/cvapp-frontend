import { AuthLayout } from "@/components/layout/AuthLayout";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout
      variant="forgot-password"
      title="Zaboravljena lozinka"
      description="Unesite email i poslaćemo vam link za reset lozinke."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}