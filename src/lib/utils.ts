import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Penggabung className standar komponen ui (kontrak CLI shadcn/Aceternity:
 * komponen hasil `add` mengimpor `cn` dari alias `utils` di components.json).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
