import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ExternalLink, Image as ImageIcon } from "lucide-react";
import { cn } from "@/Lib/Utils";

interface MarkdownContentProps {
  content: string;
  className?: string;
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  if (!content) return null;

  return (
    <div
      className={cn(
        "prose prose-sm dark:prose-invert max-w-none text-foreground/90 leading-relaxed font-sans",
        "break-words overflow-hidden",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, href, children, ...props }) => {
            const isExternal = href?.startsWith("http://") || href?.startsWith("https://");
            return (
              <a
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 underline underline-offset-2 decoration-emerald-500/50 hover:decoration-emerald-500 transition-colors"
                {...props}
              >
                <span>{children}</span>
                {isExternal && <ExternalLink className="h-3 w-3 inline-block shrink-0 opacity-80" />}
              </a>
            );
          },
          img: ({ node, src, alt, ...props }) => {
            return (
              <span className="block my-3 rounded-2xl overflow-hidden border border-border/80 bg-surface/50 p-1 shadow-md max-w-full">
                <img
                  src={src}
                  alt={alt || "Notice Asset"}
                  loading="lazy"
                  className="rounded-xl max-h-96 w-full object-contain mx-auto bg-card"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                  {...props}
                />
                {alt && (
                  <span className="block text-center text-[0.68rem] text-muted-foreground mt-1.5 font-mono italic">
                    {alt}
                  </span>
                )}
              </span>
            );
          },
          p: ({ node, children, ...props }) => (
            <p className="my-1.5 leading-relaxed text-xs sm:text-sm text-foreground/90" {...props}>
              {children}
            </p>
          ),
          h1: ({ node, children, ...props }) => (
            <h1 className="font-display text-base sm:text-lg font-bold text-foreground mt-3 mb-1.5 leading-snug" {...props}>
              {children}
            </h1>
          ),
          h2: ({ node, children, ...props }) => (
            <h2 className="font-display text-sm sm:text-base font-bold text-foreground mt-2.5 mb-1 leading-snug" {...props}>
              {children}
            </h2>
          ),
          h3: ({ node, children, ...props }) => (
            <h3 className="font-display text-xs sm:text-sm font-bold text-foreground mt-2 mb-1" {...props}>
              {children}
            </h3>
          ),
          ul: ({ node, children, ...props }) => (
            <ul className="my-2 list-disc list-inside space-y-1 text-xs sm:text-sm text-foreground/90 pl-1" {...props}>
              {children}
            </ul>
          ),
          ol: ({ node, children, ...props }) => (
            <ol className="my-2 list-decimal list-inside space-y-1 text-xs sm:text-sm text-foreground/90 pl-1" {...props}>
              {children}
            </ol>
          ),
          li: ({ node, children, ...props }) => (
            <li className="leading-relaxed" {...props}>
              {children}
            </li>
          ),
          blockquote: ({ node, children, ...props }) => (
            <blockquote
              className="my-2.5 border-l-3 border-emerald-500/80 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-r-xl px-3 py-2 text-xs sm:text-sm text-foreground/80 italic"
              {...props}
            >
              {children}
            </blockquote>
          ),
          code: ({ node, className, children, ...props }: any) => {
            const isInline = !className?.includes("language-");
            if (isInline) {
              return (
                <code
                  className="rounded-md bg-surface border border-border/80 px-1.5 py-0.5 font-mono text-[0.75rem] text-emerald-600 dark:text-emerald-400 font-semibold"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <pre className="my-2.5 rounded-2xl border border-border/80 bg-surface/90 p-3 font-mono text-xs overflow-x-auto text-foreground">
                <code {...props}>{children}</code>
              </pre>
            );
          },
          table: ({ node, children, ...props }) => (
            <div className="my-3 overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-xs border-collapse" {...props}>
                {children}
              </table>
            </div>
          ),
          th: ({ node, children, ...props }) => (
            <th className="border-b border-border bg-surface px-3 py-2 font-bold text-foreground font-mono text-[0.7rem] uppercase tracking-wider" {...props}>
              {children}
            </th>
          ),
          td: ({ node, children, ...props }) => (
            <td className="border-b border-border/60 px-3 py-2 text-muted-foreground" {...props}>
              {children}
            </td>
          ),
          hr: ({ node, ...props }) => <hr className="my-3 border-border/80" {...props} />,
          strong: ({ node, children, ...props }) => (
            <strong className="font-bold text-foreground" {...props}>
              {children}
            </strong>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
