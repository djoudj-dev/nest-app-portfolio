import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to the database');
    } catch (error: unknown) {
      // Log the error
      console.error('Failed to connect to the database:', error);

      // Also log with NestJS logger (without stack trace to avoid formatting issues)
      this.logger.error('Failed to connect to the database');

      // Rethrow the error
      throw error;
    }
  }
}
