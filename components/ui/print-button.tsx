"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PrintButtonProps {
  label?: string;
  className?: string;
}

export function PrintButton({ label = "Print / Save PDF", className }: PrintButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => window.print()}
      data-print-hide="true"
      className={className}
    >
      <Printer className="w-4 h-4 mr-1.5" />
      {label}
    </Button>
  );
}
