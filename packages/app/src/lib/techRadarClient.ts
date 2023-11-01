// app/src/lib/MyClient.ts
import {
    TechRadarApi,
    TechRadarLoaderResponse,
  } from '@backstage/plugin-tech-radar';

const techRadar = require('./techRadar.json');

  export class MyOwnClient implements TechRadarApi {
    async load(id: string | undefined): Promise<TechRadarLoaderResponse> {
      console.log(id);
      try {
        const data = techRadar
        const processedData = {
          ...data,
          entries: data.entries.map((entry: { timeline: { date: string | number | Date }[] }) => ({
            ...entry,
            timeline: entry.timeline.map((timeline: { date: string | number | Date }) => ({
              ...timeline,
              date: new Date(timeline.date),
            })),
          })),
        };

        return processedData;
      } catch (error) {
        console.error('Error:', error);
        throw error;
      }
    }
  }
