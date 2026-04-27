"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { HeadphonesIcon, Loader2 } from "lucide-react";
import { loginInputSchema, type LoginInput } from "@supportdesk/shared";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authService } from "@/services/auth-service";
import { useAuthStore } from "@/store/auth-store";
import { extractErrorMessage } from "@/lib/api-client";

export default function LoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [showCreds, setShowCreds] = useState(true);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginInputSchema),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setSession(data);
      toast.success("Bem-vindo de volta!");
      router.replace("/dashboard");
    },
    onError: (error) => {
      toast.error(extractErrorMessage(error, "Não foi possível fazer login"));
    },
  });

  function fillDemo(role: "admin" | "agent" | "customer") {
    const map = {
      admin: { email: "admin@supportdesk.dev", password: "Password@123" },
      agent: { email: "agente@supportdesk.dev", password: "Password@123" },
      customer: { email: "cliente@supportdesk.dev", password: "Password@123" },
    };
    form.reset(map[role]);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <HeadphonesIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-semibold">SupportDesk</p>
            <p className="text-xs text-muted-foreground">Plataforma de suporte</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Entrar na sua conta</CardTitle>
            <CardDescription>Use seu e-mail corporativo para acessar o painel.</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
              noValidate
            >
              <div className="space-y-1.5">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="voce@empresa.com"
                  {...form.register("email")}
                />
                {form.formState.errors.email ? (
                  <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...form.register("password")}
                />
                {form.formState.errors.password ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.password.message}
                  </p>
                ) : null}
              </div>

              <Button type="submit" className="w-full" disabled={mutation.isPending}>
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>
            </form>

            {showCreds ? (
              <div className="mt-6 rounded-lg border bg-muted/40 p-4 text-xs">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">Credenciais de demonstração</p>
                  <button
                    type="button"
                    onClick={() => setShowCreds(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ocultar
                  </button>
                </div>
                <div className="mt-3 grid gap-2">
                  <button
                    type="button"
                    onClick={() => fillDemo("admin")}
                    className="rounded-md border bg-background px-3 py-2 text-left hover:bg-accent"
                  >
                    <span className="font-medium">Admin</span> · admin@supportdesk.dev
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemo("agent")}
                    className="rounded-md border bg-background px-3 py-2 text-left hover:bg-accent"
                  >
                    <span className="font-medium">Atendente</span> · agente@supportdesk.dev
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemo("customer")}
                    className="rounded-md border bg-background px-3 py-2 text-left hover:bg-accent"
                  >
                    <span className="font-medium">Cliente</span> · cliente@supportdesk.dev
                  </button>
                </div>
                <p className="mt-3 text-muted-foreground">
                  Senha para todos: <code className="rounded bg-background px-1 py-0.5">Password@123</code>
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
