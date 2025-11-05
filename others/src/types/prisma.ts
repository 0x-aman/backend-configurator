// Prisma model types and extensions
import type {
  Client,
  Configurator,
  Category,
  Option,
  Theme,
  EmailTemplate,
  Quote,
  File,
  AnalyticsEvent,
  ApiLog,
} from '@prisma/client';

export type {
  Client,
  Configurator,
  Category,
  Option,
  Theme,
  EmailTemplate,
  Quote,
  File,
  AnalyticsEvent,
  ApiLog,
};

export type ClientWithRelations = Client & {
  configurators?: Configurator[];
  themes?: Theme[];
  quotes?: Quote[];
};

export type ConfiguratorWithRelations = Configurator & {
  client?: Client;
  theme?: Theme;
  categories?: CategoryWithOptions[];
  quotes?: Quote[];
};

export type CategoryWithOptions = Category & {
  options?: Option[];
};

export type SafeClient = Omit<Client, 'passwordHash' | 'resetToken' | 'emailVerifyToken'>;
