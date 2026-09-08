import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { weatherService } from '../services/weatherService';
import { InvalidRequestError } from '../utils/errors';

// Route for /api/v1/weather?lat=&lng=
export const pointWeatherRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.get('/', async (request, reply) => {
    const { lat, lng } = request.query as { lat?: string; lng?: string };
    if (!lat || !lng) {
      throw new InvalidRequestError('Both "lat" and "lng" query parameters are required.');
    }

    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);

    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      throw new InvalidRequestError('Parameters "lat" and "lng" must be valid numeric values.');
    }

    const weather = await weatherService.getWeather(parsedLat, parsedLng);
    return reply.send({ data: weather });
  });
};

// Route for /api/v1/trains/:trainNumber/weather (PRD §14.7)
export const trainWeatherRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  fastify.get('/:trainNumber/weather', async (request, reply) => {
    const { trainNumber } = request.params as { trainNumber: string };
    const routeWeather = await weatherService.getRouteWeather(trainNumber);
    return reply.send({ data: routeWeather });
  });
};
