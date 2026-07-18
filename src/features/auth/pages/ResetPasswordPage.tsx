import { useSearchParams } from "react-router-dom";

import { AuthLayout } from "@/components/layout/AuthLayout";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token") ?? "";

  return (
    <AuthLayout
      variant="reset-password"
      title="Postavi novu lozinku"
      description="Unesi novu lozinku za svoj nalog."
    >
      <ResetPasswordForm token={token} />
    </AuthLayout>
  );
}