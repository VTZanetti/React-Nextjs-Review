import Link from "next/link";
import { ArrowRight, BarChart3, BookOpen, ShieldCheck, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <header className="container flex items-center justify-between py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            SD
          </div>
          <span className="text-lg font-semibold">SupportDesk</span>
        </div>
        <Button asChild>
          <Link href="/login">
            Entrar <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </header>

      <section className="container grid gap-12 py-20 md:grid-cols-2 md:items-center">
        <div>
          <span className="inline-flex items-center rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            Help Desk profissional
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            Centralize seu atendimento. <br />
            Resolva mais rápido.
          </h1>
          <p className="mt-4 max-w-lg text-lg text-muted-foreground">
            Gerencie chamados, clientes, SLA e base de conhecimento em uma única
            plataforma — com a clareza que sua operação merece.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/login">Acessar painel</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/dashboard/knowledge-base">Base de conhecimento</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { icon: Ticket, title: "Chamados", desc: "Workflow completo, SLA e timeline." },
            { icon: BarChart3, title: "Métricas", desc: "Indicadores em tempo real." },
            { icon: ShieldCheck, title: "Segurança", desc: "JWT, RBAC e auditoria." },
            { icon: BookOpen, title: "Knowledge Base", desc: "Artigos públicos e internos." },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-2xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-3 text-base font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
