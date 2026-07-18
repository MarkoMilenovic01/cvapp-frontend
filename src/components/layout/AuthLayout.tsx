// AuthLayout.tsx
import type { ReactNode } from "react";

import jobFairLogoWhite from "@/assets/jobfairnis-white.svg";
import bestLogoWhite from "@/assets/bestnis-white.svg";
import jobFairLogo from "@/assets/jobfair.svg";
import bestLogo from "@/assets/bestnis.svg";

type AuthLayoutVariant =
  | "login"
  | "register"
  | "forgot-password"
  | "reset-password"
  | "verify-email";

type AuthLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
  variant?: AuthLayoutVariant;
};

type StatItem = {
  value: string;
  label: string;
};

type AuthContent = {
  eyebrow: string;
  headline: ReactNode;
  description: string;
  stats?: StatItem[];
  linkLabel?: string;
  linkHref?: string;
};

const AUTH_CONTENT: Record<AuthLayoutVariant, AuthContent> = {
  login: {
    eyebrow: "Edicija 26 · Job Fair Internship",
    headline: (
      <>
        Nastavi svoj put
        <br />
        ka prvoj praksi.
      </>
    ),
    description:
      "Prijavi se i nastavi da gradiš svoj CV profil, istražuješ kompanije i pratiš prilike otvorene za studente.",
    stats: [
      {
        value: "50+",
        label: "Kompanija",
      },
      {
        value: "3",
        label: "Dana",
      },
      {
        value: "CV",
        label: "Profil",
      },
    ],
    linkLabel: "Zvanični Job Fair sajt",
    linkHref: "https://jobfairnis.rs",
  },

  register: {
    eyebrow: "Tvoj profil počinje ovde",
    headline: (
      <>
        Predstavi se
        <br />
        kompanijama na pravi način.
      </>
    ),
    description:
      "Kreiraj nalog, popuni svoj CV profil i učini svoje veštine vidljivim kompanijama koje traže praktikante i mlade talente.",
    stats: [
      {
        value: "50+",
        label: "Kompanija",
      },
      {
        value: "CV",
        label: "Profil",
      },
      {
        value: "1",
        label: "Prilika",
      },
    ],
    linkLabel: "Saznaj više o Job Fair-u",
    linkHref: "https://jobfairnis.rs",
  },

  "forgot-password": {
    eyebrow: "Povratak na nalog",
    headline: (
      <>
        Hajde da ti
        <br />
        vratimo pristup.
      </>
    ),
    description:
      "Unesi email adresu povezanu sa nalogom. Poslaćemo ti uputstvo za bezbedno resetovanje lozinke.",
  },

  "reset-password": {
    eyebrow: "Nova lozinka",
    headline: (
      <>
        Još jedan korak
        <br />
        i ponovo si unutra.
      </>
    ),
    description:
      "Izaberi novu lozinku za svoj nalog. Nakon uspešnog resetovanja možeš odmah da se prijaviš.",
  },
  "verify-email": {
    eyebrow: "Aktivacija naloga",
    headline: (
      <>
        Još samo potvrdi
        <br />
        svoju email adresu.
      </>
    ),
    description:
      "Otvorite link iz poruke koju smo poslali. Ako poruka nije stigla, možete odmah zatražiti novu.",
  },
};

