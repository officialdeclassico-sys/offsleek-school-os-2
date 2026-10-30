import { useEffect, useState } from 'react';

export const IST_TIMEZONE = 'Asia/Kolkata';

/**
 * Shared refresh interval (30 seconds) for dynamically updating relative timestamps.
 */
const RELATIVE_TIME_REFRESH_MS = 30_000;

export interface FirestoreTimestampLike {
  toDate?: () => Date;
  seconds?: number;
  nanoseconds?: number;
  _seconds?: number;
  _nanoseconds?: number;
}

export type TimestampInput =
  | string
  | number
  | Date
  | FirestoreTimestampLike
  | null
  | undefined;

/**
 * Returns the current date in Asia/Kolkata timezone formatted as YYYY-MM-DD (for date inputs & records).
 */
export function getTodayDateIST(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const year = parts.find((p) => p.type === 'year')?.value ?? '';
  const month = parts.find((p) => p.type === 'month')?.value ?? '';
  const day = parts.find((p) => p.type === 'day')?.value ?? '';
  return `${year}-${month}-${day}`;
}

/**
 * Returns a date offset by `daysToAdd` days from now in Asia/Kolkata timezone formatted as YYYY-MM-DD.
 */
export function getFutureDateIST(daysToAdd: number, baseDate: Date = new Date()): string {
  const target = new Date(baseDate.getTime() + daysToAdd * 86400000);
  return getTodayDateIST(target);
}

/**
 * Returns the current 4-digit year in Asia/Kolkata timezone.
 */
export function getCurrentYearIST(date: Date = new Date()): number {
  const yearStr = new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    year: 'numeric',
  }).format(date);
  return Number(yearStr);
}

/**
 * Returns the current time in Asia/Kolkata timezone (e.g., "07:35 PM").
 */
export function getCurrentTimeIST(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
    .format(date)
    .toUpperCase();
}

/**
 * Returns the time-of-day greeting ("Good morning", "Good afternoon", "Good evening") in Asia/Kolkata timezone.
 */
export function getGreetingIST(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: IST_TIMEZONE,
    hour: 'numeric',
    hour12: false,
  }).formatToParts(date);
  const hourStr = parts.find((p) => p.type === 'hour')?.value ?? '0';
  const hour = Number(hourStr) % 24;

  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Returns a formatted current day, date, month, year, hour, and minute string in Asia/Kolkata timezone
 * (e.g., "Thursday, 29 Oct 2026 · 07:35 PM IST").
 */
export function getDashboardDateTimeLabelIST(date: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: IST_TIMEZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).formatToParts(date);

  const weekday = parts.find((p) => p.type === 'weekday')?.value ?? '';
  const day = parts.find((p) => p.type === 'day')?.value ?? '';
  const month = parts.find((p) => p.type === 'month')?.value ?? '';
  const year = parts.find((p) => p.type === 'year')?.value ?? '';
  const time = getCurrentTimeIST(date);

  return `${weekday}, ${day} ${month} ${year} · ${time} IST`;
}

/**
 * Formats an ISO string, unix timestamp, or Date into a readable Asia/Kolkata date string (e.g., "29 Oct 2026").
 */
export function formatDateIST(value: string | number | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en-GB', {
    timeZone: IST_TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Formats an ISO string or Date into a readable Asia/Kolkata date-time string.
 */
export function formatDateTimeIST(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIMEZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

/**
 * Safely parses a Firestore Timestamp, Date object, ISO date string, or Unix timestamp (seconds or ms)
 * into epoch milliseconds. Returns null if missing or invalid.
 */
export function parseTimestampToMs(input: TimestampInput): number | null {
  if (input === null || input === undefined || input === '') {
    return null;
  }

  if (input instanceof Date) {
    const ms = input.getTime();
    return Number.isFinite(ms) ? ms : null;
  }

  if (typeof input === 'number') {
    if (!Number.isFinite(input) || input <= 0) return null;
    // Values under 1e11 are Unix timestamps in seconds; otherwise milliseconds
    return input < 1e11 ? Math.round(input * 1000) : Math.round(input);
  }

  if (typeof input === 'object') {
    if (typeof input.toDate === 'function') {
      try {
        const d = input.toDate();
        if (d instanceof Date && Number.isFinite(d.getTime())) {
          return d.getTime();
        }
      } catch {
        return null;
      }
    }
    const secs = typeof input.seconds === 'number'
      ? input.seconds
      : typeof input._seconds === 'number'
      ? input._seconds
      : null;
    const nanos = typeof input.nanoseconds === 'number'
      ? input.nanoseconds
      : typeof input._nanoseconds === 'number'
      ? input._nanoseconds
      : 0;

    if (secs !== null && Number.isFinite(secs)) {
      return Math.round(secs * 1000 + nanos / 1e6);
    }
    return null;
  }

  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) return null;

    // Pure numeric string (Unix timestamp)
    if (/^\d+$/.test(trimmed)) {
      const num = Number(trimmed);
      if (!Number.isFinite(num) || num <= 0) return null;
      return num < 1e11 ? Math.round(num * 1000) : Math.round(num);
    }

    const parsed = Date.parse(trimmed);
    if (Number.isFinite(parsed)) {
      return parsed;
    }

    return null;
  }

  return null;
}

