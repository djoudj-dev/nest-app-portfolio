import { Module } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactController } from './contact.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [PrismaModule, MailModule],
  controllers: [ContactController],
  providers: [ContactService],
  exports: [ContactService],
})
export class ContactModule {}
