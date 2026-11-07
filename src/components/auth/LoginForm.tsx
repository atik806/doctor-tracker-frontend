"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight, CircleAlert, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { ApiError, errorMessage, login } from "@/lib/api";
import { isValidEmail } from "@/lib/validation";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";

const DEMO_ACCOUNTS = [
  {
    role: "Admin",
    email: "admin@doctortracker.com",
    password: "Admin@123",
    note: "Full access",
    icon: ShieldCheck,
    badgeClass: "bg-teal-100 text-teal-700",
  },
  {
    role: "Staff",
    email: "staff@doctortracker.com",
    password: "Staff@123",
    note: "Read-only",
    icon: UserRound,
    badgeClass: "bg-slate-100 text-slate-600",
  },
];

interface LoginErrors {
  email?: string;
  password?: string;
}

function validate(email: string, password: string) {
  const errors: LoginErrors = {};
  if (!isValidEmail(email)) errors.email = "Enter a valid email address";
  if (!password) errors.password = "Enter your password";
  return errors;
}

/** Only allow redirects to pages on this site (stops "?next=https://evil.com"). */
function safeNextPath(next: string | null) {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/dashboard";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const newErrors = validate(email, password);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      const user = await login(email, password);
      queryClient.setQueryData(["me"], user);
      // Next.js keeps this form's state while it's hidden (Cache Components). Clear the password
      // so it isn't still sitting in the form when someone comes back to /login after signing out.
      setPassword("");
      router.replace(safeNextPath(searchParams.get("next")));
    } catch (error) {
      if (error instanceof ApiError && error.errors) setErrors(error.errors);
      setFormError(errorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  function fillDemoAccount(account: (typeof DEMO_ACCOUNTS)[number]) {
    setEmail(account.email);
    setPassword(account.password);
    setErrors({});
    setFormError("");
  }

  const passwordToggle = (
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      aria-label={showPassword ? "Hide password" : "Show password"}
      className="rounded-md p-1.5 text-subtle transition-colors hover:bg-surface-muted hover:text-foreground"
    >
      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
    </button>
  );

  return (
    <>
      <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-5">
        {formError && (
          <div role="alert" className="flex items-start gap-2.5 rounded-[10px] bg-danger-soft px-3.5 py-3 text-sm text-rose-700">
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            {formError}
          </div>
        )}

        <TextField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@hospital.com"
          icon={Mail}
          className="h-11"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={errors.email}
          autoFocus
        />

        <TextField
          label="Password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          placeholder="Enter your password"
          icon={LockKeyhole}
          trailing={passwordToggle}
          className="h-11"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
        />

        <Button type="submit" className="h-11 w-full" isLoading={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Sign in"}
          {!isSubmitting && <ArrowRight className="size-4" />}
        </Button>
      </form>

      <div className="mt-7 flex items-center gap-3" aria-hidden>
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium text-subtle">or try a demo account</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {DEMO_ACCOUNTS.map((account) => {
          const isSelected = email === account.email;
          return (
            <button
              key={account.email}
              type="button"
              onClick={() => fillDemoAccount(account)}
              aria-pressed={isSelected}
              aria-label={`Use the ${account.role} demo account (${account.note})`}
              className={`flex items-center gap-2.5 rounded-xl border p-3 text-left transition-colors ${
                isSelected
                  ? "border-primary bg-primary-soft"
                  : "border-border bg-surface hover:border-border-strong hover:bg-surface-muted"
              }`}
            >
              <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${account.badgeClass}`}>
                <account.icon className="size-4" strokeWidth={2} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{account.role}</span>
                <span className="block truncate text-xs text-muted">{account.note}</span>
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
