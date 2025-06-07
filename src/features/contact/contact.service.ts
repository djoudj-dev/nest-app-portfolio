import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { Contact } from '@prisma/client';
import { MailService } from './mail/mail.service';
import { handleError } from '../../common/exceptions/handle-error';

@Injectable()
export class ContactService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  /**
   * Crée un nouveau message de contact et envoie les emails associés.
   */
  async create(createContactDto: CreateContactDto): Promise<Contact> {
    try {
      const contact = await this.prisma.contact.create({
        data: {
          name: createContactDto.name,
          email: createContactDto.email,
          subject: createContactDto.subject,
          message: createContactDto.message,
        },
      });

      await this.mailService.sendContactConfirmation(
        createContactDto.email,
        createContactDto.name,
      );

      await this.mailService.sendContactNotification({
        name: createContactDto.name,
        email: createContactDto.email,
        subject: createContactDto.subject,
        message: createContactDto.message,
      });

      return contact;
    } catch (error) {
      return handleError(
        'createContact',
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Récupère tous les messages de contact, triés du plus récent au plus ancien.
   */
  async findAll(): Promise<Contact[]> {
    try {
      return await this.prisma.contact.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      return handleError(
        'findAllContacts',
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Récupère un message de contact unique par ID.
   */
  async findOne(id: string): Promise<Contact | null> {
    try {
      return await this.prisma.contact.findUnique({ where: { id } });
    } catch (error) {
      return handleError('findOneContact', error, HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Marque un message comme lu.
   */
  async markAsRead(id: string): Promise<Contact> {
    try {
      return await this.prisma.contact.update({
        where: { id },
        data: { isRead: true },
      });
    } catch (error) {
      return handleError('markContactAsRead', error, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Supprime un message de contact.
   */
  async remove(id: string): Promise<Contact> {
    try {
      return await this.prisma.contact.delete({ where: { id } });
    } catch (error) {
      return handleError('removeContact', error, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Compte le nombre de messages non lus.
   */
  async getUnreadCount(): Promise<number> {
    try {
      return await this.prisma.contact.count({ where: { isRead: false } });
    } catch (error) {
      return handleError(
        'getUnreadContactCount',
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
