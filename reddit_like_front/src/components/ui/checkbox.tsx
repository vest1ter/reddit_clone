import * as React from "react";
import { cn } from "./utils";

const Check = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
  </svg>
);

interface CheckboxProps extends Omit<React.ComponentProps<"input">, "type" | "onChange"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

function Checkbox({
  className,
  checked,
  onCheckedChange,
  ...props
}: CheckboxProps) {
  return (
    <div className="relative inline-flex items-center justify-center">
      <input
        type="checkbox"
        data-slot="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        className={cn(
          "peer size-4 shrink-0 rounded-[4px] border border-border bg-input-background appearance-none cursor-pointer transition-all outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 checked:bg-primary checked:border-primary",
          className,
        )}
        {...props}
      />
      <Check 
        className="absolute size-3.5 text-primary-foreground pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
      />
    </div>
  );
}

export { Checkbox };
