import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  title?: string;
  message?: string;
  className?: string;
  action?: React.ReactNode;
};

export function ErrorState({ title = "Ocorreu um erro", message, className, action }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center",
        className,
      )}
    >
      <AlertCircle className="mb-2 h-6 w-6 text-destructive" />
      <h3 className="text-base font-semibold text-destructive">{title}</h3>
      {message ? <p className="mt-1 text-sm text-muted-foreground">{message}</p> : null}
      {action ? <div className="mt-3">{action}</div> : null}
    </div>
  );
}
