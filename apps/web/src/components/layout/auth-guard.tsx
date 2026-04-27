"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { UserRole } from "@supportdesk/shared";
import { useAuthStore } from "@/store/auth-store";

type Props = {
  children: ReactNode;
  roles?: UserRole[];
  redirectTo?: string;
};

export function AuthGuard({ children, roles, redirectTo = "/dashboard" }: Props) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    if (roles && user && !roles.includes(user.role)) {
      router.replace(redirectTo);
    }
  }, [hydrated, isAuthenticated, user, roles, redirectTo, router]);

  const allowed = isAuthenticated && (!roles || (user && roles.includes(user.role)));

  if (!hydrated || !allowed) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-sm text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  return <>{children}</>;
}
