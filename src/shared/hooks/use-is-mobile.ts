"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const mql = window.matchMedia("(max-width: 767.98px)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getSnapshot() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 767.98px)").matches;
}

function getServerSnapshot() {
  return false;
}

/**
 * Hook pendeteksi breakpoint seluler (< 768px).
 * Memakai `useSyncExternalStore` agar SSR-safe, bebas kedip hidrasi,
 * dan mematuhi linter `react-hooks/set-state-in-effect`.
 */
export function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
