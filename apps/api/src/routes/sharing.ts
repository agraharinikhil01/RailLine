import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { sharingService } from '../services/sharingService';
import { InvalidRequestError } from '../utils/errors';

export const sharingRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // POST /api/v1/journeys/share (PRD §14.12)
  fastify.post('/share', async (request, reply) => {
    const { trainNumber } = (request.body || {}) as { trainNumber?: string };
    if (!trainNumber) {
      throw new InvalidRequestError('Field "trainNumber" is required to generate a share link.');
    }

    const shareInfo = await sharingService.createShareLink(trainNumber);
    return reply.status(201).send({ data: shareInfo });
  });

  // GET /api/v1/journeys/shared/:shareToken
  fastify.get('/shared/:shareToken', async (request, reply) => {
    const { shareToken } = request.params as { shareToken: string };
    const sharedData = await sharingService.getSharedJourney(shareToken);
    return reply.send({ data: sharedData });
  });
};
