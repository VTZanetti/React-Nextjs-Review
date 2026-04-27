# SupportDesk

Sistema completo de **Help Desk** para gestão de chamados de suporte, clientes,
mensagens, SLA e base de conhecimento — construído como **monorepo full-stack**
para demonstrar domínio em Next.js 15, React, TypeScript, Node.js, Fastify,
Prisma e boas práticas de arquitetura.

> Projeto criado para fins de portfólio / entrevista técnica frontend / full-stack.

---

## ✨ Visão geral

- **Frontend** (Next.js 15 + App Router) em [`apps/web`](./apps/web)
- **Backend** (Node.js + Fastify + Prisma) em [`apps/api`](./apps/api)
- **Pacote compartilhado** (tipos + Zod) em [`packages/shared`](./packages/shared)

A camada `shared` garante que **schemas Zod** e **enums** (status, prioridade,
categoria, role) sejam consumidos identicamente pelo backend e pelo frontend,
eliminando drift de tipos.

---

## 🧱 Stack

### Frontend (`apps/web`)
- Next.js 15 (App Router, RSC + Client)
- React 19
- TypeScript estrito
- Tailwind CSS + tokens de design (HSL variables)
- shadcn/ui (componentes primitivos baseados em Radix)
- TanStack Query (server state, cache, mutations)
- Zustand (sessão + UI: sidebar e filtros)
- React Hook Form + Zod resolvers
- Sonner (toasts)
- Vitest + Testing Library

### Backend (`apps/api`)
- Node.js 20 + Fastify 5
- TypeScript estrito
- Prisma ORM + PostgreSQL
- JWT (`@fastify/jwt`) + bcrypt
- Zod (validação de input em controllers)
- Swagger / OpenAPI em `/docs`
- Vitest
- Docker / Docker Compose

---

## 📁 Estrutura

```
supportdesk/
├── apps/
│   ├── api/                       # Backend Fastify
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts
│   │   └── src/
│   │       ├── config/            # env validation
│   │       ├── lib/               # prisma client, errors, protocol
│   │       ├── plugins/           # auth, error-handler
│   │       ├── modules/
│   │       │   ├── auth/          # routes / controller / service
│   │       │   ├── users/
│   │       │   ├── customers/
│   │       │   ├── tickets/       # tickets + ticket-events
│   │       │   ├── ticket-messages/
│   │       │   ├── knowledge-base/
│   │       │   └── dashboard/
│   │       ├── app.ts             # build Fastify instance
│   │       └── server.ts          # entrypoint
│   └── web/                       # Frontend Next.js 15
│       └── src/
│           ├── app/               # App Router
│           │   ├── login/
│           │   └── dashboard/
│           │       ├── tickets/{,/new,/[id]}
│           │       ├── customers/{,/[id]}
│           │       └── knowledge-base/{,/[slug]}
│           ├── components/        # ui/ + status/priority/SLA badges
│           ├── services/          # camada axios por módulo
│           ├── store/             # zustand: auth + ui
│           ├── providers/         # query provider, toaster
│           └── lib/               # api-client, utils
└── packages/
    └── shared/                    # tipos + schemas Zod + cálculo de SLA
```

---

## 🚀 Como rodar localmente

### Pré-requisitos
- **Node.js 20+** e **pnpm 9+**
- **Docker** (para subir o Postgres)

### 1. Clonar e instalar
```bash
pnpm install
```

### 2. Subir o banco
```bash
cp .env.example .env
docker compose up -d postgres
```

### 3. Configurar e popular o banco
```bash
cp apps/api/.env.example apps/api/.env
pnpm --filter @supportdesk/api prisma:generate
pnpm db:migrate
pnpm db:seed
```

### 4. Rodar API e Web em paralelo
```bash
cp apps/web/.env.example apps/web/.env.local
pnpm dev
```

- API:    http://localhost:3333
- Docs:   http://localhost:3333/docs
- Web:    http://localhost:3000

### Credenciais de demo
| Perfil   | E-mail                       | Senha          |
|----------|------------------------------|----------------|
| Admin    | `admin@supportdesk.dev`      | `Password@123` |
| Atendente| `agente@supportdesk.dev`     | `Password@123` |
| Cliente  | `cliente@supportdesk.dev`    | `Password@123` |

---

## 🔧 Scripts principais

Na raiz do monorepo:

| Script              | O que faz                                          |
|---------------------|----------------------------------------------------|
| `pnpm dev`          | Roda **frontend e backend** em paralelo            |
| `pnpm dev:web`      | Apenas frontend                                    |
| `pnpm dev:api`      | Apenas backend                                     |
| `pnpm build`        | Build de todos os pacotes                          |
| `pnpm test`         | Roda os testes (Vitest) em todo o monorepo         |
| `pnpm db:migrate`   | Executa migrations Prisma                          |
| `pnpm db:seed`      | Popula o banco                                     |
| `pnpm db:reset`     | Reseta o banco e roda o seed                       |
| `pnpm docker:up`    | Sobe `postgres` (e opcionalmente `api`) em Docker  |
| `pnpm docker:down`  | Derruba os serviços                                |

---

## 🔐 Variáveis de ambiente

### Raiz (`.env`)
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT`
- `JWT_SECRET`, `CORS_ORIGIN`

### API (`apps/api/.env`)
- `NODE_ENV` — `development` | `test` | `production`
- `API_PORT` — porta do Fastify (default `3333`)
- `DATABASE_URL` — string de conexão do Postgres
- `JWT_SECRET` — segredo de assinatura JWT
- `JWT_EXPIRES_IN` — ex. `7d`
- `CORS_ORIGIN` — origem(s) permitida(s), separadas por vírgula

### Web (`apps/web/.env.local`)
- `NEXT_PUBLIC_API_URL` — base URL da API (default `http://localhost:3333`)

