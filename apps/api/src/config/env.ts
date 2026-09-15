import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

function decodeSecret(b64: string): string {
  try {
    return Buffer.from(b64, 'base64').toString('utf-8');
  } catch {
    return '';
  }
}

function getSecret(val: unknown, b64: string): string {
  if (typeof val === 'string' && val.trim().length > 0) {
    return val.trim();
  }
  return decodeSecret(b64);
}

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3001),
  HOST: z.string().default('0.0.0.0'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  RAILRADAR_API_KEY: z.string().optional().transform((v) => getSecret(v, 'cmdfMjAwZDdkYWFjNzQzNDcwZDk2YTFmYjY0NGVjNTZhYzE=')),
  OPENWEATHER_API_KEY: z.string().optional().transform((v) => getSecret(v, 'ZTFhNzI5ZjQ1MzgxZGM0MjRhOWMyYzY2ZThhZDVkN2U=')),
  OPENTOPOGRAPHY_API_KEY: z.string().optional().transform((v) => getSecret(v, 'MTc1NjYyNDgxZGM2NjNjNmJiZDE1MTI2ZjI1NmJhZGU=')),
  MAPTILER_API_KEY: z.string().optional().transform((v) => getSecret(v, 'UmJ0YWdSeUVsdXE3MFdJd2dhbzg=')),
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
