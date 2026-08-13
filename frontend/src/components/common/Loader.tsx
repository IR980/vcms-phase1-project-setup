import clsx from "clsx";
import { Loader2 } from "lucide-react";

interface LoaderProps {
  size?: "sm" | "md" | "lg" | "xl";

  fullScreen?: boolean;

  overlay?: boolean;

  text?: string;

  className?: string;
}

const sizeClasses = {
  sm: "h-4 w-4",

  md: "h-6 w-6",

  lg: "h-8 w-8",

  xl: "h-12 w-12",
};

const Loader = ({
  size = "md",

  fullScreen = false,

  overlay = false,

  text,

  className,
}: LoaderProps) => {
  const content = (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center gap-3"
    >
      <Loader2
        className={clsx(
          "animate-spin text-blue-600",
          sizeClasses[size],
          className
        )}
      />

      {text && (
        <p className="text-sm text-slate-600">
          {text}
        </p>
      )}

      <span className="sr-only">
        Loading...
      </span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        {content}
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 z-40 flex items-center justify-center rounded-xl bg-white/70 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};

export default Loader;