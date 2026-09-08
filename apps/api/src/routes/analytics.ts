import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { analyticsService } from '../services/analyticsService';

export const analyticsRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // GET /api/v1/trains/:trainNumber/elevation (PRD §14.8)
  fastify.get('/:trainNumber/elevation', async (request, reply) => {
    const { trainNumber } = request.params as { trainNumber: string };
    const summary = await analyticsService.getElevationSummary(trainNumber);
    return reply.send({ data: summary });
  });

  // GET /api/v1/trains/:trainNumber/delays
  fastify.get('/:trainNumber/delays', async (request, reply) => {
    const { trainNumber } = request.params as { trainNumber: string };
    const delays = await analyticsService.getDelayHistory(trainNumber);
    return reply.send({ data: delays });
  });
};
