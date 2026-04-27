import { vi } from "vitest";

/**
 * Minimal Prisma mock used by service-level unit tests. Each test wires up
 * the precise responses it needs through `mockResolvedValueOnce` /
 * `mockResolvedValue`.
 */
export function createPrismaMock() {
  const mock = {
    ticket: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    customer: {
      findUnique: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
    ticketMessage: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    ticketEvent: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    $transaction: vi.fn(async (fn: (tx: unknown) => unknown) => fn(mock)),
  };
  return mock;
}

export type PrismaMock = ReturnType<typeof createPrismaMock>;

export const adminUser = {
  sub: "user-admin-1",
  role: "ADMIN" as const,
  email: "admin@supportdesk.dev",
  name: "Ana Admin",
};

export const agentUser = {
  sub: "user-agent-1",
  role: "AGENT" as const,
  email: "agent@supportdesk.dev",
  name: "Bruno Atendente",
};

export const customerUser = {
  sub: "user-customer-1",
  role: "CUSTOMER" as const,
  email: "cliente@supportdesk.dev",
  name: "Carla Cliente",
};

export const customerUserOther = {
  sub: "user-customer-2",
  role: "CUSTOMER" as const,
  email: "outro@supportdesk.dev",
  name: "Outro Cliente",
};

export function ticketFixture(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "ticket-1",
    protocol: "SD-20260427-AAAA",
    title: "Test ticket",
    description: "Lorem ipsum",
    status: "OPEN",
    priority: "MEDIUM",
    category: "OUTRO",
    customerId: "customer-1",
    assigneeId: null,
    slaDueAt: new Date("2026-04-29T00:00:00Z"),
    resolvedAt: null,
    createdAt: new Date("2026-04-27T00:00:00Z"),
    updatedAt: new Date("2026-04-27T00:00:00Z"),
    customer: { id: "customer-1", name: "Carla", company: "Acme", email: "carla@acme.com" },
    assignee: null,
    ...overrides,
  };
}
