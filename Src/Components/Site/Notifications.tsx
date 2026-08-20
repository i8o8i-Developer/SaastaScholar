import { Bell } from "lucide-react";
import { useState } from "react";

import { cn } from "@/Lib/Utils";
import { MockWindow, Pill, Reveal, Section, SectionHeading } from "./Primitives";

type Filter = "Important" | "Academic" | "Exam" | "Assignment";

const FILTERS: Filter[] = ["Important", "Academic", "Exam", "Assignment"];

const FEED: {
  title: string;
  source: string;
  time: string;
  tags: Filter[];
  tone: "green" | "warn" | "neutral" | "danger";
  label: string;
}[] = [
  {
    title: "Mid-Semester Examination Timetable Released",
    source: "University Notice · Examination Cell",
    time: "32m ago",
    tags: ["Important", "Exam"],
    tone: "warn",
    label: "Exam",
  },
  {
    title: "Data Structures Assignment 3 Uploaded",
    source: "Faculty · Dr. Meera Raghav",
    time: "1h ago",
    tags: ["Academic", "Assignment"],
    tone: "green",
    label: "Assignment",
  },
  {
    title: "Tomorrow's 9:00 AM Maths Class Cancelled",
    source: "Section A Announcement",
    time: "3h ago",
    tags: ["Important", "Academic"],
    tone: "danger",
    label: "Cancellation",
  },
  {
    title: "AI Lab Record Submission Extended To 26 August",
    source: "Department Of CSE",
    time: "Yesterday",
    tags: ["Academic", "Assignment"],
    tone: "neutral",
    label: "Department",
  },
  {
    title: "Institute Holiday On 15 August",
    source: "University Notice",
    time: "2 days ago",
    tags: ["Important"],
    tone: "neutral",
    label: "Holiday",
  },
];

const TYPES = [
  "University Notices",
  "Department Notices",
  "Section Announcements",
  "Exam Notifications",
  "Assignment Deadlines",
  "Class Cancellations",
  "Holiday Notices",
];

export function Notifications() {
  const [active, setActive] = useState<Filter>("Important");
  const visible = FEED.filter((item) => item.tags.includes(active));

  return (
    <Section id="notifications" tone="surface">
      <div className="grid gap-14 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center">
        <Reveal>
          <SectionHeading
            eyebrow="Notification Center"
            title="Stop Checking Five Different Groups For One Notice."
            description="University, Department And Section Announcements Arrive In One Ordered Feed — Filtered To Your Academic Profile, Never To Someone Else's Batch."
          />
          <ul className="mt-9 flex flex-wrap gap-2">
            {TYPES.map((type) => (
              <li key={type}>
                <span className="inline-flex rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
                  {type}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={100}>
          <MockWindow
            title="Notification Feed"
            actions={
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Bell className="h-3.5 w-3.5 text-primary" /> 5 New
              </span>
            }
          >
            <div className="flex flex-wrap gap-2 border-b border-border p-3">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={active === f}
                  onClick={() => setActive(f)}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
                    active === f
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
            <ul className="divide-y divide-border">
              {visible.map((item, i) => (
                <li
                  key={item.title}
                  className="flex gap-3 px-4 py-4 transition-colors hover:bg-surface"
                  style={{ animation: `fade-in 0.4s ease-out ${i * 0.05}s both` }}
                >
                  <span
                    aria-hidden
                    className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <Pill tone={item.tone}>{item.label}</Pill>
                      <span className="text-xs text-muted-foreground">{item.time}</span>
                    </span>
                    <span className="mt-2 block text-sm font-semibold leading-snug">
                      {item.title}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {item.source}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="border-t border-border bg-surface px-4 py-3 text-xs text-muted-foreground">
              Showing {visible.length} Notices Tagged “{active}”
            </p>
          </MockWindow>
        </Reveal>
      </div>
    </Section>
  );
}
