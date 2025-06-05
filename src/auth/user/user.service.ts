import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
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

  async createPasswordResetToken(
    email: string,
  ): Promise<{ token: string; expires: Date } | null> {
    try {
      // Generate a random token
      const token = crypto.randomBytes(32).toString('hex');

      // Set expiration to 1 hour from now
      const expires = new Date();
      expires.setHours(expires.getHours() + 1);

      // Update the user with the reset token and expiration
      await this.prisma.user.update({
        where: { email },
        data: {
          resetPasswordToken: token,
          resetPasswordExpires: expires,
        },
      });

      return { token, expires };
    } catch (error: unknown) {
      handleError('createPasswordResetToken', error);
      return null;
    }
  }

  async validatePasswordResetToken(token: string): Promise<User | null> {
    try {
      return await this.prisma.user.findFirst({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: {
            gt: new Date(), // Token must not be expired
          },
        },
      });
    } catch (error: unknown) {
      handleError('validatePasswordResetToken', error);
      return null;
    }
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<User | null> {
    try {
      // Find the user with the valid token
      const user = await this.validatePasswordResetToken(token);

      if (!user) {
        return null;
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the user's password and clear the reset token
      return await this.prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetPasswordToken: null,
          resetPasswordExpires: null,
        },
      });
    } catch (error: unknown) {
      handleError('resetPassword', error);
      return null;
    }
  }
}
