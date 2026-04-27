"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  HeadphonesIcon,
  LayoutDashboard,
  LifeBuoy,
  Ticket,
  Users,
} from "lucide-react";
import type { UserRole } from "@supportdesk/shared";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui-store";
import { useAuthStore } from "@/store/auth-store";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  roles: UserRole[];
};

const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Visão geral",
    icon: LayoutDashboard,
    exact: true,
    roles: ["ADMIN", "AGENT", "CUSTOMER"],
  },
  {
    href: "/dashboard/tickets",
    label: "Chamados",
    icon: Ticket,
    roles: ["ADMIN", "AGENT", "CUSTOMER"],
  },
  {
    href: "/dashboard/customers",
    label: "Clientes",
    icon: Users,
    roles: ["ADMIN", "AGENT"],
  },
  {
    href: "/dashboard/knowledge-base",
    label: "Base de conhecimento",
    icon: BookOpen,
    roles: ["ADMIN", "AGENT", "CUSTOMER"],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const user = useAuthStore((s) => s.user);

  const items = user ? NAV_ITEMS.filter((item) => item.roles.includes(user.role)) : [];

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex h-screen w-64 flex-col border-r bg-card transition-transform md:translate-x-0",
        !sidebarOpen && "-translate-x-full",
      )}
    >
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <HeadphonesIcon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold">SupportDesk</p>
          <p className="text-xs text-muted-foreground">Help Desk</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {items.map((item) => {
          const Icon = item.icon;
          const active = item.exact
            ? pathname === item.href
            : pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-4">
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:text-foreground"
        >
          <LifeBuoy className="h-4 w-4" />
          Documentação técnica
        </a>
      </div>
    </aside>
  );
}
