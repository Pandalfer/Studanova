import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export const GUEST_LIMIT = 3;
export const MEMBER_LIMIT = 50;

export const guestRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(GUEST_LIMIT, "30 d"),
  prefix: "ratelimit_guest",
});

export const memberRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(MEMBER_LIMIT, "30 d"),
  prefix: "ratelimit_member",
});
