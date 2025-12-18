import * as React from "react";
import { cn } from "@/lib/utils";
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "ring-offset-background file:text-foreground placeholder:text-muted-foreground flex h-10 w-full rounded-xl border-2 border-gray-100 bg-white px-3 py-2 text-base text-gray-900 transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:border-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus-visible:border-brand-400 dark:focus-visible:ring-brand-400/20 dark:disabled:bg-gray-800/50 md:text-sm",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
export { Input };
