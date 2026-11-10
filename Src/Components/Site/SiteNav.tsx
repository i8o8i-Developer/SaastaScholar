import { Award, Bell, BookOpen, Calendar, ChevronRight, Code2, FlaskConical, Menu, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/Lib/Utils";
import { Cta } from "./Primitives";

const NAV_ITEMS = [
  { label: "Features", desc: "Core Study Workspace", href: "#features", icon: Sparkles },
  { label: "Notes & PYQs", desc: "Handwritten PDFs & Papers", href: "#academic-hub", icon: BookOpen },
  { label: "Homework AI", desc: "Coursework & AI Outline", href: "#assignments", icon: Code2 },
  { label: "Practicals", desc: "Lab Manuals & Viva Q&A", href: "#practicals", icon: FlaskConical },
  { label: "Notices", desc: "Official Campus Circulars", href: "#notifications", icon: Bell },
  { label: "Timetable", desc: "Daily Classes & Exam Dates", href: "#planner", icon: Calendar },
  { label: "Pricing", desc: "Flexible Scholar Plans", href: "#pricing", icon: Award },
];

export function SiteNav() {
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
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Close Menu" : "Open Menu"}
            className="grid h-8 w-8 min-[340px]:h-9 min-[340px]:w-9 place-items-center rounded-xl border border-border text-foreground hover:bg-surface cursor-pointer transition-colors"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Slide-Down Mobile & Tablet Menu */}
      {open ? (
        <div className="border-t border-white/[0.08] bg-[#0b0c0f]/98 backdrop-blur-xl shadow-[0_24px_60px_rgba(0,0,0,0.7)] xl:hidden max-h-[calc(100dvh-4.5rem)] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
          <nav aria-label="Mobile Navigation" className="mx-auto max-w-[84rem] px-4 py-5 sm:px-8 space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-[0.68rem] font-bold uppercase tracking-widest text-muted-foreground">
                Explore Platform
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[0.65rem] font-bold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Academic Portal
              </span>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      onClick={(e) => {
                        setOpen(false);
                        handleNavClick(e, item.href);
                      }}
                      className="group flex items-center justify-between gap-3 rounded-2xl border border-white/[0.07] bg-[#121317] p-3 text-left transition-all duration-200 hover:border-emerald-500/35 hover:bg-emerald-500/[0.06] active:scale-[0.98]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-zinc-950 transition-colors">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="block text-xs sm:text-sm font-bold text-foreground truncate group-hover:text-emerald-300 transition-colors">
                            {item.label}
                          </span>
                          <span className="block text-[0.68rem] text-muted-foreground truncate">
                            {item.desc}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                    </a>
                  </li>
                );
              })}
            </ul>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-white/[0.08]">
              <p className="text-xs text-muted-foreground hidden sm:block">
                Instant Access To Verified Handwritten Notes, Solved PYQs &amp; Daily Timetables.
              </p>
              <div className="grid grid-cols-2 sm:flex items-center gap-2.5 sm:ml-auto">
                <Cta
                  href="/login"
                  variant="outline"
                  size="sm"
                  onClick={() => setOpen(false)}
                  className="w-full sm:w-auto sm:min-w-[130px] text-center"
                >
                  Log In
                </Cta>
                <Cta
                  href="/login?mode=signup"
                  size="sm"
                  onClick={() => setOpen(false)}
                  className="w-full sm:w-auto sm:min-w-[150px] text-center"
                >
                  Get Started
                </Cta>
              </div>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
