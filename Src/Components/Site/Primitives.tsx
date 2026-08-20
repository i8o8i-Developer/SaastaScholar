import { cva, type VariantProps } from "class-variance-authority";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/Lib/Utils";

/* ---------------------------------- Reveal --------------------------------- */

export function Reveal({
  children,
  delay = 0,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section" | "article";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={cn("reveal", shown && "reveal-in", className)}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}

/* --------------------------------- Section --------------------------------- */

export function Section({
  id,
  children,
  className,
  tone = "default",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  tone?: "default" | "surface" | "deep";
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-20 border-t border-border py-14 sm:py-24 overflow-hidden",
        tone === "surface" && "bg-surface",
        tone === "deep" && "bg-primary-deep text-primary-foreground border-transparent",
        className,
      )}
    >
      <div className="mx-auto w-full max-w-[84rem] px-3.5 sm:px-8 min-w-0">{children}</div>
    </section>
  );
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "label-caps inline-flex items-center gap-1.5 text-[0.65rem] sm:text-[0.7rem] text-muted-foreground break-words",
        className,
      )}
    >
      <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
      <span>{children}</span>
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-3xl min-w-0",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="mt-4 text-2xl sm:text-4xl lg:text-[3.2rem] font-bold tracking-tight break-words leading-[1.12]">
        {title}
      </h2>
      {description ? (
        <p className="mt-3.5 text-xs sm:text-base leading-relaxed text-muted-foreground break-words">
          {description}
        </p>
      ) : null}
    </div>
  );
}

/* ---------------------------------- Button --------------------------------- */

const ctaVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 text-center max-w-full truncate",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary-deep hover:-translate-y-0.5 shadow-xs",
        outline:
          "border border-border-strong bg-card text-foreground hover:border-primary hover:text-primary",
        ghost: "text-foreground hover:bg-secondary",
        inverse:
          "bg-primary-foreground text-primary-deep hover:-translate-y-0.5 hover:opacity-95",
        link: "text-primary underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-8 sm:h-9 px-2.5 sm:px-3.5 text-xs",
        md: "h-10 sm:h-11 px-3.5 sm:px-5",
        lg: "h-11 sm:h-12 px-4 sm:px-6 text-xs sm:text-sm",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface CtaProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof ctaVariants> {}

export function Cta({ className, variant, size, ...props }: CtaProps) {
  return <a className={cn(ctaVariants({ variant, size }), className)} {...props} />;
}

/* ---------------------------------- Badge ---------------------------------- */

const pillVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2 sm:px-2.5 py-0.5 text-[0.65rem] sm:text-[0.7rem] font-semibold max-w-full break-words shrink-0",
  {
    variants: {
      tone: {
        neutral: "border-border bg-secondary text-muted-foreground",
        green: "border-primary/25 bg-accent text-accent-foreground",
        solid: "border-transparent bg-primary text-primary-foreground",
        warn: "border-highlight/40 bg-highlight/15 text-foreground",
        danger: "border-destructive/30 bg-destructive/10 text-destructive",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export function Pill({
  className,
  tone,
  children,
}: VariantProps<typeof pillVariants> & { className?: string; children: ReactNode }) {
  return <span className={cn(pillVariants({ tone }), className)}>{children}</span>;
}

/* ------------------------------- Mock window ------------------------------- */

export function MockWindow({
  title,
  children,
  className,
  actions,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl sm:rounded-2xl border border-border-strong bg-card shadow-[0_20px_60px_-35px_color-mix(in_oklab,var(--color-primary-deep)_40%,transparent)] min-w-0 max-w-full",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-surface px-3 py-2 sm:px-4 sm:py-2.5 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-border-strong" />
          <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-border-strong" />
          <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-primary/50" />
          <span className="label-caps ml-1.5 truncate text-[0.65rem] text-muted-foreground">
            {title}
          </span>
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      <div className="min-w-0 overflow-x-hidden">{children}</div>
    </div>
  );
}
