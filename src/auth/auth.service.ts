import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from './user/user.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { User } from '@prisma/client';
import { MailService } from '../mail/mail.service';

type UserWithoutPassword = Omit<User, 'password'>;

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserWithoutPassword | null> {
    try {
      const user = await this.userService.findByEmail(email);
      if (!user) return null;

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) return null;

      const { password: _, ...result } = user;
      return result;
    } catch (error) {
      console.error('validateUser error:', error);
      return null;
    }
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ access_token?: string; error?: string }> {
    try {
      const { email, password } = loginDto;
      const user = await this.validateUser(email, password);

      if (!user) {
        return { error: 'Identifiants invalides' };
      }

      const payload: JwtPayload = { sub: user.id, email: user.email };
      const access_token = this.jwtService.sign(payload);

      await this.userService.updateAccessToken(email, access_token);

      const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
      const refreshTokenExpires = new Date(
        Date.now() + 7 * 24 * 60 * 60 * 1000,
      );
      await this.userService.updateRefreshToken(
        email,
        refreshToken,
        refreshTokenExpires,
      );

      return { access_token };
    } catch (error: unknown) {
      console.error('Login error:', error);
      return { error: 'Connexion échouée. Veuillez réessayer plus tard.' };
    }
  }

  async logout(email: string): Promise<{ success: boolean; message: string }> {
    try {
      await this.userService.invalidateTokens(email);
      return { success: true, message: 'Déconnexion réussie' };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, message: 'Déconnexion échouée' };
    }
  }

  async requestPasswordReset(
    email: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const user = await this.userService.findByEmail(email);
      if (!user) {
        return { success: false, message: 'Utilisateur non trouvé' };
      }

      const result = await this.userService.createPasswordResetToken(email);
      if (!result) {
        return {
          success: false,
          message: 'Échec de création du token de réinitialisation',
        };
      }

      const emailSent = await this.mailService.sendPasswordReset(
        email,
        result.token,
      );
      if (!emailSent) {
        return {
          success: false,
          message: "Échec de l'envoi de l'email de réinitialisation",
        };
      }

      return { success: true, message: 'Email envoyé avec succès' };
    } catch (error) {
      console.error('Password reset request error:', error);
      return { success: false, message: 'Réinitialisation échouée' };
    }
  }

  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const user = await this.userService.resetPassword(token, newPassword);
      if (!user) {
        return { success: false, message: 'Token invalide ou expiré' };
      }

      await this.mailService.sendPasswordChangeConfirmation(user.email);
      return {
        success: true,
        message: 'Mot de passe réinitialisé avec succès',
      };
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        message: 'Erreur lors de la réinitialisation du mot de passe',
      };
    }
  }
}
