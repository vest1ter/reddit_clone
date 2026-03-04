import * as React from "react";
import { cn } from "./utils";

const badgeVariants = {
  variant: {
    default:
      "border-transparent bg-primary text-primary-foreground hover:bg-primary/90",
    secondary:
      "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/90",
    destructive:
      "border-transparent bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
    outline:
      "text-foreground hover:bg-accent hover:text-accent-foreground",
  },
};

interface BadgeProps extends React.ComponentProps<"span"> {
  variant?: keyof typeof badgeVariants.variant;
}

function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex items-center justify-center rounded-md border px-2 py-0.5 whitespace-nowrap shrink-0 transition-colors overflow-hidden",
        badgeVariants.variant[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
