"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  TICKET_CATEGORY_LABELS,
  TICKET_PRIORITY_LABELS,
  createTicketInputSchema,
  type CreateTicketInput,
  type TicketCategory,
  type TicketPriority,
} from "@supportdesk/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/page-header";
import { ticketsService } from "@/services/tickets-service";
import { customersService } from "@/services/customers-service";
import { extractErrorMessage } from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";

const PRIORITIES = Object.keys(TICKET_PRIORITY_LABELS) as TicketPriority[];
const CATEGORIES = Object.keys(TICKET_CATEGORY_LABELS) as TicketCategory[];

export default function NewTicketPage() {
  const router = useRouter();
  const role = useAuthStore((s) => s.user?.role);
  const isCustomer = role === "CUSTOMER";

  const customers = useQuery({
    queryKey: ["customers", { all: true }],
    queryFn: () => customersService.list({ pageSize: 100 }),
    enabled: !isCustomer,
  });

  const form = useForm<CreateTicketInput>({
    resolver: zodResolver(createTicketInputSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM",
      category: "OUTRO",
      customerId: undefined,
    },
  });

  const mutation = useMutation({
    mutationFn: ticketsService.create,
    onSuccess: (ticket) => {
      toast.success("Chamado criado com sucesso!");
      router.push(`/dashboard/tickets/${ticket.id}`);
    },
    onError: (error) => {
      toast.error(extractErrorMessage(error, "Não foi possível criar o chamado"));
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Novo chamado"
        description="Registre um novo chamado para iniciar o atendimento."
      />

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Dados do chamado</CardTitle>
          <CardDescription>O SLA é calculado automaticamente pela prioridade.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4"
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            noValidate
          >
            <div className="space-y-1.5">
              <Label htmlFor="title">Título</Label>
              <Input id="title" placeholder="Resumo do problema" {...form.register("title")} />
              {form.formState.errors.title ? (
                <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                rows={6}
                placeholder="Descreva com detalhes o que aconteceu, passos para reproduzir..."
                {...form.register("description")}
              />
              {form.formState.errors.description ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.description.message}
                </p>
              ) : null}
            </div>

            <div className={isCustomer ? "grid gap-4 md:grid-cols-2" : "grid gap-4 md:grid-cols-3"}>
              {!isCustomer ? (
                <div className="space-y-1.5">
                  <Label>Cliente</Label>
                  <Select
                    value={form.watch("customerId") ?? ""}
                    onValueChange={(v) => form.setValue("customerId", v, { shouldValidate: true })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.data?.items.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name} {c.company ? `· ${c.company}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.customerId ? (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.customerId.message}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div className="space-y-1.5">
                <Label>Prioridade</Label>
                <Select
                  value={form.watch("priority")}
                  onValueChange={(v) => form.setValue("priority", v as TicketPriority)}
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
                <Label>Categoria</Label>
                <Select
                  value={form.watch("category")}
                  onValueChange={(v) => form.setValue("category", v as TicketCategory)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {TICKET_CATEGORY_LABELS[c]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Criando...
                  </>
                ) : (
                  "Criar chamado"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
