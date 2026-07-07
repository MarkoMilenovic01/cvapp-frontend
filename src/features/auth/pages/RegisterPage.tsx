import { AuthLayout } from "@/components/layout/AuthLayout";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthLayout
      variant="register"
      title="Kreirajte nalog"
      description="Napravite Job Fair Internship nalog za par sekundi."
    >
      <RegisterForm />
    </AuthLayout>
  );
}