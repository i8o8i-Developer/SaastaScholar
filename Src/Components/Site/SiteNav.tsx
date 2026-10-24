import { Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";

import { useTheme } from "@/Hooks/UseTheme";
import { cn } from "@/Lib/Utils";
import { Cta } from "./Primitives";

const NAV_ITEMS = [
  { label: "Features", href: "#features" },
  { label: "Notes & PYQs", href: "#academic-hub" },
  { label: "Homework AI", href: "#assignments" },
  { label: "Practicals", href: "#practicals" },
  { label: "Notices", href: "#notifications" },
  { label: "Timetable", href: "#planner" },
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

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.replace("#", "");
      if (targetId === "top") {
        window.scrollTo({ top: 0, behavior: "smooth" });
        setOpen(false);
        return;
      }
      const element = document.getElementById(targetId);
      if (element) {
        const navHeight = scrolled ? 58 : 68;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = Math.max(0, elementPosition - navHeight);
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
        window.history.pushState(null, "", href);
        setOpen(false);
      }
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-all duration-300",
        scrolled
          ? "border-border bg-background/95 backdrop-blur-md shadow-xs"
          : "border-transparent bg-background/95 backdrop-blur-md",
      )}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-[84rem] items-center justify-between px-2.5 min-[340px]:px-4 sm:px-6 xl:px-8 transition-all duration-300",
          scrolled ? "h-14" : "h-16 sm:h-20",
        )}
      >
        <a
          href="#top"
          onClick={(e) => handleNavClick(e, "#top")}
          className="flex items-center gap-1.5 min-[340px]:gap-2.5 shrink-0 whitespace-nowrap group"
          aria-label="SaastaScholar Home"
        >
          <img
            src="/SaastaScholar.png"
            alt="SaastaScholar Logo"
            width="34"
            height="34"
            className="h-7 w-7 min-[340px]:h-8 min-[340px]:w-8 sm:h-9 sm:w-9 object-contain rounded-xl p-0.5 bg-white border border-border/60 shadow-2xs transition-transform group-hover:scale-105 shrink-0"
          />
          <div className="flex flex-col min-w-0">
            <span className="font-display text-base min-[340px]:text-lg sm:text-xl font-bold tracking-tight whitespace-nowrap text-logo-gradient">
              SaastaScholar
            </span>
            <span className="text-[0.62rem] font-bold tracking-wider text-muted-foreground uppercase leading-none hidden sm:inline">
              Academic Portal
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links — Only On XL Screens To Prevent Any Overlap */}
        <nav aria-label="Primary" className="hidden xl:block min-w-0">
          <ul className="flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <li key={item.href} className="shrink-0">
                <a
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="rounded-xl px-3 py-2 text-xs xl:text-sm font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground whitespace-nowrap inline-block"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Desktop Right Action Buttons */}
        <div className="hidden xl:flex items-center gap-2.5 shrink-0">
          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-border bg-surface text-foreground hover:bg-card cursor-pointer transition-all shadow-2xs"
            title={isDark ? "Switch To Light Mode" : "Switch To Dark Mode"}
          >
            {isDark ? (
              <Sun className="h-4 w-4 text-amber-400 hover:rotate-45 transition-transform" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700 hover:-rotate-12 transition-transform" />
            )}
          </button>

          <Cta href="/login" variant="ghost" size="sm" className="whitespace-nowrap shrink-0 text-xs xl:text-sm px-3.5">
            Log In
          </Cta>
          <Cta href="/login?mode=signup" size="sm" className="whitespace-nowrap shrink-0 text-xs xl:text-sm px-4">
            Get Started
          </Cta>
        </div>

        {/* Mobile & Tablet Header Controls (Shown Below XL Breakpoint Including 1055px) */}
        <div className="flex items-center gap-1.5 min-[340px]:gap-2 xl:hidden shrink-0">
          <button
            type="button"
            onClick={toggleTheme}
            className="grid h-8 w-8 min-[340px]:h-9 min-[340px]:w-9 place-items-center rounded-xl border border-border bg-surface text-foreground"
            title={isDark ? "Switch To Light Mode" : "Switch To Dark Mode"}
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
          </button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close Menu" : "Open Menu"}
            className="grid h-8 w-8 min-[340px]:h-9 min-[340px]:w-9 place-items-center rounded-xl border border-border text-foreground hover:bg-surface cursor-pointer transition-colors"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Slide-Down Mobile Drawer Menu */}
      {open ? (
        <div className="border-t border-border bg-background xl:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <nav aria-label="Mobile Navigation" className="mx-auto max-w-[84rem] px-5 py-4 sm:px-8">
            <ul className="grid gap-1">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={(e) => {
                      setOpen(false);
                      handleNavClick(e, item.href);
                    }}
                    className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-4 grid grid-cols-2 gap-2.5 pt-3 border-t border-border/80">
              <Cta href="/login" variant="outline" size="sm" onClick={() => setOpen(false)} className="w-full text-center">
                Log In
              </Cta>
              <Cta href="/login?mode=signup" size="sm" onClick={() => setOpen(false)} className="w-full text-center">
                Get Started
              </Cta>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
