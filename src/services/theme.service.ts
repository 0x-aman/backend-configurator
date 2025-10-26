// Theme service
import { prisma } from '@/src/lib/prisma';
import { NotFoundError } from '@/src/lib/errors';
import { DEFAULT_THEME } from '@/src/config/constants';
import type { Theme } from '@prisma/client';

export const ThemeService = {
  async create(clientId: string, data: Partial<Theme>): Promise<Theme> {
    return await prisma.theme.create({
      data: {
        clientId,
        name: data.name || 'New Theme',
        ...DEFAULT_THEME,
        ...data,
      },
    });
  },

  async list(clientId: string): Promise<Theme[]> {
    return await prisma.theme.findMany({
      where: { clientId, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getById(id: string): Promise<Theme> {
    const theme = await prisma.theme.findUnique({ where: { id } });
    if (!theme) throw new NotFoundError('Theme');
    return theme;
  },

  async update(id: string, data: Partial<Theme>): Promise<Theme> {
    return await prisma.theme.update({
      where: { id },
      data,
    });
  },

  async delete(id: string): Promise<void> {
    await prisma.theme.update({
      where: { id },
      data: { isActive: false },
    });
  },

  async setDefault(id: string, clientId: string): Promise<Theme> {
    // Unset all defaults for this client
    await prisma.theme.updateMany({
      where: { clientId },
      data: { isDefault: false },
    });

    // Set new default
    return await prisma.theme.update({
      where: { id },
      data: { isDefault: true },
    });
  },

  async getDefault(clientId: string): Promise<Theme | null> {
    return await prisma.theme.findFirst({
      where: { clientId, isDefault: true, isActive: true },
    });
  },
};
