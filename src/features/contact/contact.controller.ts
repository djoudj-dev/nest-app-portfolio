import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { Contact } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guard/jwt-auth.guard';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  async create(@Body() createContactDto: CreateContactDto): Promise<Contact> {
    return this.contactService.create(createContactDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(): Promise<Contact[]> {
    return this.contactService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('unread-count')
  async getUnreadCount(): Promise<{ count: number }> {
    const count = await this.contactService.getUnreadCount();
    return { count };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Contact | null> {
    return this.contactService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/read')
  async markAsRead(@Param('id') id: string): Promise<Contact> {
    return this.contactService.markAsRead(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<Contact> {
    return this.contactService.remove(id);
  }
}
