import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

export function normalizeEmail(value: string) { return value.trim().toLowerCase(); }
export function normalizePhone(value: string) { return value.replace(/[^\d+]/g, "").replace(/^00/, "+"); }
export function formatNaira(value: number | string) { return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(Number(value)); }
