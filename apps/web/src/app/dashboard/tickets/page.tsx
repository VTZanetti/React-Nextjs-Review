"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewTicketButton } from "@/components/new-ticket-button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { PriorityBadge } from "@/components/priority-badge";
import { SlaIndicator } from "@/components/sla-indicator";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { ticketsService } from "@/services/tickets-service";
import { useUIStore } from "@/store/ui-store";
import { useAuthStore } from "@/store/auth-store";
import {
  TICKET_CATEGORY_LABELS,
  TICKET_PRIORITY_LABELS,
  TICKET_STATUS_LABELS,
  type TicketCategory,
  type TicketPriority,
  type TicketStatus,
} from "@supportdesk/shared";
import { formatDateTime } from "@/lib/utils";

const STATUSES = Object.keys(TICKET_STATUS_LABELS) as TicketStatus[];
const PRIORITIES = Object.keys(TICKET_PRIORITY_LABELS) as TicketPriority[];
const CATEGORIES = Object.keys(TICKET_CATEGORY_LABELS) as TicketCategory[];

export default function TicketsPage() {
  const filters = useUIStore((s) => s.ticketFilters);
  const setFilter = useUIStore((s) => s.setTicketFilter);
  const reset = useUIStore((s) => s.resetTicketFilters);
  const [page, setPage] = useState(1);
  const role = useAuthStore((s) => s.user?.role);
  const isCustomer = role === "CUSTOMER";

  const query = useQuery({
    queryKey: ["tickets", filters, page],
    queryFn: () =>
      ticketsService.list({
        search: filters.search || undefined,
        status: filters.status === "ALL" ? undefined : filters.status,
        priority: filters.priority === "ALL" ? undefined : filters.priority,
        category: filters.category === "ALL" ? undefined : filters.category,
        page,
        pageSize: 20,
      }),
    staleTime: 15_000,
  });

  const totalPages = query.data ? Math.max(1, Math.ceil(query.data.total / query.data.pageSize)) : 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isCustomer ? "Meus chamados" : "Chamados"}
        description={
          isCustomer
            ? "Acompanhe seus chamados de suporte."
            : "Acompanhe, filtre e gerencie todos os chamados de suporte."
        }
        actions={<NewTicketButton />}
      />

      <Card>
        <CardContent className="p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por título, descrição ou protocolo..."
                value={filters.search}
                onChange={(e) => {
                  setFilter("search", e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
            <Select
              value={filters.status}
              onValueChange={(v) => {
                setFilter("status", v as TicketStatus | "ALL");
                setPage(1);
              }}
            >
              <SelectTrigger className="md:w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todos os status</SelectItem>
                {STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {TICKET_STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.priority}
              onValueChange={(v) => {
                setFilter("priority", v as TicketPriority | "ALL");
                setPage(1);
              }}
            >
              <SelectTrigger className="md:w-40">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas as prioridades</SelectItem>
                {PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {TICKET_PRIORITY_LABELS[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.category}
              onValueChange={(v) => {
                setFilter("category", v as TicketCategory | "ALL");
                setPage(1);
              }}
            >
              <SelectTrigger className="md:w-44">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas as categorias</SelectItem>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {TICKET_CATEGORY_LABELS[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                reset();
                setPage(1);
              }}
            >
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {query.isLoading ? (
            <div className="space-y-2 p-4">
              {[0, 1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : query.isError ? (
            <ErrorState className="m-4" message="Falha ao carregar chamados." />
          ) : !query.data?.items.length ? (
            <EmptyState
              className="m-4"
              title="Nenhum chamado encontrado"
              description="Ajuste os filtros ou crie um novo chamado."
              action={<NewTicketButton />}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Protocolo</th>
                    <th className="px-4 py-3 font-medium">Título</th>
                    <th className="px-4 py-3 font-medium">Cliente</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Prioridade</th>
                    <th className="px-4 py-3 font-medium">SLA</th>
                    <th className="px-4 py-3 font-medium">Criado em</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {query.data.items.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="cursor-pointer hover:bg-muted/40"
                      onClick={() => {
                        window.location.href = `/dashboard/tickets/${ticket.id}`;
                      }}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {ticket.protocol}
                      </td>
                      <td className="max-w-[260px] px-4 py-3">
                        <Link
                          href={`/dashboard/tickets/${ticket.id}`}
                          className="font-medium hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {ticket.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {ticket.customer?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={ticket.status} />
                      </td>
                      <td className="px-4 py-3">
                        <PriorityBadge priority={ticket.priority} />
                      </td>
                      <td className="px-4 py-3">
                        <SlaIndicator slaDueAt={ticket.slaDueAt} />
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {formatDateTime(ticket.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {query.data && query.data.total > query.data.pageSize ? (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {query.data.total} chamados — página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