---

## 📡 Endpoints principais

> Todas as rotas são prefixadas com `/api`. Auth via header `Authorization: Bearer <jwt>`.

### Auth
- `POST /api/auth/login`
- `GET /api/auth/me`

### Users (admin)
- `GET /api/users` (admin)
- `GET /api/users/agents` (admin/agent)
- `POST /api/users` (admin)

### Customers
- `GET /api/customers?search=&page=&pageSize=`
- `GET /api/customers/:id`
- `POST /api/customers`
- `PATCH /api/customers/:id`
- `DELETE /api/customers/:id` (admin)

### Tickets
- `GET /api/tickets?search=&status=&priority=&category=&page=&pageSize=`
- `GET /api/tickets/:id`
- `GET /api/tickets/:id/events` — timeline
- `POST /api/tickets`
- `PATCH /api/tickets/:id/status` (staff)
- `PATCH /api/tickets/:id/priority` (staff)
- `PATCH /api/tickets/:id/assignee` (staff)

### Ticket Messages
- `GET /api/tickets/:id/messages`
- `POST /api/tickets/:id/messages`

### Knowledge Base
- `GET /api/knowledge-base?search=&category=&visibility=`
- `GET /api/knowledge-base/:slug`
- `POST /api/knowledge-base` (staff)
- `PATCH /api/knowledge-base/:id` (staff)
- `DELETE /api/knowledge-base/:id` (admin)

### Dashboard
- `GET /api/dashboard/metrics`

A documentação interativa completa fica em **`/docs` (Swagger UI)**.

---

## 🧠 Decisões arquiteturais

### Monorepo com `pnpm` + workspaces
Permite tipos compartilhados (`@supportdesk/shared`) sem publicar no NPM e
evita drift entre contratos de API e o que o frontend consome.

### Backend modular
Cada feature vive em um módulo isolado com `routes / controller / service /
schemas`. Services não conhecem o Fastify e podem ser testados isoladamente.
A árvore de pastas reflete a separação de responsabilidades:

```
modules/<feature>/
  <feature>.routes.ts      # registra rotas, middlewares e RBAC
  <feature>.controller.ts  # parse Zod, chama service, monta response
  <feature>.service.ts     # regras de negócio + Prisma
```

Ticket events são gravados dentro de **transações Prisma**, garantindo
consistência entre uma alteração de status (por exemplo) e o evento da timeline.

### SLA como função pura
`packages/shared/src/sla.ts` exporta `calculateSlaDueAt` e `getSlaStatus` —
ambas puras e testáveis. O backend usa para preencher `slaDueAt` na criação do
ticket; o frontend usa para classificar o badge (`ON_TRACK`, `AT_RISK`,
`BREACHED`) sem nova chamada à API.

### RBAC explícito
O plugin `auth` decora a instância Fastify com `authenticate` e
`requireRole(...roles)`. Customers só veem seus próprios chamados graças a um
filtro de escopo aplicado no service (`applyAccessScope`). Privacidade por
padrão, sem depender da camada HTTP.

### Frontend
- **Server state ≠ UI state.** TanStack Query cuida de fetch, cache, retry e
  invalidação. Zustand cuida apenas de UI (sidebar, filtros) e sessão.
- **Forms validados com Zod.** Os schemas vêm do `packages/shared`, então o
  formulário do frontend e o controller do backend usam o **mesmo contrato**.
- **shadcn/ui** dá controle total sobre os componentes, em vez de depender de
  uma lib opaca. Tudo pode ser inspecionado e adaptado em `components/ui/`.
- **Auth Guard híbrido**: redirect client-side por simplicidade do exemplo;
  evolução natural para Server Actions ou middleware.

### UX
Skeletons em todos os fetches, empty states, error states, toasts (`sonner`)
para feedback de mutations, badges semânticas para status / prioridade / SLA,
layout responsivo com sidebar colapsável.

### Qualidade
- TypeScript estrito (`strict`, `noUncheckedIndexedAccess`).
- Zero `any` desnecessário.
- Pastas por feature, não por tipo de arquivo.
- Errors do Fastify centralizados em um único handler.
- Cada serviço lança `AppError` específicos (`NotFoundError`, `ConflictError`,
  `ForbiddenError`, `UnauthorizedError`).

---

## ✅ Testes

```bash
pnpm test                 # roda todo o monorepo
pnpm --filter @supportdesk/api test
pnpm --filter @supportdesk/web test
pnpm --filter @supportdesk/shared test
```

Cobertura inicial:
- **shared**: regras de SLA puras
- **api**: geração de protocolo
- **web**: badges de status, indicador de SLA

---

## 🗺️ Roadmap futuro

- [ ] **Upload de anexos** em chamados (S3 / R2)
- [ ] **WebSocket** para atualização em tempo real de mensagens e timeline
- [ ] **Notificações por e-mail** (transactional — Resend / SES)
- [ ] **Integração com IA** para sugerir respostas a partir da base de
      conhecimento e do histórico do chamado
- [ ] **Multiempresa** (tenants isolados por organização)
- [ ] **Permissões avançadas** (ABAC: por categoria, por área, por SLA)

---

## 📜 Licença

MIT — uso livre para estudo e adaptação.