const LEGACY_RELATIVE_STRING_REGEX =
  /^(just now|\d+\s+(second|minute|hour|day|week|month|year)s?\s+ago)$/i;

/**
 * Formats a timestamp into an accurate relative time string:
 * - Less than 1 minute: "Just now"
 * - 1 minute: "1 minute ago"
 * - 2..59 minutes: "N minutes ago"
 * - 1 hour: "1 hour ago"
 * - 2..23 hours: "N hours ago"
 * - 1 day: "1 day ago"
 * - 2..29 days: "N days ago"
 * - 30+ days: readable date in Asia/Kolkata (e.g., "10 Apr 2024")
 */
export function formatRelativeTime(
  input: TimestampInput,
  nowMs: number = Date.now()
): string {
  const timestampMs = parseTimestampToMs(input);

  if (timestampMs === null) {
    if (typeof input === 'string') {
      const trimmed = input.trim();
      if (LEGACY_RELATIVE_STRING_REGEX.test(trimmed)) {
        return trimmed;
      }
    }
    return '';
  }

  const elapsedMs = Math.max(0, nowMs - timestampMs);
  const elapsedSeconds = Math.floor(elapsedMs / 1000);

  if (elapsedSeconds < 60) {
    return 'Just now';
  }

  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  if (elapsedMinutes === 1) {
    return '1 minute ago';
  }
  if (elapsedMinutes < 60) {
    return `${elapsedMinutes} minutes ago`;
  }

  const elapsedHours = Math.floor(elapsedMinutes / 60);
  if (elapsedHours === 1) {
    return '1 hour ago';
  }
  if (elapsedHours < 24) {
    return `${elapsedHours} hours ago`;
  }

  const elapsedDays = Math.floor(elapsedHours / 24);
  if (elapsedDays === 1) {
    return '1 day ago';
  }
  if (elapsedDays < 30) {
    return `${elapsedDays} days ago`;
  }

  return formatDateIST(new Date(timestampMs));
}

// ==========================================
// SHARED RELATIVE-TIME TICK SUBSCRIPTION
// ==========================================

type TickListener = (nowMs: number) => void;
const listeners = new Set<TickListener>();
let sharedIntervalId: number | null = null;

function notifyAllListeners() {
  const currentMs = Date.now();
  listeners.forEach((listener) => listener(currentMs));
}

function handleVisibilityOrFocus() {
  if (typeof document === 'undefined' || document.visibilityState === 'visible') {
    notifyAllListeners();
  }
}

function startSharedTicker() {
  if (sharedIntervalId !== null || typeof window === 'undefined') return;
  sharedIntervalId = window.setInterval(notifyAllListeners, RELATIVE_TIME_REFRESH_MS);
  window.addEventListener('focus', handleVisibilityOrFocus);
  document.addEventListener('visibilitychange', handleVisibilityOrFocus);
}

function stopSharedTickerIfIdle() {
  if (listeners.size > 0 || sharedIntervalId === null || typeof window === 'undefined') return;
  window.clearInterval(sharedIntervalId);
  sharedIntervalId = null;
  window.removeEventListener('focus', handleVisibilityOrFocus);
  document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
}

/**
 * Shared React hook that returns the current epoch timestamp (ms) and automatically refreshes
 * every 30 seconds across all mounted subscribers using a single shared timer.
 */
export function useRelativeTimeNow(): number {
  const [nowMs, setNowMs] = useState<number>(() => Date.now());

  useEffect(() => {
    const listener: TickListener = (latestMs) => {
      setNowMs(latestMs);
    };

    listeners.add(listener);
    startSharedTicker();

    return () => {
      listeners.delete(listener);
      stopSharedTickerIfIdle();
    };
  }, []);

  return nowMs;
}
