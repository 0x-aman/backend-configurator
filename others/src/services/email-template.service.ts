// Email template service
import { prisma } from '@/src/lib/prisma';
import { NotFoundError } from '@/src/lib/errors';
import type { EmailTemplate } from '@prisma/client';

export const EmailTemplateService = {
  async create(
    clientId: string,
    data: {
      name: string;
      subject: string;
      body: string;
      templateType?: string;
      isDefault?: boolean;
    }
  ): Promise<EmailTemplate> {
    return await prisma.emailTemplate.create({
      data: {
        clientId,
        ...data,
      },
    });
  },

  async list(clientId: string, templateType?: string): Promise<EmailTemplate[]> {
    return await prisma.emailTemplate.findMany({
      where: {
        clientId,
        isActive: true,
        ...(templateType && { templateType }),
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  async getById(id: string): Promise<EmailTemplate> {
    const template = await prisma.emailTemplate.findUnique({ where: { id } });
    if (!template) throw new NotFoundError('Email template');
    return template;
  },

  async getDefault(clientId: string, templateType: string): Promise<EmailTemplate | null> {
    return await prisma.emailTemplate.findFirst({
      where: {
        clientId,
        templateType,
        isDefault: true,
        isActive: true,
      },
    });
  },

  async update(id: string, data: Partial<EmailTemplate>): Promise<EmailTemplate> {
    return await prisma.emailTemplate.update({
      where: { id },
      data,
    });
  },

  async delete(id: string): Promise<void> {
    await prisma.emailTemplate.update({
      where: { id },
      data: { isActive: false },
    });
  },
};
