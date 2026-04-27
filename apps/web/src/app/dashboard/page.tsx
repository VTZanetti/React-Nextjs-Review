"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Flame,
  Inbox,
  PlayCircle,
  Ticket as TicketIcon,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { PriorityBadge } from "@/components/priority-badge";
import { SlaIndicator } from "@/components/sla-indicator";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { dashboardService } from "@/services/dashboard-service";
import { formatDateTime } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { NewTicketButton } from "@/components/new-ticket-button";

const METRICS = [
  { key: "total", label: "Total de chamados", icon: TicketIcon, tone: "default" as const },
  { key: "open", label: "Abertos", icon: Inbox, tone: "info" as const },
  { key: "inProgress", label: "Em atendimento", icon: PlayCircle, tone: "warning" as const },
  { key: "resolved", label: "Resolvidos", icon: CheckCircle2, tone: "success" as const },
  { key: "critical", label: "Críticos", icon: Flame, tone: "destructive" as const },
  { key: "slaBreached", label: "SLA vencido", icon: AlertTriangle, tone: "destructive" as const },
];

const TONE_CLASSES: Record<string, string> = {
  default: "bg-primary/10 text-primary",
  info: "bg-blue-100 text-blue-700",
  warning: "bg-amber-100 text-amber-700",
  success: "bg-emerald-100 text-emerald-700",
  destructive: "bg-rose-100 text-rose-700",
};

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const query = useQuery({
    queryKey: ["dashboard", "metrics"],
    queryFn: dashboardService.metrics,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Olá, ${user?.name?.split(" ")[0] ?? "bem-vindo"}!`}
        description="Visão geral da sua operação de suporte."
        actions={<NewTicketButton />}
      />

      {query.isError ? (
        <ErrorState message="Não foi possível carregar as métricas." />
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {METRICS.map((metric) => {
            const Icon = metric.icon;
            const value = query.data?.[metric.key as keyof typeof query.data];
            return (
              <Card key={metric.key}>
                <CardContent className="p-5">
                  <div
                    className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${TONE_CLASSES[metric.tone]}`}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <p className="text-xs text-muted-foreground">{metric.label}</p>
                  {query.isLoading ? (
                    <Skeleton className="mt-1 h-7 w-12" />
                  ) : (
                    <p className="text-2xl font-semibold">{Number(value ?? 0)}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Chamados recentes</CardTitle>
            <CardDescription>Últimos chamados criados.</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard/tickets">
              Ver todos <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {query.isLoading ? (
            <div className="space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : !query.data?.recent?.length ? (
            <EmptyState
              title="Nenhum chamado ainda"
              description="Quando novos chamados forem criados, eles aparecerão aqui."
            />
          ) : (
            <ul className="divide-y">
              {query.data.recent.map((ticket) => (
                <li key={ticket.id} className="py-3">
                  <Link
                    href={`/dashboard/tickets/${ticket.id}`}
                    className="flex flex-col gap-2 rounded-lg p-2 transition-colors hover:bg-accent md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">
                          {ticket.protocol}
                        </span>
                        <span className="truncate font-medium">{ticket.title}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {ticket.customer?.name ?? "Cliente"} · {formatDateTime(ticket.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={ticket.status} />
                      <PriorityBadge priority={ticket.priority} />
                      <SlaIndicator slaDueAt={ticket.slaDueAt} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