export function AuthLayout({
  title,
  description,
  children,
  variant = "login",
}: AuthLayoutProps) {
  const content = AUTH_CONTENT[variant];

  const isRecoveryFlow =
    variant === "forgot-password" ||
    variant === "reset-password" ||
    variant === "verify-email";

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-[#075486] text-slate-900">
      <style>{`
        @keyframes authFadeUp {
          from {
            opacity: 0;
            transform: translateY(14px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .auth-reveal {
          opacity: 0;
          animation: authFadeUp 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .auth-form-scope :is(input, textarea, select):focus {
          outline: none;
          border-color: #f5b301;
          box-shadow: 0 0 0 4px rgba(245, 179, 1, 0.22);
        }

        .auth-form-scope :is(button, a):focus-visible {
          outline: none;
          box-shadow: 0 0 0 4px rgba(245, 179, 1, 0.28);
        }

        @media (prefers-reduced-motion: reduce) {
          .auth-reveal {
            opacity: 1;
            animation: none;
          }
        }
      `}</style>

      {/* Background */}
      <div className="absolute inset-0 -z-30 bg-[radial-gradient(circle_at_18%_18%,rgba(34,145,217,0.9),transparent_32%),radial-gradient(circle_at_85%_80%,rgba(3,45,74,0.85),transparent_36%),linear-gradient(135deg,#1375bc_0%,#075486_46%,#032d4a_100%)]" />

      <div className="absolute -left-40 top-10 -z-20 h-[34rem] w-[34rem] rounded-full bg-white/10 blur-3xl" />
      <div className="absolute right-[-10rem] top-24 -z-20 h-[32rem] w-[32rem] rounded-full bg-[#1ea7ff]/15 blur-3xl" />
      <div className="absolute bottom-[-14rem] left-1/3 -z-20 h-[34rem] w-[34rem] rounded-full bg-[#f5b301]/10 blur-3xl" />

      {/* Soft diagonal shape */}
      <div className="absolute left-[-12rem] top-[-8rem] -z-10 h-[42rem] w-[26rem] rotate-12 rounded-[5rem] bg-white/[0.045] blur-sm" />

      {/* Big subtle edition watermark */}
      {!isRecoveryFlow && (
        <div className="pointer-events-none absolute bottom-[-4rem] left-[7%] -z-10 hidden select-none font-['Space_Grotesk',sans-serif] text-[18rem] font-bold leading-none tracking-[-0.08em] text-white/[0.035] lg:block">
          26
        </div>
      )}

      <section className="flex min-h-screen items-center justify-center px-5 py-16 sm:px-8">
        <div className="grid w-full max-w-[1120px] items-center gap-14 lg:grid-cols-[1fr_430px]">
          {/* Left side */}
          <div className="hidden lg:block">
            {/* Logos */}
            <div
              className="auth-reveal mb-10 flex items-center gap-6"
              style={{ animationDelay: "60ms" }}
            >
              <img
                src={jobFairLogoWhite}
                alt="Job Fair Internship 26"
                className="h-12 w-auto"
              />

              <div className="h-10 w-px bg-white/20" />

              <img
                src={bestLogoWhite}
                alt="BEST Niš"
                className="h-[3.75rem] w-auto opacity-95"
              />
            </div>

            {/* Yellow separator */}
            <div
              className="auth-reveal mb-8 h-[2px] w-24 rounded-full bg-[#f5b301]"
              style={{ animationDelay: "120ms" }}
            />

            <p
              className="auth-reveal mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-white/55"
              style={{ animationDelay: "150ms" }}
            >
              {content.eyebrow}
            </p>

            <h2
              className={[
                "auth-reveal max-w-[620px] font-['Space_Grotesk',sans-serif] font-bold leading-[1.03] tracking-[-0.04em] text-white",
                isRecoveryFlow ? "text-5xl" : "text-6xl",
              ].join(" ")}
              style={{ animationDelay: "190ms" }}
            >
              {content.headline}
            </h2>

            <p
              className="auth-reveal mt-6 max-w-[500px] text-base leading-7 text-white/72"
              style={{ animationDelay: "260ms" }}
            >
              {content.description}
            </p>

            {/* Stats - not shown on recovery pages */}
            {content.stats && (
              <div
                className="auth-reveal mt-10 grid max-w-[520px] grid-cols-3 gap-4"
                style={{ animationDelay: "340ms" }}
              >
                {content.stats.map((stat) => (
                  <div
                    key={`${stat.value}-${stat.label}`}
                    className="rounded-2xl border border-white/12 bg-white/[0.055] px-5 py-4 shadow-xl shadow-black/10 backdrop-blur"
                  >
                    <div className="mb-3 h-1 w-8 rounded-full bg-[#f5b301]" />

                    <p className="font-['Space_Grotesk',sans-serif] text-3xl font-bold tracking-[-0.04em] text-white">
                      {stat.value}
                    </p>

                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Recovery reassurance instead of marketing stats */}
            {isRecoveryFlow && (
              <div
                className="auth-reveal mt-9 max-w-[500px] rounded-3xl border border-white/12 bg-white/[0.055] p-6 shadow-xl shadow-black/10 backdrop-blur"
                style={{ animationDelay: "340ms" }}
              >
                <p className="text-sm font-semibold text-white">
                  Mirno, ovo se lako rešava.
                </p>

                <p className="mt-2 text-sm leading-6 text-white/65">
                  {variant === "forgot-password"
                    ? "Ako postoji nalog sa tom email adresom, dobićeš link za resetovanje lozinke. Iz bezbednosnih razloga, ne prikazujemo da li je email registrovan."
                    : variant === "reset-password"
                      ? "Postavi novu lozinku i nakon toga se prijavi ponovo. Izaberi lozinku koju ne koristiš na drugim mestima."
                      : "Verifikacioni link je vremenski ograničen. Ako je istekao, zatraži novu poruku koristeći istu email adresu."}
                </p>
              </div>
            )}

            {content.linkHref && content.linkLabel && (
              <a
                href={content.linkHref}
                target="_blank"
                rel="noreferrer"
                className="auth-reveal mt-7 inline-flex items-center gap-2 text-sm font-semibold text-white/70 transition hover:text-[#f5b301]"
                style={{ animationDelay: "420ms" }}
              >
                {content.linkLabel}
                <span aria-hidden>→</span>
              </a>
            )}
          </div>

          {/* Form card */}
          <div
            className="auth-reveal auth-form-scope overflow-hidden rounded-[2rem] bg-white p-8 shadow-2xl shadow-black/25 ring-1 ring-white/60 sm:p-10"
            style={{ animationDelay: "180ms" }}
          >
            {/* Mobile-only branding */}
            <div className="mb-8 flex justify-center lg:hidden">
              <div className="flex items-center gap-5 px-2 py-1">
                <img
                  src={jobFairLogo}
                  alt="Job Fair Internship 26"
                  className="h-9 w-auto"
                />

                <div className="h-8 w-px bg-slate-200" />

                <img src={bestLogo} alt="BEST Niš" className="h-10 w-auto" />
              </div>
            </div>

            <div className="mb-7 text-center">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#1375bc]">
                {isRecoveryFlow ? "Podešavanje pristupa" : "Studentska platforma"}
              </p>

              <h1 className="font-['Space_Grotesk',sans-serif] text-2xl font-bold text-slate-950">
                {title}
              </h1>

              <p className="mt-1 text-sm text-slate-500">{description}</p>
            </div>

            {children}
          </div>
        </div>
      </section>
    </main>
  );
}
