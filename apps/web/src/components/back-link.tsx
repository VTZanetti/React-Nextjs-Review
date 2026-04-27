import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  label?: string;
  className?: string;
};

/**
 * Standard "Voltar" link used at the top of detail pages.
 */
export function BackLink({ href, label = "Voltar", className }: Props) {
  return (
    <Button asChild variant="ghost" size="sm" className={cn("-ml-2", className)}>
      <Link href={href}>
        <ArrowLeft className="mr-2 h-4 w-4" /> {label}
      </Link>
    </Button>
  );
}
