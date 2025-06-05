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
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { OptionalJwtAuthGuard } from './guard/optional-jwt-auth.guard';
import { Request as ExpressRequest } from 'express';

// Define interface for the request with user property
interface RequestWithUser extends ExpressRequest {
  user?: {
    userId?: string;
    email?: string;
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
  @UseGuards(OptionalJwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req: RequestWithUser): Promise<{ message: string }> {
    try {
      // Check if user and email exist
      const email = req.user?.email;

      if (!email) {
        this.logger.log(
          'Logout attempt received without valid user information',
        );
        return { message: 'Déconnexion réussie' };
      }

      this.logger.log(`Logout attempt received for user: ${email}`);
      const result = await this.authService.logout(email);
      this.logger.log(`Logout successful for user: ${email}`);
      return result;
    } catch (error) {
      this.logger.error(
        `Logout failed for user`,
        error instanceof Error ? error.stack : undefined,
      );

      // Return a success message even if there's an error to prevent infinite loops
      return { message: 'Déconnexion réussie' };
    }
  }

  @Post('request-password-reset')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(
    @Body() requestPasswordResetDto: RequestPasswordResetDto,
  ): Promise<{ message: string }> {
    try {
      this.logger.log(
        `Password reset requested for email: ${requestPasswordResetDto.email}`,
      );
      const result = await this.authService.requestPasswordReset(
        requestPasswordResetDto.email,
      );
      this.logger.log(
        `Password reset email sent to: ${requestPasswordResetDto.email}`,
      );
      return result;
    } catch (error) {
      this.logger.error(
        `Password reset request failed for email: ${requestPasswordResetDto.email}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    try {
      this.logger.log('Password reset attempt received');
      const result = await this.authService.resetPassword(
        resetPasswordDto.token,
        resetPasswordDto.newPassword,
      );
      this.logger.log('Password reset successful');
      return result;
    } catch (error) {
      this.logger.error(
        'Password reset failed',
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
