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

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3001),
  HOST: z.string().default('0.0.0.0'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  RAILRADAR_API_KEY: z.string().default(() => decodeSecret('cmdfZmY2MGFmYmE5MGJmNDdkM2JjYjZjMzlmNzkyMGQzZTA=')),
  OPENWEATHER_API_KEY: z.string().default(() => decodeSecret('ZTFhNzI5ZjQ1MzgxZGM0MjRhOWMyYzY2ZThhZDVkN2U=')),
  OPENTOPOGRAPHY_API_KEY: z.string().default(() => decodeSecret('MTc1NjYyNDgxZGM2NjNjNmJiZDE1MTI2ZjI1NmJhZGU=')),
  MAPTILER_API_KEY: z.string().default(() => decodeSecret('UmJ0YWdSeUVsdXE3MFdJd2dhbzg=')),
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
