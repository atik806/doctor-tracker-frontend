import Link from "next/link";
import { Stethoscope } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-primary">
        <Stethoscope className="size-7" strokeWidth={1.75} />
      </div>
      <p className="text-sm font-semibold text-primary">404</p>
      <h1 className="mt-1 text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 inline-flex h-10 items-center rounded-[10px] bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover"
      >
        Back to dashboard
      </Link>
    </main>
  );
}
