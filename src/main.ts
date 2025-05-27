import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for Angular frontend
  let allowedOrigins = ['http://localhost:4200']; // Default fallback
  try {
    if (process.env.ALLOWED_ORIGINS) {
      allowedOrigins = JSON.parse(process.env.ALLOWED_ORIGINS) as string[];
    }
  } catch (error) {
    console.error('Failed to parse ALLOWED_ORIGINS:', error);
  }

  app.enableCors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
