import { Badge } from "@/components/ui/badge";
import { TICKET_STATUS_LABELS, type TicketStatus } from "@supportdesk/shared";

const STATUS_VARIANT: Record<TicketStatus, "info" | "warning" | "success" | "muted" | "destructive"> = {
  OPEN: "info",
  IN_PROGRESS: "warning",
  WAITING_CUSTOMER: "muted",
  RESOLVED: "success",
  CANCELLED: "destructive",
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{TICKET_STATUS_LABELS[status]}</Badge>;
}
