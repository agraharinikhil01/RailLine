import fastify, { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { nanoid } from 'nanoid';
import { env } from './config/env';
import { trainRoutes } from './routes/trains';
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

  // CORS
  await app.register(cors, {
    origin: [env.CORS_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  });

  // Rate limiter (PRD §26)
  await app.register(rateLimit, {
    max: 120,
    timeWindow: '1 minute',
  });

  // Global Error Handler (PRD §15 API Error Contract)
  // Must be registered BEFORE route registration for proper Fastify encapsulation inheritance
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

  // Health check
  app.get('/health', async () => {
    return { status: 'healthy', timestamp: new Date().toISOString(), service: 'railline-api' };
  });

  // Register routes under /api/v1/trains
  await app.register(trainRoutes, { prefix: '/api/v1/trains' });

  return app;
}

async function start() {
  const app = await buildApp();
  try {
    await app.listen({ port: env.PORT, host: env.HOST });
    console.log(`🚂 RailLine API running on http://${env.HOST}:${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

// Only start the standalone server if not running in a test execution
const isRunningTests = process.env.NODE_ENV === 'test' || process.argv.some((arg) => arg.includes('test'));

if (!isRunningTests) {
  start();
}
