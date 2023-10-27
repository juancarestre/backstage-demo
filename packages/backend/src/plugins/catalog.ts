import { CatalogBuilder } from '@backstage/plugin-catalog-backend';
import { ScaffolderEntitiesProcessor } from '@backstage/plugin-scaffolder-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';
import { GithubOrgEntityProvider, defaultUserTransformer } from '@backstage/plugin-catalog-backend-module-github';


export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const builder = await CatalogBuilder.create(env);
  builder.addProcessor(new ScaffolderEntitiesProcessor());
  builder.addEntityProvider(
    GithubOrgEntityProvider.fromConfig(env.config, {
      id: 'production',
      orgUrl: 'https://github.com/hesitationgames',
      logger: env.logger,
      schedule: env.scheduler.createScheduledTaskRunner({
        frequency: { minutes: 1 },
        timeout: { minutes: 15 },
      }),
      userTransformer: async (user, ctx) => {
        const entity = await defaultUserTransformer(user, ctx);
        if (entity && user.organizationVerifiedDomainEmails?.length) {
          entity.spec.profile!.email = user.organizationVerifiedDomainEmails[0];
        }
        return entity;
      },
    }),
  );
  const { processingEngine, router } = await builder.build();
  await processingEngine.start();
  return router;
}
