import type { Metadata } from "next";
import { Suspense } from "react";
import { BarChart3, ShieldCheck, Stethoscope } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { LoginForm } from "@/components/auth/LoginForm";
import { LoginShowcase } from "@/components/auth/LoginShowcase";

export const metadata: Metadata = { title: "Sign in" };

const HIGHLIGHTS = [
  { icon: Stethoscope, title: "Doctors & patients", text: "One place for your whole team" },
  { icon: BarChart3, title: "Live analytics", text: "Admissions and workload at a glance" },
  { icon: ShieldCheck, title: "Secure access", text: "Encrypted sessions, admin and staff roles" },
];

function BrandPanel() {
  return (
    <section className="login-brand relative hidden overflow-hidden px-12 py-10 text-white lg:flex lg:flex-col xl:px-16">
      {/* Soft light behind the preview */}
      <div className="absolute top-1/3 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-teal-300/20 blur-3xl" aria-hidden />

      <div className="relative">
        <Logo inverted />
      </div>

      <div className="relative my-auto py-12">
        <h1 className="max-w-md text-4xl leading-[1.15] font-semibold tracking-tight xl:text-[2.75rem]">
          Clear records.
          <br />
          <span className="text-teal-200">Better care.</span>
        </h1>
        <p className="mt-4 max-w-md text-base leading-7 text-teal-50/80">
          A calm, fast workspace for your clinic team: doctors, patients and the numbers behind them.
        </p>

        <div className="mt-14">
          <LoginShowcase />
        </div>
      </div>

      <ul className="relative grid grid-cols-3 gap-6 border-t border-white/15 pt-6">
        {HIGHLIGHTS.map((item) => (
          <li key={item.title}>
            <item.icon className="size-5 text-teal-200" strokeWidth={1.75} />
            <p className="mt-2 text-sm font-semibold">{item.title}</p>
            <p className="mt-0.5 text-xs leading-5 text-teal-50/70">{item.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <BrandPanel />

      <section className="login-form-bg relative flex flex-col items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo />
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6 shadow-pop sm:p-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">
              <ShieldCheck className="size-3.5" />
              Secure admin portal
            </span>
            <h2 className="mt-4 text-2xl font-semibold tracking-tight">Welcome back</h2>
            <p className="mt-1.5 text-sm text-muted">Sign in to manage doctors, patients and reports.</p>

            <Suspense>
              <LoginForm />
            </Suspense>
          </div>

          <p className="mt-6 text-center text-xs text-subtle">
            Sessions are encrypted and sign you out automatically after 8 hours.
          </p>
        </div>
      </section>
    </main>
  );
}
