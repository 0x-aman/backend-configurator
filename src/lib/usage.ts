import { prisma } from "@/src/lib/prisma";

export async function countPrimaryOptionsForClient(clientId: string) {
  return prisma.option.count({
    where: {
      category: {
        isPrimary: true,
        configurator: {
          clientId: clientId,
        },
      },
    },
  });
}
