import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3001),
  HOST: z.string().default('0.0.0.0'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  RAILRADAR_API_KEY: z.string().optional(),
  MAPTILER_API_KEY: z.string().optional().default('default_key'),
  OPENWEATHER_API_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function loadEnv(): Env {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.format());
    process.exit(1);
  }
  return parsed.data;
}

export const env = loadEnv();
