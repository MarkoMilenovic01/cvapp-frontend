import { useEffect } from "react";
import {
  CheckCircle2,
  CircleAlert,
  LoaderCircle,
  X,
} from "lucide-react";

export function CompanyLoadingSpinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <LoaderCircle
      className={`${className} shrink-0 animate-spin`}
      aria-hidden="true"
    />
  );
}

export function CompanyStatusToast({
  message,
  error,
  onClose,
}: {
  message: string;
  error: string;
  onClose: () => void;
}) {
  const text = error || message;
  const success = Boolean(message && !error);

  useEffect(() => {
    if (!text) return;

    const timeout = window.setTimeout(onClose, 4500);
    return () => window.clearTimeout(timeout);
  }, [onClose, text]);

  if (!text) return null;

  return (
    <div
      role={success ? "status" : "alert"}
      aria-live={success ? "polite" : "assertive"}
      className={[
        "fixed bottom-5 right-5 z-50 flex w-[calc(100%-2.5rem)] max-w-sm items-start gap-3 rounded-2xl border bg-white p-4 shadow-2xl",
        success ? "border-emerald-200" : "border-red-200",
      ].join(" ")}
    >
      <span
        className={[
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
          success
            ? "bg-emerald-50 text-emerald-600"
            : "bg-red-50 text-red-600",
        ].join(" ")}
      >
        {success ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : (
          <CircleAlert className="h-5 w-5" />
        )}
      </span>

      <div className="min-w-0 flex-1 pt-0.5">
        <p className="text-sm font-bold text-slate-900">
          {success ? "Uspešno" : "Došlo je do greške"}
        </p>
        <p className="mt-1 text-sm leading-5 text-slate-600">{text}</p>
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="Zatvori obaveštenje"
        className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
