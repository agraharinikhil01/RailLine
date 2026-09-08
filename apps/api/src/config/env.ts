import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3001),
  HOST: z.string().default('0.0.0.0'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  RAILRADAR_API_KEY: z.string().default('rg_ff60afba90bf47d3bcb6c39f7920d3e0'),
  OPENWEATHER_API_KEY: z.string().default('e1a729f45381dc424a9c2c66e8ad5d7e'),
  OPENTOPOGRAPHY_API_KEY: z.string().default('175662481dc663c6bbd15126f256bade'),
  MAPTILER_API_KEY: z.string().default('RbtagRyEluq70WIwgao8'),
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
