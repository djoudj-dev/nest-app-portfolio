import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { MetricsModule } from './metrics/metrics.module';
import { MetricsMiddleware } from './metrics/middleware/metrics.middleware';
import { ConfigModule } from '@nestjs/config';
import { CvModule } from './features/cv/cv.module';
import { BadgeModule } from './features/badge/badge.module';
import { ProjectModule } from './features/projects/project.module';
import { MailModule } from './mail/mail.module';
import { ContactModule } from './features/contact/contact.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    PrismaModule,
    MetricsModule,
    CvModule,
    BadgeModule,
    ProjectModule,
    MailModule,
    ContactModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(MetricsMiddleware).exclude('uploads/(.*)').forRoutes('*');
  }
}
