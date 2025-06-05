import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MetricsModule } from '../metrics/metrics.module';

@Module({
  imports: [MetricsModule],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}