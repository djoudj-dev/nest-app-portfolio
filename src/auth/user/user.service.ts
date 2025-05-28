import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { handleError } from '../../common/exceptions';
import { User } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({ where: { email } });
    } catch (error: unknown) {
      return handleError('findByEmail', error);
    }
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    try {
      const password = await bcrypt.hash(dto.password, 10);
      return await this.prisma.user.create({
        data: {
          email: dto.email,
          password,
          role: 'ADMIN',
        },
      });
    } catch (error: unknown) {
      return handleError('createUser', error);
    }
  }

  async updateAccessToken(email: string, token: string): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: { email },
        data: {
          accessToken: token,
        },
      });
    } catch (error: unknown) {
      return handleError('updateAccessToken', error);
    }
  }

  async updateRefreshToken(
    email: string,
    token: string,
    expires: Date,
  ): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: { email },
        data: {
          refreshToken: token,
          refreshTokenExpires: expires,
        },
      });
    } catch (error: unknown) {
      return handleError('updateRefreshToken', error);
    }
  }

  async updatePassword(email: string, newPassword: string): Promise<User> {
    try {
      const password = await bcrypt.hash(newPassword, 10);
      return await this.prisma.user.update({
        where: { email },
        data: { password },
      });
    } catch (error: unknown) {
      return handleError('updatePassword', error);
    }
  }

  async invalidateTokens(email: string): Promise<User> {
    try {
      return await this.prisma.user.update({
        where: { email },
        data: {
          accessToken: null,
          refreshToken: null,
          refreshTokenExpires: null,
        },
      });
    } catch (error: unknown) {
      return handleError('invalidateTokens', error);
    }
  }
}
