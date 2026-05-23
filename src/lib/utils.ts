import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formats an ISO date string (YYYY-MM-DD) as "25th January 2025" */
export function formatDate(iso: string): string {
  return format(parseISO(iso), "do MMMM yyyy");
}
