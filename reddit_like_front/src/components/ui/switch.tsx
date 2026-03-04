import * as React from "react";
import { cn } from "./utils";

interface SwitchProps extends Omit<React.ComponentProps<"input">, "type" | "onChange"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

function Switch({
  className,
  checked,
  onCheckedChange,
  ...props
}: SwitchProps) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange?.(e.target.checked)}
        className="sr-only peer"
        {...props}
      />
      <div
        data-slot="switch"
        className={cn(
          "peer inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent transition-all outline-none peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 peer-checked:bg-primary peer-unchecked:bg-switch-background dark:peer-unchecked:bg-input/80",
          className,
        )}
      >
        <div
          data-slot="switch-thumb"
          className="bg-card dark:peer-unchecked:bg-card-foreground dark:peer-checked:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform peer-checked:translate-x-[calc(100%-2px)] peer-unchecked:translate-x-0"
        />
      </div>
    </label>
  );
}

export { Switch };
