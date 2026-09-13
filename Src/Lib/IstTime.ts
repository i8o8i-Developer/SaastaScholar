import { useEffect, useState } from "react";

export type WeekdayCode = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export const WEEKDAYS: WeekdayCode[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const WEEKDAY_NAMES: Record<WeekdayCode, string> = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};


export function getNow(): Date {
  return new Date();
}

export function getIstWeekdayCode(date: Date = new Date()): WeekdayCode {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Kolkata",
      weekday: "short",
    });
    const shortName = formatter.format(date).slice(0, 3);
    const match = WEEKDAYS.find((d) => d.toLowerCase() === shortName.toLowerCase());
    return match || "Mon";
  } catch {
    const utcMs = date.getTime() + date.getTimezoneOffset() * 60000;
    const istDate = new Date(utcMs + 5.5 * 3600000);
    const map: WeekdayCode[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return map[istDate.getDay()] || "Mon";
  }
}

export function getIstWeekdayName(date: Date = new Date()): string {
  const code = getIstWeekdayCode(date);
  return WEEKDAY_NAMES[code] || "Today";
}

export function formatIstTime(date: Date = new Date(), includeSeconds = true): string {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      ...(includeSeconds ? { second: "2-digit" } : {}),
      hour12: true,
    }).format(date);
  } catch {
    return date.toLocaleTimeString("en-IN", { hour12: true });
  }
}

export function getIst24HourTime(date: Date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(date);
    const hour = parts.find((p) => p.type === "hour")?.value || "00";
    const minute = parts.find((p) => p.type === "minute")?.value || "00";
    return `${hour}:${minute}`;
  } catch {
    const utcMs = date.getTime() + date.getTimezoneOffset() * 60000;
    const istDate = new Date(utcMs + 5.5 * 3600000);
    return istDate.toTimeString().slice(0, 5);
  }
}

export function formatIstDate(date: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return date.toLocaleDateString("en-IN");
  }
}

export function getIstDateIso(date: Date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(date);
    const year = parts.find((p) => p.type === "year")?.value || "2026";
    const month = parts.find((p) => p.type === "month")?.value || "01";
    const day = parts.find((p) => p.type === "day")?.value || "01";
    return `${year}-${month}-${day}`;
  } catch {
    const utcMs = date.getTime() + date.getTimezoneOffset() * 60000;
    const istDate = new Date(utcMs + 5.5 * 3600000);
    return istDate.toISOString().split("T")[0] ?? "";
  }
}

export function useIstClock() {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    // Initial sync
    setNow(new Date());

    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const timeString = formatIstTime(now, true);
  const timeShortString = formatIstTime(now, false);
  const dateString = formatIstDate(now);
  const weekdayCode = getIstWeekdayCode(now);
  const weekdayName = getIstWeekdayName(now);
  const current24HourTime = getIst24HourTime(now);
  const dateIso = getIstDateIso(now);

  return {
    now,
    timeString,
    timeShortString,
    dateString,
    weekdayCode,
    weekdayName,
    current24HourTime,
    dateIso,
  };
}
