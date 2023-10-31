import {
    createRouter,
    StaticExploreToolProvider,
  } from '@backstage/plugin-explore-backend';
  import { ExploreTool } from '@backstage/plugin-explore-common';
  import { Router } from 'express';
  import { PluginEnvironment } from '../types';

  // List of tools you want to surface in the Explore plugin "Tools" page.
  const exploreTools: ExploreTool[] = [
    {
      title: 'Postman',
      description: 'postman',
      url: 'https://www.postman.com/',
      image: '/postmanlogo.png',
      tags: ['API', 'HTTP', 'REST'],
    },    {
      title: 'Datadog',
      description: 'Expensive Monitoring',
      url: 'https://www.datadog.com/',
      image: '/postmanlogo.png',
      tags: ['Monitoring', 'Logs', 'Alerting'],
    },
  ];

  export default async function createPlugin(
    env: PluginEnvironment,
  ): Promise<Router> {
    return await createRouter({
      logger: env.logger,
      toolProvider: StaticExploreToolProvider.fromData(exploreTools),
    });
  }