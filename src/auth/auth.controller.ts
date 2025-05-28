import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';

// Define interface for the request with user property
interface RequestWithUser extends ExpressRequest {
  user: {
    userId: string;
    email: string;
  };
}

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<{ access_token: string }> {
    try {
      this.logger.log(`Login attempt received for email: ${loginDto.email}`);
      const result = await this.authService.login(loginDto);
      this.logger.log(`Login successful for email: ${loginDto.email}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Login failed for email: ${loginDto.email}`,
        error instanceof Error ? error.stack : undefined,
      );

      // Rethrow the error to maintain the original status code and message
      throw error;
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req: RequestWithUser): Promise<{ message: string }> {
    try {
      this.logger.log(`Logout attempt received for user: ${req.user.email}`);
      const result = await this.authService.logout(req.user.email);
      this.logger.log(`Logout successful for user: ${req.user.email}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Logout failed for user`,
        error instanceof Error ? error.stack : undefined,
      );

      // Rethrow the error to maintain the original status code and message
      throw error;
    }
  }
}
