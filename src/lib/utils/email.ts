import { prisma } from "@/lib/prisma";

/** Canonical form for storing/comparing emails: trimmed and lowercased. */
export function normalizeEmail(email: unknown): string {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

/**
 * Case-insensitive user lookup. Older accounts may have been stored with
 * capitals ("Anna@Gmail.com"), and phones often capitalise the first letter
 * when typing, so an exact match silently failed for login and password
 * reset.
 */
export function findUserByEmail(email: string) {
  const normalized = normalizeEmail(email);
  if (!normalized) return Promise.resolve(null);
  return prisma.user.findFirst({
    where: { email: { equals: normalized, mode: "insensitive" } },
    orderBy: { createdAt: "asc" },
  });
}
