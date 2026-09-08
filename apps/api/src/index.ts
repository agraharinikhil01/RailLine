import fastify, { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { nanoid } from 'nanoid';
import { env } from './config/env';
import { trainRoutes } from './routes/trains';
import { analyticsRoutes } from './routes/analytics';
import { pointWeatherRoutes, trainWeatherRoutes } from './routes/weather';
import { placesRoutes } from './routes/places';
import { sharingRoutes } from './routes/sharing';
import { favoritesRoutes } from './routes/favorites';
import { adminRoutes } from './routes/admin';
import { AppError } from './utils/errors';

export async function buildApp() {
  const app = fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'warn',
    },
    genReqId: () => nanoid(10),
  });

  // Security headers
  await app.register(helmet, {
    contentSecurityPolicy: false,
  });

  // CORS - allow all origins (local dev, Vercel deployments, custom domains)
  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  // Rate limiter (PRD §26)
  await app.register(rateLimit, {
    max: 120,
    timeWindow: '1 minute',
  });

  // Global Error Handler (PRD §15 API Error Contract)
  app.setErrorHandler((error: FastifyError | AppError, request: FastifyRequest, reply: FastifyReply) => {
    const requestId = request.id as string;

    const isAppErr = error instanceof AppError || ('code' in error && 'statusCode' in error);

    if (isAppErr) {
      const statusCode = (error as any).statusCode || 400;
      const code = (error as any).code || 'BAD_REQUEST';
      const details = (error as any).details;

      return reply.status(statusCode).send({
        error: {
          code,
          message: error.message,
          requestId,
          details,
        },
      });
    }

    // Fastify validation errors
    if ('validation' in error) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
          requestId,
        },
      });
    }

    // Default internal error
    return reply.status(500).send({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred. Please try again later.',
        requestId,
      },
    });
  });

  // Health check routes
  const healthHandler = async () => ({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'railline-api',
  });
  app.get('/health', healthHandler);
  app.get('/api', healthHandler);
  app.get('/api/health', healthHandler);

  // Register API routes
  await app.register(trainRoutes, { prefix: '/api/v1/trains' });
  await app.register(analyticsRoutes, { prefix: '/api/v1/trains' });
  await app.register(placesRoutes, { prefix: '/api/v1/trains' });
  await app.register(trainWeatherRoutes, { prefix: '/api/v1/trains' });
  await app.register(pointWeatherRoutes, { prefix: '/api/v1/weather' });
  await app.register(sharingRoutes, { prefix: '/api/v1/journeys' });
  await app.register(favoritesRoutes, { prefix: '/api/v1/favorites' });
  await app.register(adminRoutes, { prefix: '/api/v1/admin' });

  return app;
}

export async function start() {
  const app = await buildApp();
  try {
    await app.listen({ port: env.PORT, host: env.HOST });
    console.log(`🚂 RailLine API running on http://${env.HOST}:${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

const isRunningTests = process.env.NODE_ENV === 'test' || process.argv.some((arg) => arg.includes('test'));
const isServerless = Boolean(process.env.VERCEL) || process.env.IS_SERVERLESS === 'true';

if (!isRunningTests && !isServerless) {
  start();
}
