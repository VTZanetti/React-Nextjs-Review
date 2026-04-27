import type { TicketPriority } from "./enums";

export const SLA_HOURS_BY_PRIORITY: Record<TicketPriority, number> = {
  LOW: 72,
  MEDIUM: 48,
  HIGH: 24,
  CRITICAL: 4,
};

export type SlaStatus = "ON_TRACK" | "AT_RISK" | "BREACHED";

export function calculateSlaDueAt(priority: TicketPriority, from: Date = new Date()): Date {
  const hours = SLA_HOURS_BY_PRIORITY[priority];
  return new Date(from.getTime() + hours * 60 * 60 * 1000);
}

export function getSlaStatus(slaDueAt: Date | string, now: Date = new Date()): SlaStatus {
  const due = typeof slaDueAt === "string" ? new Date(slaDueAt) : slaDueAt;
  const diffMs = due.getTime() - now.getTime();
  const oneHour = 60 * 60 * 1000;

  if (diffMs <= 0) return "BREACHED";
  if (diffMs <= 4 * oneHour) return "AT_RISK";
  return "ON_TRACK";
}
