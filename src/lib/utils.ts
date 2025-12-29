import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useMediaQuery } from "usehooks-ts";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function useIsDesktop() {
  return useMediaQuery("(min-width: 640px)", {
    initializeWithValue: false,
  });
}
