import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
interface LoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "brand" | "white";
  className?: string;
  text?: string;
  fullScreen?: boolean;
}
const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};
const variantClasses = {
  default: "text-gray-600 dark:text-gray-400",
  brand: "text-brand-500",
  white: "text-white",
};
export function Loader({
  size = "md",
  variant = "brand",
  className,
  text,
  fullScreen = false,
}: LoaderProps) {
  const sizeClass = sizeClasses[size];
  const variantClass = variantClasses[variant];
  const loaderContent = (
    <div role="status" className={cn("flex flex-col items-center justify-center gap-3", className)}>
      <Loader2 className={cn("animate-spin", sizeClass, variantClass)} />
      {text && (
        <p
          className={cn(
            "text-sm font-medium",
            variant === "white" ? "text-white" : "text-gray-600 dark:text-gray-400"
          )}
        >
          {text}
        </p>
      )}
    </div>
  );
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        {loaderContent}
      </div>
    );
  }
  return loaderContent;
}
export function SkeletonLoader({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse space-y-4", className)}>
      <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="h-4 rounded bg-gray-200 dark:bg-gray-700"></div>
      <div className="h-4 w-5/6 rounded bg-gray-200 dark:bg-gray-700"></div>
    </div>
  );
}
export function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
      <div className="space-y-4">
        <div className="h-4 w-1/4 rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-8 w-1/2 rounded bg-gray-200 dark:bg-gray-700"></div>
        <div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700"></div>
      </div>
    </div>
  );
}
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex animate-pulse gap-4">
          <div className="h-4 flex-1 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700"></div>
        </div>
      ))}
    </div>
  );
}
