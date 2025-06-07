import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCors from '@fastify/cors';
import type { FastifyCorsOptions, OriginFunction } from '@fastify/cors';

function getAllowedOrigins(): string[] {
  if (process.env.NODE_ENV !== 'production') {
    return ['http://localhost:4200'];
  }

  const fallback = [
    'https://nedellec-julien.fr',
    'https://www.nedellec-julien.fr',
  ];

  try {
    const raw = process.env.ALLOWED_ORIGINS ?? '[]';
    const parsed: unknown = JSON.parse(raw);

    if (
      Array.isArray(parsed) &&
      parsed.every((o): o is string => typeof o === 'string')
    ) {
      return parsed;
    }
  } catch {
    console.warn('⚠️ ALLOWED_ORIGINS invalide. Utilisation du fallback.');
  }

  return fallback;
}

function buildOriginFn(allowedOrigins: string[]): OriginFunction {
  return (origin, callback) => {
    if (!origin) return callback(null, false);

    const isAllowed = allowedOrigins.includes(origin);
    callback(
      isAllowed ? null : new Error(`CORS refusé pour l'origine : ${origin}`),
      isAllowed,
    );
  };
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // ✅ Important : enregistrer le CORS **avant tout le reste**
  const corsOptions: FastifyCorsOptions = {
    origin: buildOriginFn(getAllowedOrigins()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };

  await app.register(fastifyCors, corsOptions);

  // ✅ Ensuite seulement : global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = parseInt(process.env.PORT ?? '3000', 10);
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Serveur lancé sur http://localhost:${port}`);
}

void bootstrap();
