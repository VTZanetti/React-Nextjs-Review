"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";
import {
  createCustomerInputSchema,
  type CreateCustomerInput,
} from "@supportdesk/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { ErrorState } from "@/components/error-state";
import { customersService } from "@/services/customers-service";
import { extractErrorMessage } from "@/lib/api-client";
import { AuthGuard } from "@/components/layout/auth-guard";
import { useAuthStore } from "@/store/auth-store";

export default function CustomersPage() {
  return (
    <AuthGuard roles={["ADMIN", "AGENT"]}>
      <CustomersInner />
    </AuthGuard>
  );
}

function CustomersInner() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const isAdmin = useAuthStore((s) => s.user?.role === "ADMIN");

  const query = useQuery({
    queryKey: ["customers", { search }],
    queryFn: () => customersService.list({ search: search || undefined, pageSize: 50 }),
  });

  const form = useForm<CreateCustomerInput>({
    resolver: zodResolver(createCustomerInputSchema),
    defaultValues: { name: "", email: "", company: "", phone: "", status: "ACTIVE" },
  });

  const createMutation = useMutation({
    mutationFn: customersService.create,
    onSuccess: () => {
      toast.success("Cliente criado com sucesso");
      form.reset();
      setShowForm(false);
      qc.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: (e) => toast.error(extractErrorMessage(e)),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description={
          isAdmin
            ? "Gerencie a base de clientes que abrem chamados."
            : "Visualize a base de clientes que abrem chamados."
        }
        actions={
          isAdmin ? (
            <Button onClick={() => setShowForm((v) => !v)}>
              <Plus className="mr-2 h-4 w-4" /> {showForm ? "Cancelar" : "Novo cliente"}
            </Button>
          ) : null
        }
      />

      {isAdmin && showForm ? (
        <Card>
          <CardContent className="p-6">
            <form
              className="grid gap-3 md:grid-cols-2"
              onSubmit={form.handleSubmit((values) => createMutation.mutate(values))}
              noValidate
            >
              <div className="space-y-1.5">
                <Label>Nome</Label>
                <Input {...form.register("name")} />
                {form.formState.errors.name ? (
                  <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label>E-mail</Label>
                <Input type="email" {...form.register("email")} />
                {form.formState.errors.email ? (
                  <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label>Empresa</Label>
                <Input {...form.register("company")} />
              </div>
              <div className="space-y-1.5">
                <Label>Telefone</Label>
                <Input {...form.register("phone")} />
              </div>
              <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  Salvar cliente
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Buscar por nome, empresa ou e-mail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {query.isLoading ? (
            <div className="space-y-2 p-4">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : query.isError ? (
            <ErrorState className="m-4" message="Falha ao carregar clientes." />
          ) : !query.data?.items.length ? (
            <EmptyState
              className="m-4"
              title="Nenhum cliente encontrado"
              description="Crie o primeiro cliente para começar a registrar chamados."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Nome</th>
                    <th className="px-4 py-3 font-medium">Empresa</th>
                    <th className="px-4 py-3 font-medium">E-mail</th>
                    <th className="px-4 py-3 font-medium">Telefone</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {query.data.items.map((customer) => (
                    <tr
                      key={customer.id}
                      className="cursor-pointer hover:bg-muted/40"
                      onClick={() => {
                        window.location.href = `/dashboard/customers/${customer.id}`;
                      }}
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/customers/${customer.id}`}
                          className="font-medium hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {customer.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{customer.company ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{customer.email}</td>
                      <td className="px-4 py-3 text-muted-foreground">{customer.phone ?? "—"}</td>
                      <td className="px-4 py-3">
                        <Badge variant={customer.status === "ACTIVE" ? "success" : "muted"}>
                          {customer.status === "ACTIVE" ? "Ativo" : "Inativo"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
