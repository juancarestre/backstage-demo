import { CatalogClient } from '@backstage/catalog-client';
import { createBuiltinActions, createRouter, TemplateAction } from '@backstage/plugin-scaffolder-backend';
import { Router } from 'express';
import type { PluginEnvironment } from '../types';
import { createHttpBackstageAction } from '@roadiehq/scaffolder-backend-module-http-request'
import { Config } from '@backstage/config';
import { ScmIntegrations } from '@backstage/integration';
import { UrlReader } from '@backstage/backend-common';
import { DiscoveryApi } from '@backstage/plugin-permission-common';

export const createActions = (options: {
  reader: UrlReader;
  integrations: ScmIntegrations;
  config: Config;
  catalogClient: CatalogClient;
  discoveryApi: DiscoveryApi
}): TemplateAction<any>[] => {
  const { reader, integrations, config, catalogClient } = options;
  const defaultActions = createBuiltinActions({
    reader,
    integrations,
    catalogClient,
    config,
  });

  return [
    createHttpBackstageAction({ discovery: options.discoveryApi  }),
    ...defaultActions,
  ];
};

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const catalogClient = new CatalogClient({
    discoveryApi: env.discovery,
  });

  return await createRouter({
    logger: env.logger,
    config: env.config,
    database: env.database,
    reader: env.reader,
    catalogClient,
    permissions: env.permissions,
    actions: createActions({
      reader: env.reader,
      integrations: ScmIntegrations.fromConfig(env.config),
      config: env.config,
      catalogClient: catalogClient,
      discoveryApi: env.discovery,
    }),
  });
}
