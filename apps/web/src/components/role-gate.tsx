"use client";

import type { ReactNode } from "react";
import type { UserRole } from "@supportdesk/shared";
import { useAuthStore } from "@/store/auth-store";

type Props = {
  roles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
};

/**
 * Conditionally renders children only when the current user matches one of
 * the allowed roles. Use for in-page UI gating; for full-page access use
 * AuthGuard with the `roles` prop.
 */
export function RoleGate({ roles, children, fallback = null }: Props) {
  const user = useAuthStore((s) => s.user);
  if (!user || !roles.includes(user.role)) return <>{fallback}</>;
  return <>{children}</>;
}
