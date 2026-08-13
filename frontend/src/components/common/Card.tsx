import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import type{
  HTMLAttributes,
  ReactNode,
} from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "default" | "outlined" | "elevated";
  padding?: "none" | "sm" | "md" | "lg";
}

const variantClasses = {
  default: "border border-slate-200 bg-white shadow-sm",
  outlined: "border-2 border-slate-300 bg-white",
  elevated: "bg-white shadow-xl",
};

const paddingClasses = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

const Card = ({
  children,
  variant = "default",
  padding = "md",
  className,
  ...props
}: CardProps) => {
  return (
    <div
      className={twMerge(
        clsx(
          "rounded-2xl transition-all duration-200",
          variantClasses[variant],
          paddingClasses[padding]
        ),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface SectionProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const CardHeader = ({
  children,
  className,
  ...props
}: SectionProps) => (
  <div className={twMerge("mb-6", className)} {...props}>
    {children}
  </div>
);

export const CardContent = ({
  children,
  className,
  ...props
}: SectionProps) => (
  <div className={className} {...props}>
    {children}
  </div>
);

export const CardFooter = ({
  children,
  className,
  ...props
}: SectionProps) => (
  <div
    className={twMerge(
      "mt-6 flex items-center justify-end gap-3",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const CardTitle = ({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) => (
  <h2
    className={twMerge(
      "text-2xl font-bold text-slate-900",
      className
    )}
    {...props}
  />
);

export const CardDescription = ({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={twMerge(
      "mt-2 text-sm text-slate-500",
      className
    )}
    {...props}
  />
);

export default Card;