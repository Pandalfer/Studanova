// src/lib/prisma.ts
import { PrismaClient } from "@/generated/prisma";

declare global {
  // Prevent multiple instances in development
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : [],
  });

if (process.env.NODE_ENV === "development") global.prisma = prisma;
