// ConfiguratorService – Extended Version
import { prisma } from "@/src/lib/prisma";
import { slugify, uniqueSlug } from "@/src/utils/slugify";
import { generateAccessToken } from "@/src/utils/id";
import { NotFoundError, AuthorizationError } from "@/src/lib/errors";
import type { Configurator } from "@prisma/client";

/**
 * Shared Prisma include trees
 */
const configuratorFullInclude = {
  theme: true,
  categories: {
    include: {
      options: {
        include: {
          incompatibleWith: {
            include: {
              incompatibleOption: {
                select: {
                  id: true,
                  label: true,
                  sku: true,
                  categoryId: true,
                },
              },
            },
          },
          dependencies: {
            include: {
              dependsOnOption: {
                select: {
                  id: true,
                  label: true,
                  sku: true,
                  categoryId: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { orderIndex: "asc" },
  },
} as const;

/**
 * Compact include tree for list summaries
 */
const configuratorListSelect = {
  id: true,
  name: true,
  publicId: true,
  createdAt: true,
  updatedAt: true,
  theme: { select: { id: true, name: true } },
  categories: {
    select: {
      id: true,
      _count: { select: { options: true } },
    },
  },
} as const;

export const ConfiguratorService = {
  /**
   * Create a new configurator and assign slug + access token.
   */
  async create(
    clientId: string,
    data: {
      name: string;
      description?: string;
      currency?: string;
      currencySymbol?: string;
      themeId?: string;
    }
  ): Promise<Configurator> {
    const configurator = await prisma.configurator.create({
      data: {
        clientId,
        name: data.name,
        description: data.description,
        currency: data.currency,
        currencySymbol: data.currencySymbol,
        themeId: data.themeId,
        accessToken: generateAccessToken(),
      },
    });

    const slug = uniqueSlug(data.name, configurator.id);
    return prisma.configurator.update({
      where: { id: configurator.id },
      data: { slug },
    });
  },

  /**
   * List all configurators belonging to a client.
   */
  async list(clientId: string) {
    const configurators = await prisma.configurator.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
      select: configuratorListSelect,
    });

    return configurators.map((c) => ({
      id: c.id,
      name: c.name,
      publicId: c.publicId,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      theme: c.theme,
      categoryCount: c.categories.length,
      optionCount: c.categories.reduce(
        (sum, cat) => sum + (cat._count?.options || 0),
        0
      ),
    }));
  },

  /**
   * Get configurator by ID (optionally enforce client ownership).
   */
  async getById(id: string, clientId?: string) {
    const configurator = await prisma.configurator.findUnique({
      where: { id },
      include: configuratorFullInclude,
    });
    if (!configurator) throw new NotFoundError("Configurator");

    if (clientId && configurator.clientId !== clientId)
      throw new AuthorizationError("Access denied");

    return configurator;
  },

  /**
   * Get configurator by publicId (for embeds).
   */
  async getByPublicId(publicId: string) {
    const configurator = await prisma.configurator.findUnique({
      where: { publicId },
      include: configuratorFullInclude,
    });
    if (!configurator) throw new NotFoundError("Configurator");
    if (!configurator.isPublished)
      throw new AuthorizationError("Configurator not published");
    return configurator;
  },

  /**
   * ✅ NEW: Get configurator by publicId + clientId (used in embeds).
   * Ensures the configurator actually belongs to that client.
   */
  async getByPublicIdAndClientId(publicId: string, clientId: string) {
    const configurator = await prisma.configurator.findFirst({
      where: { publicId, clientId, isPublished: true },
      include: configuratorFullInclude,
    });

    if (!configurator) {
      throw new NotFoundError("Configurator not found for this client");
    }

    return configurator;
  },

  /**
   * Get configurator by slug.
   */
  async getBySlug(slug: string) {
    const configurator = await prisma.configurator.findUnique({
      where: { slug },
      include: configuratorFullInclude,
    });
    if (!configurator) throw new NotFoundError("Configurator");
    return configurator;
  },

  /**
   * Update an existing configurator.
   */
  async update(
    id: string,
    clientId: string,
    data: Partial<Configurator>
  ): Promise<Configurator> {
    await this.verifyOwnership(id, clientId);

    if (data.name) data.slug = slugify(data.name);

    return prisma.configurator.update({
      where: { id },
      data,
    });
  },

  /**
   * Delete configurator.
   */
  async delete(id: string, clientId: string): Promise<void> {
    await this.verifyOwnership(id, clientId);
    await prisma.configurator.delete({ where: { id } });
  },

  /**
   * Duplicate configurator (metadata only).
   */
  async duplicate(id: string, clientId: string): Promise<Configurator> {
    const original = await this.getById(id, clientId);

    const payload = {
      name: `${original.name} (Copy)`,
      description: original.description ?? undefined,
      currency: original.currency ?? undefined,
      currencySymbol: original.currencySymbol ?? undefined,
      themeId: original.themeId ?? undefined,
    };

    return this.create(clientId, payload);
  },

  /**
   * Publish configurator.
   */
  async publish(id: string, clientId: string) {
    return this.update(id, clientId, {
      isPublished: true,
      publishedAt: new Date(),
    });
  },

  /**
   * Unpublish configurator.
   */
  async unpublish(id: string, clientId: string) {
    return this.update(id, clientId, { isPublished: false });
  },

  /**
   * Update last access timestamp (for analytics).
   */
  async updateAccessedAt(id: string): Promise<void> {
    await prisma.configurator.update({
      where: { id },
      data: { lastAccessedAt: new Date() },
    });
  },

  /**
   * ✅ NEW: Quick existence check for rate limiting or validation.
   */
  async existsForClient(publicId: string, clientId: string): Promise<boolean> {
    const count = await prisma.configurator.count({
      where: { publicId, clientId },
    });
    return count > 0;
  },

  /**
   * Helper: Ensure configurator belongs to client.
   */
  async verifyOwnership(id: string, clientId: string) {
    const cfg = await prisma.configurator.findUnique({
      where: { id },
      select: { clientId: true },
    });
    if (!cfg) throw new NotFoundError("Configurator");
    if (cfg.clientId !== clientId)
      throw new AuthorizationError("Access denied");
  },
};
