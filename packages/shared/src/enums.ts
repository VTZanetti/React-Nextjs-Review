export const UserRole = {
  ADMIN: "ADMIN",
  AGENT: "AGENT",
  CUSTOMER: "CUSTOMER",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const TicketStatus = {
  OPEN: "OPEN",
  IN_PROGRESS: "IN_PROGRESS",
  WAITING_CUSTOMER: "WAITING_CUSTOMER",
  RESOLVED: "RESOLVED",
  CANCELLED: "CANCELLED",
} as const;
export type TicketStatus = (typeof TicketStatus)[keyof typeof TicketStatus];

export const TicketPriority = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
} as const;
export type TicketPriority = (typeof TicketPriority)[keyof typeof TicketPriority];

export const TicketCategory = {
  SISTEMA: "SISTEMA",
  FINANCEIRO: "FINANCEIRO",
  ACESSO: "ACESSO",
  BUG: "BUG",
  SOLICITACAO: "SOLICITACAO",
  INTEGRACAO: "INTEGRACAO",
  NOTA_FISCAL: "NOTA_FISCAL",
  OUTRO: "OUTRO",
} as const;
export type TicketCategory = (typeof TicketCategory)[keyof typeof TicketCategory];

export const TICKET_CATEGORY_LABELS: Record<TicketCategory, string> = {
  SISTEMA: "Sistema",
  FINANCEIRO: "Financeiro",
  ACESSO: "Acesso",
  BUG: "Bug",
  SOLICITACAO: "Solicitação",
  INTEGRACAO: "Integração",
  NOTA_FISCAL: "Nota Fiscal",
  OUTRO: "Outro",
};

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: "Aberto",
  IN_PROGRESS: "Em atendimento",
  WAITING_CUSTOMER: "Aguardando cliente",
  RESOLVED: "Resolvido",
  CANCELLED: "Cancelado",
};

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  CRITICAL: "Crítica",
};

export const CustomerStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
} as const;
export type CustomerStatus = (typeof CustomerStatus)[keyof typeof CustomerStatus];

export const KnowledgeVisibility = {
  PUBLIC: "PUBLIC",
  INTERNAL: "INTERNAL",
} as const;
export type KnowledgeVisibility = (typeof KnowledgeVisibility)[keyof typeof KnowledgeVisibility];

export const TicketEventType = {
  CREATED: "CREATED",
  STATUS_CHANGED: "STATUS_CHANGED",
  PRIORITY_CHANGED: "PRIORITY_CHANGED",
  ASSIGNED: "ASSIGNED",
  MESSAGE_SENT: "MESSAGE_SENT",
  RESOLVED: "RESOLVED",
  REOPENED: "REOPENED",
  CANCELLED: "CANCELLED",
} as const;
export type TicketEventType = (typeof TicketEventType)[keyof typeof TicketEventType];
