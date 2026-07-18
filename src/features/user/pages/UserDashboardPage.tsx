import { useState } from "react";
import type { ComponentType, SVGProps } from "react";

import jobFairLogoWhite from "@/assets/jobfairnis-white.svg";
import bestLogoWhite from "@/assets/bestnis-white.svg";

import { useAuth } from "@/context/AuthContext";

import { UserCVSection } from "@/features/user/components/UserCVSection";
import UserJobsSection from "@/features/user/components/UserJobSection";
import UserApplicationsSection from "@/features/user/components/UserApplicationsSection";

type DashboardTab = "cv" | "jobs" | "applications";

type IconProps = SVGProps<SVGSVGElement>;

const tabs: Array<{
  id: DashboardTab;
  label: string;
  description: string;
  action: string;
  icon: ComponentType<IconProps>;
}> = [
  {
    id: "cv",
    label: "Moj CV",
    description: "Lični podaci, obrazovanje, iskustvo i veštine.",
    action: "Uredi profil",
    icon: CvIcon,
  },
  {
    id: "jobs",
    label: "Prakse",
    description: "Pregled otvorenih pozicija za studente.",
    action: "Pretraži prakse",
    icon: BriefcaseIcon,
  },
  {
    id: "applications",
    label: "Moje prijave",
    description: "Status svih prijava koje si poslao.",
    action: "Prati status",
    icon: ApplicationsIcon,
  },
];

export default function UserDashboardPage() {
  const { logout } = useAuth();

  const [activeTab, setActiveTab] = useState<DashboardTab>("cv");

  return (
    <main className="min-h-screen bg-[#eef5fb] text-slate-950">
      <section className="relative isolate overflow-hidden bg-[#075486] text-white">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.16),transparent_28%),radial-gradient(circle_at_82%_8%,rgba(19,117,188,0.42),transparent_30%),linear-gradient(135deg,#1375bc_0%,#075486_48%,#02253d_100%)]"
        />


        <div className="relative mx-auto flex w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-6">
              <img
                src={jobFairLogoWhite}
                alt="Job Fair Internship"
                className="h-9 w-auto"
              />

              <div className="hidden h-8 w-px bg-white/20 sm:block" />

              <img
                src={bestLogoWhite}
                alt="BEST Niš"
                className="h-9 w-auto"
              />
            </div>

            <button
              type="button"
              onClick={logout}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 text-sm font-semibold text-white shadow-sm backdrop-blur transition hover:border-white/30 hover:bg-white/15"
            >
              <LogoutIcon className="h-4 w-4" />
              Odjavi se
            </button>
          </header>

          <div className="pb-14 pt-10 lg:pb-16 lg:pt-12">
            <div className="mb-5 h-1 w-20 rounded-full bg-[#f7c51e]" />

            <p className="text-xs font-semibold uppercase tracking-[0.36em] text-white/55">
              Job Fair Internship
            </p>

            <h1 className="mt-4 max-w-3xl font-['Space_Grotesk',sans-serif] text-4xl font-bold leading-[1.02] tracking-[-0.055em] text-white sm:text-5xl">
              Korisnički dashboard
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/68">
              Uredi svoj CV, pronađi prakse i prati svoje prijave.
            </p>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-8 w-full max-w-7xl px-5 sm:px-8 lg:px-10">
     <nav
  aria-label="Dashboard navigacija"
  className="rounded-[1.6rem] border border-white/80 bg-white/95 p-2 shadow-xl shadow-[#075486]/10 backdrop-blur"
>
  <div className="grid gap-2 md:grid-cols-3">
    {tabs.map((tab) => {
      const isActive = activeTab === tab.id;
      const Icon = tab.icon;

      return (
        <button
          key={tab.id}
          type="button"
          onClick={() => setActiveTab(tab.id)}
          aria-current={isActive ? "page" : undefined}
          className={[
            "group relative flex min-h-[92px] cursor-pointer items-center gap-4 rounded-[1.2rem] px-4 py-3 text-left transition active:scale-[0.99]",
            isActive
              ? "bg-[#1375bc] text-white shadow-lg shadow-[#1375bc]/20"
              : "bg-transparent text-slate-700 hover:bg-slate-50 hover:text-[#1375bc]",
          ].join(" ")}
        >
          {isActive && (
            <span className="absolute left-4 top-0 h-1 w-14 rounded-b-full bg-[#f7c51e]" />
          )}

          <span
            className={[
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition",
              isActive
                ? "bg-white/15 text-white"
                : "bg-slate-100 text-slate-500 group-hover:bg-[#1375bc]/10 group-hover:text-[#1375bc]",
            ].join(" ")}
          >
            <Icon className="h-5 w-5" />
          </span>

          <span className="min-w-0">
            <span className="block text-base font-bold">{tab.label}</span>

            <span
              className={[
                "mt-1 block text-xs leading-5",
                isActive ? "text-white/70" : "text-slate-500",
              ].join(" ")}
            >
              {tab.description}
            </span>

            <span
              className={[
                "mt-2 inline-flex items-center gap-1 text-xs font-bold transition",
                isActive
                  ? "text-[#f7c51e]"
                  : "text-slate-400 group-hover:text-[#1375bc]",
              ].join(" ")}
            >
              {tab.action}
              <span className="transition group-hover:translate-x-0.5">→</span>
            </span>
          </span>
        </button>
      );
    })}
  </div>
</nav>
      </section>

      <section className="mx-auto w-full max-w-7xl px-5 pb-10 pt-6 sm:px-8 lg:px-10">
        {activeTab === "cv" && <UserCVSection />}

        {activeTab === "jobs" && <UserJobsSection />}

        {activeTab === "applications" && <UserApplicationsSection />}
      </section>
    </main>
  );
}

function CvIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M7 3h7l4 4v14H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6" />
      <path d="M9 17h4" />
      <path d="M9 9h1" />
    </svg>
  );
}

function BriefcaseIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
      <path d="M4 8h16a1 1 0 0 1 1 1v9a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V9a1 1 0 0 1 1-1Z" />
      <path d="M3 13h18" />
      <path d="M10 13v2h4v-2" />
    </svg>
  );
}

function ApplicationsIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <path d="m3 6 1 1 2-2" />
      <path d="m3 12 1 1 2-2" />
      <path d="m3 18 1 1 2-2" />
    </svg>
  );
}

function LogoutIcon(props: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M10 17 15 12 10 7" />
      <path d="M15 12H3" />
      <path d="M21 4v16" />
    </svg>
  );
}