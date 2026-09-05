import { format, isSameDay, isYesterday } from "date-fns";
import type { Currency } from "./types";

export function formatMoney(amount: number, currency: Currency) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDuration(totalMinutes: number) {
  const minutes = Math.max(0, Math.round(totalMinutes));
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function formatTime(at: number) {
  return format(at, "HH:mm");
}

export function formatDayLabel(at: number, now = Date.now()) {
  const d = new Date(at);
  if (isSameDay(d, now)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "EEE d MMM");
}

export function formatRelativeAgo(at: number, now = Date.now()) {
  const diff = Math.max(0, now - at);
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24 && isSameDay(at, now)) {
    const m = minutes % 60;
    return m === 0 ? `${hours}h ago` : `${hours}h ${m}m ago`;
  }
  return `${formatDayLabel(at, now)} ${formatTime(at)}`;
}

export function plural(n: number, one: string, many = `${one}s`) {
  return n === 1 ? one : many;
}
