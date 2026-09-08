import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { trainService } from '../services/trainService';
import { liveStatusService } from '../services/liveStatusService';
import { InvalidRequestError } from '../utils/errors';

export const trainRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Search trains: GET /api/v1/trains/search?q=12951
  fastify.get('/search', async (request, reply) => {
    const { q } = request.query as { q?: string };
    if (!q) {
      throw new InvalidRequestError('Query parameter "q" is required.');
    }
    const results = await trainService.searchTrains(q);
    return reply.send({ data: results });
  });

  // Train details: GET /api/v1/trains/:trainNumber
  fastify.get('/:trainNumber', async (request, reply) => {
    const { trainNumber } = request.params as { trainNumber: string };
    const train = await trainService.getTrainDetails(trainNumber);
    return reply.send({ data: train });
  });

  // Live status: GET /api/v1/trains/:trainNumber/live
  fastify.get('/:trainNumber/live', async (request, reply) => {
    const { trainNumber } = request.params as { trainNumber: string };
    const status = await liveStatusService.getLiveStatus(trainNumber);
    return reply.send({ data: status });
  });

  // Route GeoJSON: GET /api/v1/trains/:trainNumber/route
  fastify.get('/:trainNumber/route', async (request, reply) => {
    const { trainNumber } = request.params as { trainNumber: string };
    const geojson = await liveStatusService.getRouteGeometry(trainNumber);
    return reply.send(geojson);
  });

  // Station timeline: GET /api/v1/trains/:trainNumber/timeline
  fastify.get('/:trainNumber/timeline', async (request, reply) => {
    const { trainNumber } = request.params as { trainNumber: string };
    const timeline = await liveStatusService.getTimeline(trainNumber);
    return reply.send({ data: timeline });
  });
};
