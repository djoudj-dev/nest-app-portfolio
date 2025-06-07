import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AllExceptionsFilter } from './common/exceptions';

function parseAllowedOrigins(): string[] {
  const env = process.env.ALLOWED_ORIGINS;

  try {
    const parsed: unknown = JSON.parse(env ?? '[]');
    if (
      Array.isArray(parsed) &&
      parsed.every((item): item is string => typeof item === 'string')
    ) {
      return parsed;
    } else {
      console.warn('⚠️ ALLOWED_ORIGINS is not a valid array of strings');
    }
  } catch (err) {
    console.error('❌ Failed to parse ALLOWED_ORIGINS:', err);
  }

  return ['https://nedellec-julien.fr']; // fallback
}

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const allowedOrigins = parseAllowedOrigins();

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Type', 'Authorization'],
  });

  console.log('✅ CORS Enabled for:', allowedOrigins);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
