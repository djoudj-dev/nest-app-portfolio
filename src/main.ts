import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import fastifyCors, {
  type FastifyCorsOptions,
  OriginFunction,
} from '@fastify/cors';
import type { FastifyRequest, FastifyReply } from 'fastify';

function getAllowedOrigins(): string[] {
  const fallback = [
    'https://nedellec-julien.fr',
    'https://www.nedellec-julien.fr',
  ];
  const raw = process.env.ALLOWED_ORIGINS ?? '[]';

  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      Array.isArray(parsed) &&
      parsed.every((item): item is string => typeof item === 'string')
    ) {
      return parsed;
    }
  } catch {
    console.warn('⚠️ ALLOWED_ORIGINS invalide. Utilisation du fallback.');
  }

  return fallback;
}

function buildOriginFn(allowedOrigins: string[]): OriginFunction {
  return function (
    origin: string | undefined,
    callback: (err: Error | null, allow: boolean) => void,
  ): void {
    if (!origin) {
      callback(null, false);
      return;
    }

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

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const allowedOrigins = getAllowedOrigins();

  const corsOptions: FastifyCorsOptions = {
    origin: buildOriginFn(allowedOrigins),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Type', 'Authorization'],
  };

  await app.register(fastifyCors, corsOptions);

  const fastify = app.getHttpAdapter().getInstance();

  fastify.options('*', (req: FastifyRequest, reply: FastifyReply): void => {
    reply.status(204).send();
  });

  const port = parseInt(process.env.PORT ?? '3000', 10);
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Serveur lancé sur http://localhost:${port}`);
}

void bootstrap();
