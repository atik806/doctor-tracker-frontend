"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Stethoscope, UsersRound, X } from "lucide-react";
import { Logo } from "./Logo";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/doctors", label: "Doctors", icon: Stethoscope },
  { href: "/patients", label: "Patients", icon: UsersRound },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Fixed on large screens; a slide-in drawer below that. */
export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Dark overlay behind the drawer on mobile */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-slate-900/40 transition-opacity lg:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden
      />

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-surface transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-subtle hover:bg-surface-muted lg:hidden"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav aria-label="Main" className="flex-1 px-3 py-4">
          <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-subtle uppercase">Menu</p>
          {/* The current path is only known in the browser, so the highlighted links stream in. */}
          <Suspense fallback={<NavLinks activePath="" onNavigate={onClose} />}>
            <ActiveNavLinks onNavigate={onClose} />
          </Suspense>
        </nav>
      </aside>
    </>
  );
}

function ActiveNavLinks({ onNavigate }: { onNavigate: () => void }) {
  const pathname = usePathname();
  return <NavLinks activePath={pathname} onNavigate={onNavigate} />;
}

function NavLinks({ activePath, onNavigate }: { activePath: string; onNavigate: () => void }) {
  return (
    <ul className="space-y-1">
      {NAV_ITEMS.map((item) => {
        const isActive = activePath === item.href || activePath.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={`flex items-center gap-3 rounded-[10px] px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive ? "bg-primary-soft text-primary" : "text-muted hover:bg-surface-muted hover:text-foreground"
              }`}
            >
              <Icon className="size-[18px]" strokeWidth={1.75} />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
