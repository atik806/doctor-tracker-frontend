"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Menu } from "lucide-react";
import { toast } from "sonner";
import { logout } from "@/lib/api";
import { useCurrentUser } from "@/lib/hooks";
import { Avatar } from "@/components/ui/Avatar";
import { Skeleton } from "@/components/ui/Skeleton";

export function Topbar({ onOpenMenu }: { onOpenMenu: () => void }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading } = useCurrentUser();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleLogout() {
    setIsSigningOut(true);
    try {
      await logout();
      // Forget all cached data so the next user starts fresh.
      queryClient.clear();
      router.replace("/login");
    } catch {
      toast.error("Couldn't sign out. Please try again.");
    } finally {
      // Next.js keeps this component's state while it's hidden (Cache Components),
      // so reset it here, or the button would still say "Signing out…" after the next login.
      setIsSigningOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-surface/85 px-4 backdrop-blur sm:px-8">
      <button
        type="button"
        onClick={onOpenMenu}
        className="-ml-1 rounded-lg p-2 text-muted hover:bg-surface-muted lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </button>

      <div className="ml-auto flex items-center gap-3">
        {isLoading && <Skeleton className="h-9 w-40 rounded-lg" />}
        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm leading-5 font-semibold">{user.name}</p>
              <p className="text-xs text-muted capitalize">{user.role}</p>
            </div>
            <Avatar name={user.name} />
          </div>
        )}

        <span className="mx-1 h-6 w-px bg-border" aria-hidden />

        <button
          type="button"
          onClick={handleLogout}
          disabled={isSigningOut}
          className="flex items-center gap-2 rounded-[10px] px-2.5 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-muted hover:text-foreground disabled:opacity-60"
        >
          <LogOut className="size-4" />
          <span className="hidden sm:inline">{isSigningOut ? "Signing out…" : "Sign out"}</span>
        </button>
      </div>
    </header>
  );
}
