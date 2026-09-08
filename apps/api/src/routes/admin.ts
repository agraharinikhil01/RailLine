import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { cacheService } from '../cache/cacheService';

export const adminRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // GET /api/v1/admin/health
  fastify.get('/health', async () => {
    const memory = process.memoryUsage();
    return {
      status: 'operational',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      cache: cacheService.getStats(),
      memory: {
        rssMb: Math.round(memory.rss / (1024 * 1024)),
        heapUsedMb: Math.round(memory.heapUsed / (1024 * 1024)),
      },
      providers: {
        trainProvider: 'MockTrainProvider (Active)',
        weatherProvider: 'MockWeatherProvider (Active)',
        elevationProvider: 'MockElevationProvider (Active)',
        geoProvider: 'MockGeoProvider (Active)',
      },
    };
  });
};
