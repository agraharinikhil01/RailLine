import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { geoService } from '../services/geoService';

export const placesRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // GET /api/v1/trains/:trainNumber/places?category= (PRD §14.9)
  fastify.get('/:trainNumber/places', async (request, reply) => {
    const { trainNumber } = request.params as { trainNumber: string };
    const { category } = request.query as { category?: string };

    const places = await geoService.getNearbyPlaces(trainNumber, category);
    return reply.send({ data: places });
  });
};
