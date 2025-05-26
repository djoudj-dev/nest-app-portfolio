import {
  Controller,
  Get,
  Body,
  UseGuards,
  Request,
  Patch,
  NotFoundException,
  Post,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { Request as ExpressRequest } from 'express';
import { User } from '@prisma/client';
import { JwtAuthGuard } from '../guard/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../strategies/jwt.strategy';

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    userId: string;
    email: string;
  };
}

@Controller('user')
export class UserController {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(
    @Request() req: AuthenticatedRequest,
  ): Promise<{ email: string; role: string; id: string }> {
    const user = await this.usersService.findByEmail(req.user.email);
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    return { email: user.email, role: user.role, id: user.id };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('password')
  async updatePassword(
    @Request() req: AuthenticatedRequest,
    @Body() dto: UpdatePasswordDto,
  ): Promise<User> {
    return this.usersService.updatePassword(req.user.email, dto.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('refresh-token')
  async updateRefreshToken(
    @Request() req: AuthenticatedRequest,
    @Body() dto: { token: string; expires: Date },
  ): Promise<User> {
    return this.usersService.updateRefreshToken(
      req.user.email,
      dto.token,
      dto.expires,
    );
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @Body() createUserDto: CreateUserDto,
  ): Promise<{ id: string; email: string; access_token: string }> {
    const user = await this.usersService.createUser(createUserDto);

    const payload: JwtPayload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);

    await this.usersService.updateAccessToken(user.email, access_token);

    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
    const refreshTokenExpires = new Date();
    refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 7); // 7 days from now
    await this.usersService.updateRefreshToken(
      user.email,
      refreshToken,
      refreshTokenExpires,
    );

    return { id: user.id, email: user.email, access_token };
  }
}
