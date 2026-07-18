import { useSearchParams } from "react-router-dom";

import { AuthLayout } from "@/components/layout/AuthLayout";
import { VerifyEmailForm } from "@/features/auth/components/VerifyEmailForm";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();

  return (
    <AuthLayout
      variant="verify-email"
      title={searchParams.has("token") ? "Potvrda email adrese" : "Proverite svoj inbox"}
      description="Potvrdite email kako biste aktivirali svoj nalog."
    >
      <VerifyEmailForm
        token={searchParams.get("token") ?? ""}
        initialEmail={searchParams.get("email") ?? ""}
      />
    </AuthLayout>
  );
}
