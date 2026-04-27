"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  CheckCircle2,
  Clock,
  Flag,
  History,
  MessageSquare,
  Send,
  User as UserIcon,
} from "lucide-react";
import {
  TICKET_CATEGORY_LABELS,
  TICKET_PRIORITY_LABELS,
  TICKET_STATUS_LABELS,
  type TicketPriority,
  type TicketStatus,
} from "@supportdesk/shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/page-header";
import { StatusBadge } from "@/components/status-badge";
import { PriorityBadge } from "@/components/priority-badge";
import { SlaIndicator, SlaDueLine } from "@/components/sla-indicator";
import { ErrorState } from "@/components/error-state";
import { BackLink } from "@/components/back-link";
import { ticketsService } from "@/services/tickets-service";
import { ticketMessagesService } from "@/services/ticket-messages-service";
import { usersService } from "@/services/users-service";
import { useAuthStore } from "@/store/auth-store";
import { extractErrorMessage } from "@/lib/api-client";
import { formatDateTime, getInitials } from "@/lib/utils";

const STATUSES = Object.keys(TICKET_STATUS_LABELS) as TicketStatus[];
const PRIORITIES = Object.keys(TICKET_PRIORITY_LABELS) as TicketPriority[];

const EVENT_LABEL: Record<string, string> = {
  CREATED: "Chamado criado",
  STATUS_CHANGED: "Status alterado",
  PRIORITY_CHANGED: "Prioridade alterada",
  ASSIGNED: "Responsável atribuído",
  MESSAGE_SENT: "Mensagem enviada",
  RESOLVED: "Chamado resolvido",
  REOPENED: "Chamado reaberto",
  CANCELLED: "Chamado cancelado",
};

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isStaff = user?.role === "ADMIN" || user?.role === "AGENT";
  const [message, setMessage] = useState("");

  const ticketQuery = useQuery({
    queryKey: ["ticket", id],
    queryFn: () => ticketsService.getById(id),
  });

  const messagesQuery = useQuery({
    queryKey: ["ticket", id, "messages"],
    queryFn: () => ticketMessagesService.list(id),
  });

  const eventsQuery = useQuery({
    queryKey: ["ticket", id, "events"],
    queryFn: () => ticketsService.events(id),
  });

  const agentsQuery = useQuery({
    queryKey: ["agents"],
    queryFn: usersService.listAgents,
    enabled: !!isStaff,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["ticket", id] });
    qc.invalidateQueries({ queryKey: ["tickets"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const statusMutation = useMutation({
    mutationFn: (status: TicketStatus) => ticketsService.updateStatus(id, { status }),
    onSuccess: () => {
      toast.success("Status atualizado");
      invalidate();
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  });

  const priorityMutation = useMutation({
    mutationFn: (priority: TicketPriority) => ticketsService.updatePriority(id, { priority }),
    onSuccess: () => {
      toast.success("Prioridade atualizada");
      invalidate();
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  });

  const assignMutation = useMutation({
    mutationFn: (assigneeId: string | null) => ticketsService.assign(id, { assigneeId }),
    onSuccess: () => {
      toast.success("Responsável atualizado");
      invalidate();
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  });

  const messageMutation = useMutation({
    mutationFn: () => ticketMessagesService.create(id, { content: message.trim() }),
    onSuccess: () => {
      setMessage("");
      toast.success("Mensagem enviada");
      qc.invalidateQueries({ queryKey: ["ticket", id, "messages"] });
      qc.invalidateQueries({ queryKey: ["ticket", id, "events"] });
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  });

  if (ticketQuery.isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (ticketQuery.isError || !ticketQuery.data) {
    return <ErrorState message="Chamado não encontrado." />;
  }

  const ticket = ticketQuery.data;

  return (
    <div className="space-y-6">
      <BackLink href="/dashboard/tickets" label="Voltar para chamados" />

      <PageHeader
        title={ticket.title}
        description={<span className="font-mono text-xs">{ticket.protocol}</span>}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={ticket.status} />
            <PriorityBadge priority={ticket.priority} />
            <SlaIndicator slaDueAt={ticket.slaDueAt} />
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Descrição</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {ticket.description}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <CardTitle>Conversa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {messagesQuery.isLoading ? (
                <Skeleton className="h-24 w-full" />
              ) : !messagesQuery.data?.length ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma mensagem ainda. Inicie a conversa abaixo.
                </p>
              ) : (
                <ul className="space-y-4">
                  {messagesQuery.data.map((m) => {
                    const isCustomer = m.authorRole === "CUSTOMER";
                    return (
                      <li key={m.id} className={`flex gap-3 ${isCustomer ? "" : ""}`}>
                        <Avatar>
                          <AvatarFallback>{getInitials(m.authorName)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-medium">{m.authorName}</span>
                            <span className="text-muted-foreground">
                              {isCustomer ? "Cliente" : m.authorRole === "ADMIN" ? "Administrador" : "Atendente"}
                            </span>
                            <span className="text-muted-foreground">·</span>
                            <span className="text-muted-foreground">
                              {formatDateTime(m.createdAt)}
                            </span>
                          </div>
                          <div
                            className={`mt-1 rounded-lg border p-3 text-sm ${isCustomer ? "bg-muted/40" : "bg-primary/5 border-primary/20"}`}
                          >
                            <p className="whitespace-pre-wrap">{m.content}</p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="border-t pt-4">
                <Textarea
                  rows={3}
                  placeholder="Escreva uma resposta..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <div className="mt-2 flex justify-end">
                  <Button
                    onClick={() => messageMutation.mutate()}
                    disabled={!message.trim() || messageMutation.isPending}
                  >
                    <Send className="mr-2 h-4 w-4" /> Enviar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {eventsQuery.isLoading ? (
                <Skeleton className="h-24 w-full" />
              ) : (
                <ol className="relative space-y-4 border-l pl-6">
                  {eventsQuery.data?.map((event) => (
                    <li key={event.id} className="relative">
                      <span className="absolute -left-[27px] top-1 flex h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                      <p className="text-sm font-medium">{EVENT_LABEL[event.type]}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.authorName ? `${event.authorName} · ` : ""}
                        {formatDateTime(event.createdAt)}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Detalhes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Categoria</span>
                <span className="font-medium">{TICKET_CATEGORY_LABELS[ticket.category]}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Cliente</span>
                <Link
                  href={`/dashboard/customers/${ticket.customer?.id ?? ticket.customerId}`}
                  className="font-medium hover:underline"
                >
                  {ticket.customer?.name ?? "—"}
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Empresa</span>
                <span className="font-medium">{ticket.customer?.company ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Responsável</span>
                <span className="font-medium">{ticket.assignee?.name ?? "Não atribuído"}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-muted-foreground">SLA</span>
                <div className="flex flex-col items-end">
                  <SlaIndicator slaDueAt={ticket.slaDueAt} />
                  <SlaDueLine slaDueAt={ticket.slaDueAt} />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Criado em</span>
                <span className="font-medium">{formatDateTime(ticket.createdAt)}</span>
              </div>
              {ticket.resolvedAt ? (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Resolvido em</span>
                  <span className="font-medium">{formatDateTime(ticket.resolvedAt)}</span>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {isStaff ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="space-y-1.5">
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Flag className="h-3 w-3" /> Status
                  </span>
                  <Select
                    value={ticket.status}
                    onValueChange={(v) => statusMutation.mutate(v as TicketStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {TICKET_STATUS_LABELS[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> Prioridade
                  </span>
                  <Select
                    value={ticket.priority}
                    onValueChange={(v) => priorityMutation.mutate(v as TicketPriority)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((p) => (
                        <SelectItem key={p} value={p}>
                          {TICKET_PRIORITY_LABELS[p]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    <UserIcon className="h-3 w-3" /> Responsável
                  </span>
                  <Select
                    value={ticket.assigneeId ?? "none"}
                    onValueChange={(v) =>
                      assignMutation.mutate(v === "none" ? null : v)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Atribuir" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem responsável</SelectItem>
                      {agentsQuery.data?.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          {agent.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {ticket.status !== "RESOLVED" ? (
                  <Button
                    className="w-full"
                    onClick={() => statusMutation.mutate("RESOLVED")}
                    disabled={statusMutation.isPending}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Encerrar chamado
                  </Button>
                ) : null}
              </CardContent>
            </Card>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
