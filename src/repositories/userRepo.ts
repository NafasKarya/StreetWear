import "server-only";
import { prisma } from "@/lib/db";
import { Role } from "@prisma/client"; // enum Role { user, admin }
import { hashAccessToken } from "@/lib/auth/adminAccessToken";

const norm = (e: string) => e.trim().toLowerCase();

const TEN_HOURS_MS = 10 * 60 * 60 * 1000;        // 10 jam (access token)
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000; // 30 hari (refresh token)

export const userRepo = {
  // =========================
  // USER
  // =========================
  findByEmail: (email: string) =>
    prisma.user.findUnique({ where: { email: norm(email) } }),

  // bikin admin tunggal; handle unique index/constraint
  createAdmin: async (email: string, passwordHash: string) => {
    try {
      return await prisma.user.create({
        data: { email: norm(email), passwordHash, role: Role.admin },
      });
    } catch (err: any) {
      const msg = String(err?.message ?? "");
      const code = String(err?.code ?? "");
      if (code === "P2002" || code === "1062" || msg.includes("one_admin_only")) {
        const e = new Error("ADMIN_ALREADY_EXISTS");
        (e as any).code = "ADMIN_ALREADY_EXISTS";
        throw e;
      }
      throw err;
    }
  },

  // selalu paksa role=user
  createUser: (email: string, passwordHash: string) =>
    prisma.user.create({
      data: { email: norm(email), passwordHash, role: Role.user },
    }),

  countAdmins: () => prisma.user.count({ where: { role: Role.admin } }),

  // =========================
  // ADMIN ACCESS TOKEN (10 jam)
  // =========================
  upsertAdminAccessToken: async (userId: number, plainToken: string, now = new Date()) => {
    const expiresAt = new Date(now.getTime() + TEN_HOURS_MS);
    const tokenHash = hashAccessToken(plainToken);

    await prisma.adminAccessToken.upsert({
      where: { userId },
      update: { tokenHash, expiresAt },
      create: { userId, tokenHash, expiresAt },
    });

    return { expiresAt };
  },

  getAdminAccessTokenMeta: (userId: number) =>
    prisma.adminAccessToken.findUnique({
      where: { userId },
      select: { tokenHash: true, expiresAt: true },
    }),

  // lookup token admin by hash
  findValidAdminAccessTokenByHash: async (tokenHash: string, now = new Date()) => {
    return prisma.adminAccessToken.findFirst({
      where: {
        tokenHash,
        expiresAt: { gt: now },
        user: { role: Role.admin },
      },
      select: {
        id: true,
        expiresAt: true,
        user: {
          select: { id: true, email: true, role: true },
        },
      },
    });
  },

  // =========================
  // ADMIN REFRESH TOKEN (30 hari)
  // =========================
  upsertAdminRefreshToken: async (userId: number, plainToken: string, now = new Date()) => {
    const expiresAt = new Date(now.getTime() + THIRTY_DAYS_MS);
    const tokenHash = hashAccessToken(plainToken);

    await prisma.adminRefreshToken.upsert({
      where: { userId },
      update: { tokenHash, expiresAt, revokedAt: null, rotatedAt: null },
      create: { userId, tokenHash, expiresAt },
    });

    return { expiresAt };
  },

  getAdminRefreshTokenMeta: (userId: number) =>
    prisma.adminRefreshToken.findUnique({
      where: { userId },
      select: { tokenHash: true, expiresAt: true, revokedAt: true, rotatedAt: true },
    }),

  rotateAdminRefreshToken: async (
    userId: number,
    oldPlain: string,
    newPlain: string,
    now = new Date()
  ): Promise<
    | { ok: true; expiresAt: Date }
    | { ok: false; reason: "NOT_FOUND" | "REVOKED" | "EXPIRED" | "MISMATCH" }
  > => {
    const current = await prisma.adminRefreshToken.findUnique({ where: { userId } });
    if (!current) return { ok: false, reason: "NOT_FOUND" };
    if (current.revokedAt) return { ok: false, reason: "REVOKED" };
    if (now > current.expiresAt) return { ok: false, reason: "EXPIRED" };

    const matches = hashAccessToken(oldPlain) === current.tokenHash;
    if (!matches) return { ok: false, reason: "MISMATCH" };

    const expiresAt = new Date(now.getTime() + THIRTY_DAYS_MS);
    await prisma.adminRefreshToken.update({
      where: { userId },
      data: {
        tokenHash: hashAccessToken(newPlain),
        expiresAt,
        rotatedAt: now,
      },
    });

    return { ok: true, expiresAt };
  },

  revokeAdminRefreshToken: (userId: number, when = new Date()) =>
    prisma.adminRefreshToken.update({
      where: { userId },
      data: { revokedAt: when },
    }),

  // =========================
  // USER ACCESS TOKEN (10 jam)
  // =========================
  upsertUserAccessToken: async (userId: number, plainToken: string, now = new Date()) => {
    const expiresAt = new Date(now.getTime() + TEN_HOURS_MS);
    const tokenHash = hashAccessToken(plainToken);

    await prisma.userAccessToken.upsert({
      where: { userId },
      update: { tokenHash, expiresAt },
      create: { userId, tokenHash, expiresAt },
    });

    return { expiresAt };
  },

  getUserAccessTokenMeta: (userId: number) =>
    prisma.userAccessToken.findUnique({
      where: { userId },
      select: { tokenHash: true, expiresAt: true },
    }),

  // lookup token user by hash
  findValidUserAccessTokenByHash: async (tokenHash: string, now = new Date()) => {
    return prisma.userAccessToken.findFirst({
      where: {
        tokenHash,
        expiresAt: { gt: now },
        user: { role: Role.user },
      },
      select: {
        id: true,
        expiresAt: true,
        user: {
          select: { id: true, email: true, role: true },
        },
      },
    });
  },

  // =========================
  // USER REFRESH TOKEN (30 hari)
  // =========================
  upsertUserRefreshToken: async (userId: number, plainToken: string, now = new Date()) => {
    const expiresAt = new Date(now.getTime() + THIRTY_DAYS_MS);
    const tokenHash = hashAccessToken(plainToken);

    await prisma.userRefreshToken.upsert({
      where: { userId },
      update: { tokenHash, expiresAt, revokedAt: null, rotatedAt: null },
      create: { userId, tokenHash, expiresAt },
    });

    return { expiresAt };
  },

  getUserRefreshTokenMeta: (userId: number) =>
    prisma.userRefreshToken.findUnique({
      where: { userId },
      select: { tokenHash: true, expiresAt: true, revokedAt: true, rotatedAt: true },
    }),

  rotateUserRefreshToken: async (
    userId: number,
    oldPlain: string,
    newPlain: string,
    now = new Date()
  ): Promise<
    | { ok: true; expiresAt: Date }
    | { ok: false; reason: "NOT_FOUND" | "REVOKED" | "EXPIRED" | "MISMATCH" }
  > => {
    const current = await prisma.userRefreshToken.findUnique({ where: { userId } });
    if (!current) return { ok: false, reason: "NOT_FOUND" };
    if (current.revokedAt) return { ok: false, reason: "REVOKED" };
    if (now > current.expiresAt) return { ok: false, reason: "EXPIRED" };

    const matches = hashAccessToken(oldPlain) === current.tokenHash;
    if (!matches) return { ok: false, reason: "MISMATCH" };

    const expiresAt = new Date(now.getTime() + THIRTY_DAYS_MS);
    await prisma.userRefreshToken.update({
      where: { userId },
      data: {
        tokenHash: hashAccessToken(newPlain),
        expiresAt,
        rotatedAt: now,
      },
    });

    return { ok: true, expiresAt };
  },

  revokeUserRefreshToken: (userId: number, when = new Date()) =>
    prisma.userRefreshToken.update({
      where: { userId },
      data: { revokedAt: when },
    }),

  // =========================
  // SYSTEM SETTINGS
  // =========================
  getSetting: (key: string) =>
    prisma.systemSetting.findUnique({ where: { key } }),

  setSetting: (key: string, value: string) =>
    prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    }),
};
