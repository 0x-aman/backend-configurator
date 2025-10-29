// Configurator service
import { prisma } from "@/src/lib/prisma";
import { slugify, uniqueSlug } from "@/src/utils/slugify";
import { generateAccessToken } from "@/src/utils/id";
import { NotFoundError, AuthorizationError } from "@/src/lib/errors";
import type { Configurator } from "@prisma/client";

export const ConfiguratorService = {
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

    // Generate slug after creation (needs ID)
    const slug = uniqueSlug(data.name, configurator.id);
    return await prisma.configurator.update({
      where: { id: configurator.id },
      data: { slug },
    });
  },

  async list(clientId: string): Promise<Configurator[]> {
    return await prisma.configurator.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
      include: {
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
        },
      },
    });
  },

  async getById(id: string, clientId?: string): Promise<Configurator> {
    const configurator = await prisma.configurator.findUnique({
      where: { id },
      include: {
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
      },
    });

    if (!configurator) throw new NotFoundError("Configurator");

    if (clientId && configurator.clientId !== clientId) {
      throw new AuthorizationError("Access denied");
    }

    return configurator;
  },

  async getByPublicId(publicId: string) {
    const configurator = await prisma.configurator.findUnique({
      where: { publicId },
      include: {
        theme: true,
        categories: {
          include: {
            options: {
              where: { isActive: true },
              orderBy: { orderIndex: "asc" },
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
      },
    });

    if (!configurator) throw new NotFoundError("Configurator");
    if (!configurator.isPublished)
      throw new AuthorizationError("Configurator not published");

    return configurator;
  },

  async getBySlug(slug: string) {
    const configurator = await prisma.configurator.findUnique({
      where: { slug },
      include: {
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
      },
    });

    if (!configurator) throw new NotFoundError("Configurator");
    return configurator;
  },

  async update(
    id: string,
    clientId: string,
    data: Partial<Configurator>
  ): Promise<Configurator> {
    // Verify ownership
    await this.getById(id, clientId);

    if (data.name) {
      data.slug = slugify(data.name);
    }

    return await prisma.configurator.update({
      where: { id },
      data,
    });
  },

  async delete(id: string, clientId: string): Promise<void> {
    await this.getById(id, clientId);
    await prisma.configurator.delete({ where: { id } });
  },

  async duplicate(id: string, clientId: string): Promise<Configurator> {
    const original = await this.getById(id, clientId);

    const {
      id: _,
      publicId: __,
      slug: ___,
      accessToken: ____,
      createdAt,
      updatedAt,
      ..._rest
    } = original;

    const payload = {
      name: `${original.name} (Copy)`,
      description: original.description ?? undefined,
      currency: original.currency ?? undefined,
      currencySymbol: original.currencySymbol ?? undefined,
      themeId: original.themeId ?? undefined,
    };

    return await this.create(clientId, payload);
  },

  async publish(id: string, clientId: string): Promise<Configurator> {
    return await this.update(id, clientId, {
      isPublished: true,
      publishedAt: new Date(),
    });
  },

  async unpublish(id: string, clientId: string): Promise<Configurator> {
    return await this.update(id, clientId, {
      isPublished: false,
    });
  },

  async updateAccessedAt(id: string): Promise<void> {
    await prisma.configurator.update({
      where: { id },
      data: { lastAccessedAt: new Date() },
    });
  },
};
