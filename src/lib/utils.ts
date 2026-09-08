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

export function truncateByWidth(
  text: string,
  maxWidth: number,
  font: string,
): string {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  ctx.font = font;

  if (ctx.measureText(text).width <= maxWidth) return text;

  let truncated = text;
  while (truncated.length > 0) {
    truncated = truncated.slice(0, -1);
    if (ctx.measureText(truncated + "…").width <= maxWidth) {
      return truncated + "…";
    }
  }
  return "…";
}
