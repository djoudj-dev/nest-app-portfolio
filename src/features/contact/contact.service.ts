import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { Contact } from '@prisma/client';
import { MailService } from '../../mail/mail.service';
import { MetricsService } from '../../metrics/metrics.service';
import { MetricType } from '@prisma/client';
import { handleError } from '../../common/exceptions';

@Injectable()
export class ContactService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly metricsService: MetricsService,
  ) {}

  async create(createContactDto: CreateContactDto): Promise<Contact> {
    try {
      // Create contact record in database
      const contact = await this.prisma.contact.create({
        data: {
          name: createContactDto.name,
          email: createContactDto.email,
          subject: createContactDto.subject,
          message: createContactDto.message,
        },
      });

      // Track contact form submission in metrics
      await this.metricsService.createMetric({
        type: MetricType.CONTACT_FORM_SUBMITTED,
        path: '/contact',
        metadata: { contactId: contact.id },
      });

      // Send confirmation email to user
      await this.mailService.sendContactConfirmation(
        createContactDto.email,
        createContactDto.name,
      );

      // Send notification email to admin
      await this.mailService.sendContactNotification({
        name: createContactDto.name,
        email: createContactDto.email,
        subject: createContactDto.subject,
        message: createContactDto.message,
      });

      return contact;
    } catch (error) {
      return handleError('createContact', error);
    }
  }

  async findAll(): Promise<Contact[]> {
    try {
      return await this.prisma.contact.findMany({
        orderBy: {
          createdAt: 'desc',
        },
      });
    } catch (error) {
      return handleError('findAllContacts', error);
    }
  }

  async findOne(id: string): Promise<Contact | null> {
    try {
      return await this.prisma.contact.findUnique({
        where: { id },
      });
    } catch (error) {
      return handleError('findOneContact', error);
    }
  }

  async markAsRead(id: string): Promise<Contact> {
    try {
      return await this.prisma.contact.update({
        where: { id },
        data: { isRead: true },
      });
    } catch (error) {
      return handleError('markContactAsRead', error);
    }
  }

  async remove(id: string): Promise<Contact> {
    try {
      return await this.prisma.contact.delete({
        where: { id },
      });
    } catch (error) {
      return handleError('removeContact', error);
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      return await this.prisma.contact.count({
        where: { isRead: false },
      });
    } catch (error) {
      return handleError('getUnreadContactCount', error);
    }
  }
}
