import prisma from "@/lib/prisma";

export const userAccessRepo = {
  async grant(userId: number, scope: string, expiresAt?: Date | null) {
    return prisma.userAccessGrant.upsert({
      where: { userId_scope: { userId, scope } },
      update: { expiresAt: expiresAt ?? null },
      create: { userId, scope, expiresAt: expiresAt ?? null },
    });
  },

  async scopes(userId: number): Promise<string[]> {
    const rows = await prisma.userAccessGrant.findMany({
      where: {
        userId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      select: { scope: true },
    });
    return rows.map((r) => r.scope);
  },

  async revoke(userId: number, scope: string) {
    await prisma.userAccessGrant.delete({
      where: { userId_scope: { userId, scope } },
    });
  },
};
