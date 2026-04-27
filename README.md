# SupportDesk

SupportDesk e uma aplicacao de Help Desk para gestao de chamados, clientes, SLA e base de conhecimento. O projeto foi montado como monorepo para demonstrar uma experiencia completa de produto, com frontend em Next.js, API REST, validacao compartilhada e testes automatizados.

## Objetivo

O objetivo do projeto e servir como material de portfolio para vagas frontend, com foco em Next.js 15, UX de produto SaaS, consumo de API REST, organizacao de codigo e qualidade tecnica.

## Stack

| Camada | Tecnologias |
| --- | --- |
| Web | Next.js 15, React, TypeScript, Tailwind CSS, shadcn/ui, Radix UI |
| Estado e dados | TanStack Query, Zustand, React Hook Form, Zod |
| API | Fastify, Prisma, JWT, Swagger |
| Banco | PostgreSQL via Docker Compose |
| Qualidade | Vitest, Testing Library, TypeScript, ESLint |
| Monorepo | pnpm workspaces |

## Estrutura

```txt
apps/
  api/
    prisma/
    src/
      modules/
      plugins/
      lib/
  web/
    src/
      app/
      components/
      providers/
      services/
      store/
packages/
  shared/
    src/
      schemas/
      enums.ts
      sla.ts
```

## Funcionalidades

### Autenticacao

Login com e-mail e senha, validacao com React Hook Form e Zod, armazenamento de sessao no cliente e protecao das rotas internas.

### Dashboard

Indicadores de chamados abertos, em atendimento, resolvidos, criticos e com SLA vencido. A tela tambem apresenta cards de resumo e links para areas importantes da operacao.

### Chamados

Listagem com busca, filtros por status, prioridade e categoria, paginacao, estados de carregamento, erro e vazio. Tambem inclui criacao de chamado, detalhe completo, historico de mensagens, timeline de eventos e acoes de atendimento.

### Clientes

Listagem de clientes, cadastro, edicao e pagina de detalhe com chamados vinculados.

### Base de conhecimento

Listagem de artigos, busca por titulo, categorias e pagina de leitura.

### SLA

As regras de SLA ficam no pacote compartilhado:

| Prioridade | Prazo |
| --- | --- |
| Baixa | 72h |
| Media | 48h |
| Alta | 24h |
| Critica | 4h |

## Como rodar

Instale as dependencias:

```bash
pnpm install
```

Copie os arquivos de ambiente:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Suba o banco:

```bash
pnpm docker:up
```

Rode as migrations e o seed:

```bash
pnpm db:migrate
pnpm db:seed
```

Inicie web e API:

```bash
pnpm dev
```

Por padrao:

| Servico | URL |
| --- | --- |
| Web | http://localhost:3001 |
| API | http://localhost:3333 |
| Swagger | http://localhost:3333/docs |

## Scripts

| Comando | Descricao |
| --- | --- |
| `pnpm dev` | Inicia web e API em paralelo |
| `pnpm dev:web` | Inicia apenas o frontend |
| `pnpm dev:api` | Inicia apenas a API |
| `pnpm build` | Compila todos os workspaces |
| `pnpm lint` | Executa verificacoes de lint e typecheck |
| `pnpm test` | Executa os testes |
| `pnpm docker:up` | Sobe o PostgreSQL |
| `pnpm docker:down` | Encerra os containers |

## Credenciais de exemplo

Use os usuarios criados pelo seed para testar os fluxos da aplicacao.

| Perfil | E-mail |
| --- | --- |
| Admin | admin@supportdesk.dev |
| Agente | agent@supportdesk.dev |
| Cliente | customer@supportdesk.dev |

A senha padrao dos usuarios de exemplo esta definida no seed da API.

## Decisoes tecnicas

O projeto separa responsabilidades por workspace. A aplicacao web consome a API por uma camada de services, enquanto regras e schemas compartilhados ficam em `packages/shared`.

No frontend, TanStack Query cuida de cache, estados de carregamento e sincronizacao com a API. Zustand fica reservado para estado de UI e autenticacao local. Formularios usam React Hook Form com Zod para manter validacao previsivel.

Na API, os modulos seguem uma divisao simples entre rotas, controllers e services. Prisma centraliza o acesso ao banco e o Swagger documenta os endpoints disponiveis.

## Qualidade

Antes de publicar alteracoes, rode:

```bash
pnpm lint
pnpm test
pnpm build
```

Esses comandos validam tipos, testes e build de producao.
