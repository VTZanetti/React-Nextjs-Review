import Link from "next/link";
import { Plus } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
  label?: string;
  iconOnly?: boolean;
};

/**
 * Single source of truth for the "Novo chamado" CTA. Use everywhere instead
 * of inlining `<Button asChild><Link href="/dashboard/tickets/new">...`.
 */
export function NewTicketButton({
  variant = "default",
  size = "default",
  className,
  label = "Novo chamado",
  iconOnly = false,
}: Props) {
  return (
    <Button asChild variant={variant} size={iconOnly ? "icon" : size} className={className}>
      <Link
        href="/dashboard/tickets/new"
        aria-label={iconOnly ? label : undefined}
        className={cn(iconOnly ? "" : "inline-flex items-center")}
      >
        <Plus className={cn("h-4 w-4", iconOnly ? "" : "mr-2")} />
        {iconOnly ? null : label}
      </Link>
    </Button>
  );
}
