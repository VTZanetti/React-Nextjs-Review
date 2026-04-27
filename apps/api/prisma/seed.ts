import { PrismaClient, TicketPriority } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const SLA_HOURS = { LOW: 72, MEDIUM: 48, HIGH: 24, CRITICAL: 4 } as const;
function slaDue(priority: TicketPriority, from = new Date()) {
  return new Date(from.getTime() + SLA_HOURS[priority] * 60 * 60 * 1000);
}

function protocol() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `SD-${ymd}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

async function main() {
  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash("Password@123", 10);

  // Users
  const admin = await prisma.user.upsert({
    where: { email: "admin@supportdesk.dev" },
    update: {},
    create: {
      name: "Ana Admin",
      email: "admin@supportdesk.dev",
      role: "ADMIN",
      passwordHash,
    },
  });

  const agent = await prisma.user.upsert({
    where: { email: "agente@supportdesk.dev" },
    update: {},
    create: {
      name: "Bruno Atendente",
      email: "agente@supportdesk.dev",
      role: "AGENT",
      passwordHash,
    },
  });

  const agent2 = await prisma.user.upsert({
    where: { email: "ana@supportdesk.dev" },
    update: {},
    create: {
      name: "Ana Souza",
      email: "ana@supportdesk.dev",
      role: "AGENT",
      passwordHash,
    },
  });

  // Customers
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { email: "carla@acme.com" },
      update: {},
      create: {
        name: "Carla Cliente",
        email: "carla@acme.com",
        company: "Acme Ltda.",
        phone: "+55 11 91111-1111",
        status: "ACTIVE",
      },
    }),
    prisma.customer.upsert({
      where: { email: "diego@globex.com" },
      update: {},
      create: {
        name: "Diego Rocha",
        email: "diego@globex.com",
        company: "Globex S.A.",
        phone: "+55 11 92222-2222",
        status: "ACTIVE",
      },
    }),
    prisma.customer.upsert({
      where: { email: "elisa@initech.com" },
      update: {},
      create: {
        name: "Elisa Martins",
        email: "elisa@initech.com",
        company: "Initech",
        phone: "+55 11 93333-3333",
        status: "ACTIVE",
      },
    }),
  ]);

  // Customer login user (linked to first customer)
  await prisma.user.upsert({
    where: { email: "cliente@supportdesk.dev" },
    update: {},
    create: {
      name: "Carla Cliente",
      email: "cliente@supportdesk.dev",
      role: "CUSTOMER",
      passwordHash,
      customerId: customers[0].id,
    },
  });

  // Tickets
  const ticketsData = [
    {
      title: "Não consigo acessar o sistema",
      description:
        "Ao tentar fazer login recebo a mensagem 'sessão expirada'. Já limpei cache e cookies sem sucesso.",
      priority: "CRITICAL" as const,
      category: "ACESSO" as const,
      customerId: customers[0].id,
      assigneeId: agent.id,
      status: "IN_PROGRESS" as const,
    },
    {
      title: "Erro ao gerar nota fiscal",
      description: "A geração de NFe está falhando para clientes do estado de SP.",
      priority: "HIGH" as const,
      category: "NOTA_FISCAL" as const,
      customerId: customers[1].id,
      assigneeId: agent2.id,
      status: "OPEN" as const,
    },
    {
      title: "Solicitação de novo módulo financeiro",
      description: "Gostaríamos de avaliar a contratação do módulo financeiro avançado.",
      priority: "LOW" as const,
      category: "FINANCEIRO" as const,
      customerId: customers[2].id,
      assigneeId: null,
      status: "OPEN" as const,
    },
    {
      title: "Bug na exportação de relatórios",
      description: "O relatório consolidado está exportando linhas duplicadas em CSV.",
      priority: "MEDIUM" as const,
      category: "BUG" as const,
      customerId: customers[1].id,
      assigneeId: agent.id,
      status: "WAITING_CUSTOMER" as const,
    },
    {
      title: "Integração com gateway de pagamento intermitente",
      description: "Recebemos timeouts esporádicos ao processar pagamentos via Pix.",
      priority: "HIGH" as const,
      category: "INTEGRACAO" as const,
      customerId: customers[0].id,
      assigneeId: agent2.id,
      status: "OPEN" as const,
    },
    {
      title: "Solicitação de criação de novo usuário",
      description: "Por favor, criar acesso para o colaborador Pedro Silva.",
      priority: "LOW" as const,
      category: "SOLICITACAO" as const,
      customerId: customers[2].id,
      assigneeId: agent.id,
      status: "RESOLVED" as const,
    },
  ];

  for (const data of ticketsData) {
    const sla = slaDue(data.priority);
    const ticket = await prisma.ticket.create({
      data: {
        protocol: protocol(),
        title: data.title,
        description: data.description,
        priority: data.priority,
        category: data.category,
        customerId: data.customerId,
        assigneeId: data.assigneeId,
        status: data.status,
        slaDueAt: sla,
        resolvedAt: data.status === "RESOLVED" ? new Date() : null,
      },
    });

    await prisma.ticketEvent.create({
      data: { ticketId: ticket.id, type: "CREATED", authorId: admin.id },
    });

    if (data.assigneeId) {
      await prisma.ticketEvent.create({
        data: {
          ticketId: ticket.id,
          type: "ASSIGNED",
          authorId: admin.id,
          payload: { to: data.assigneeId },
        },
      });
    }

    await prisma.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        authorId: admin.id,
        content: "Olá! Recebemos seu chamado e já estamos analisando. Em breve retornaremos.",
      },
    });

    await prisma.ticketEvent.create({
      data: { ticketId: ticket.id, type: "MESSAGE_SENT", authorId: admin.id },
    });
  }

  // Knowledge base
  const articles = [
    {
      title: "Como redefinir minha senha",
      slug: "como-redefinir-minha-senha",
      category: "Acesso",
      content:
        "## Redefinindo a senha\n\n1. Acesse a tela de login.\n2. Clique em 'Esqueci minha senha'.\n3. Informe o e-mail cadastrado e siga as instruções recebidas.",
      visibility: "PUBLIC" as const,
    },
    {
      title: "Política interna de SLA",
      slug: "politica-interna-de-sla",
      category: "Operacional",
      content:
        "Documento interno com as regras de SLA por prioridade: LOW 72h, MEDIUM 48h, HIGH 24h, CRITICAL 4h.",
      visibility: "INTERNAL" as const,
    },
    {
      title: "Boas práticas para abrir chamados",
      slug: "boas-praticas-para-abrir-chamados",
      category: "Boas práticas",
      content:
        "Inclua o máximo de detalhes: contexto, passos para reproduzir, prints e horário do incidente.",
      visibility: "PUBLIC" as const,
    },
  ];

  for (const article of articles) {
    await prisma.knowledgeArticle.upsert({
      where: { slug: article.slug },
      update: {},
      create: article,
    });
  }

  console.log("Seed concluído.");
  console.log("Login admin: admin@supportdesk.dev / Password@123");
  console.log("Login agente: agente@supportdesk.dev / Password@123");
  console.log("Login cliente: cliente@supportdesk.dev / Password@123");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
