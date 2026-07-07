import { AuthLayout } from "@/components/layout/AuthLayout";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <AuthLayout
      variant="login"
      title="Ulogujte se"
      description="Pristupite svom Job Fair Internship nalogu."
    >
      <LoginForm />
    </AuthLayout>
  );
}