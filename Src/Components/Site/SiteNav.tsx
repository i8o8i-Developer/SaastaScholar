import { Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";

import { useTheme } from "@/Hooks/UseTheme";
import { cn } from "@/Lib/Utils";
import { Cta } from "./Primitives";

const NAV_ITEMS = [
  { label: "Features", href: "#features" },
  { label: "Academic Hub", href: "#academic-hub" },
  { label: "Assignments", href: "#assignments" },
  { label: "Practicals", href: "#practicals" },
  { label: "Notifications", href: "#notifications" },
  { label: "Planner", href: "#planner" },
  { label: "Pricing", href: "#pricing" },
];

export function SiteNav() {
  const { isDark, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-all duration-300",
        scrolled
          ? "border-border bg-background/85 backdrop-blur-md"
          : "border-transparent bg-background",
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-[84rem] items-center justify-between px-5 transition-all duration-300 sm:px-8",
          scrolled ? "h-14" : "h-20",
        )}
      >
        <a href="#top" className="flex items-center gap-2.5" aria-label="NimsWallah Home">
          <img
            src="/NIMSWallah.png?v=2"
            alt="NimsWallah Logo"
            className="h-8 w-8 object-contain rounded-md"
          />
          <span className="font-display text-lg font-bold tracking-tight">NimsWallah</span>
        </a>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden items-center gap-2.5 lg:flex">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-surface text-foreground hover:bg-card cursor-pointer transition-all shadow-2xs"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700 hover:-rotate-12 transition-transform" />
            )}
          </button>

          <Cta href="/login" variant="ghost" size="sm">
            Log In
          </Cta>
          <Cta href="/login?mode=signup" size="sm">
            Get Started
          </Cta>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            onClick={toggleTheme}
            className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-surface text-foreground"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
          </button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="grid h-9 w-9 place-items-center rounded-xl border border-border text-foreground"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border bg-background lg:hidden">
          <nav aria-label="Mobile" className="mx-auto max-w-[84rem] px-5 py-4 sm:px-8">
            <ul className="grid gap-1">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-md px-3 py-3 text-base font-medium text-foreground hover:bg-secondary"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-4 grid gap-2 pb-2">
              <Cta href="/login" variant="outline" size="lg" onClick={() => setOpen(false)}>
                Log In
              </Cta>
              <Cta href="/login?mode=signup" size="lg" onClick={() => setOpen(false)}>
                Get Started
              </Cta>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
