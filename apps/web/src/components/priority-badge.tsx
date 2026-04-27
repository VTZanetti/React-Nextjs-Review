import { Badge } from "@/components/ui/badge";
import { TICKET_PRIORITY_LABELS, type TicketPriority } from "@supportdesk/shared";

const PRIORITY_VARIANT: Record<TicketPriority, "muted" | "info" | "warning" | "destructive"> = {
  LOW: "muted",
  MEDIUM: "info",
  HIGH: "warning",
  CRITICAL: "destructive",
};

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  return <Badge variant={PRIORITY_VARIANT[priority]}>{TICKET_PRIORITY_LABELS[priority]}</Badge>;
}
