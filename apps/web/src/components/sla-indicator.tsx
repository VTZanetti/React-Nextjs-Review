import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getSlaStatus } from "@supportdesk/shared";
import { formatDateTime } from "@/lib/utils";

export function SlaIndicator({ slaDueAt }: { slaDueAt: string }) {
  const status = getSlaStatus(slaDueAt);

  if (status === "BREACHED") {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertTriangle className="h-3 w-3" /> SLA vencido
      </Badge>
    );
  }
  if (status === "AT_RISK") {
    return (
      <Badge variant="warning" className="gap-1">
        <Clock className="h-3 w-3" /> Próx. vencimento
      </Badge>
    );
  }
  return (
    <Badge variant="success" className="gap-1">
      <CheckCircle2 className="h-3 w-3" /> Dentro do prazo
    </Badge>
  );
}

export function SlaDueLine({ slaDueAt }: { slaDueAt: string }) {
  return (
    <span className="text-xs text-muted-foreground">
      Vence em {formatDateTime(slaDueAt)}
    </span>
  );
}
