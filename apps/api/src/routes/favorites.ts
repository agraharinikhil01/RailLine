import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { favoritesService } from '../services/favoritesService';
import { InvalidRequestError } from '../utils/errors';

export const favoritesRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // GET /api/v1/favorites (PRD §14.10)
  fastify.get('/', async (_request, reply) => {
    const list = await favoritesService.getFavorites();
    return reply.send({ data: list });
  });

  // POST /api/v1/favorites
  fastify.post('/', async (request, reply) => {
    const { trainNumber } = (request.body || {}) as { trainNumber?: string };
    if (!trainNumber) {
      throw new InvalidRequestError('Field "trainNumber" is required.');
    }

    const result = await favoritesService.addFavorite(trainNumber);
    return reply.status(201).send({ data: result });
  });

  // DELETE /api/v1/favorites/:trainNumber
  fastify.delete('/:trainNumber', async (request, reply) => {
    const { trainNumber } = request.params as { trainNumber: string };
    const result = await favoritesService.removeFavorite(trainNumber);
    return reply.send({ data: result });
  });
};
