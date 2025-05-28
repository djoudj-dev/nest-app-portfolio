import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from './user/user.service';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import { User } from '@prisma/client';

type UserWithoutPassword = Omit<User, 'password'>;

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<UserWithoutPassword | null> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...result } = user;
    return result as UserWithoutPassword;
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string }> {
    try {
      const { email, password } = loginDto;
      console.log(`Attempting login for email: ${email}`);

      const user = await this.validateUser(email, password);

      if (!user) {
        console.log(`Invalid credentials for email: ${email}`);
        // Instead of throwing inside the try block, return a rejected promise
        return Promise.reject(new UnauthorizedException('Invalid credentials'));
      }

      console.log(`User authenticated successfully: ${email}`);
      const payload: JwtPayload = { sub: user.id, email: user.email };

      try {
        const access_token = this.jwtService.sign(payload);
        console.log(`JWT token generated successfully for user: ${email}`);

        // Store the access token in the database
        console.log(`Updating access token in database for user: ${email}`);
        await this.userService.updateAccessToken(email, access_token);

        // Generate and store a refresh token
        console.log(`Generating refresh token for user: ${email}`);
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });
        const refreshTokenExpires = new Date();
        refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 7); // 7 days from now

        console.log(`Updating refresh token in database for user: ${email}`);
        await this.userService.updateRefreshToken(
          email,
          refreshToken,
          refreshTokenExpires,
        );

        console.log(`Login process completed successfully for user: ${email}`);
        return {
          access_token,
        };
      } catch (tokenError: unknown) {
        console.error('Error during token generation or storage:', tokenError);
        if (tokenError instanceof Error) {
          return Promise.reject(
            new Error(`Authentification échouée: ${tokenError.message}`),
          );
        }
        return Promise.reject(
          new Error(
            'Authentification échouée: Impossible de générer ou de stocker les tokens',
          ),
        );
      }
    } catch (error: unknown) {
      console.error('Login error:', error);

      // If it's already an UnauthorizedException, rethrow it
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      // For other errors, throw a generic error to avoid leaking sensitive information
      if (error instanceof Error) {
        throw new Error(`Connexion échouée: ${error.message}`);
      }

      throw new Error('Connexion échouée: Une erreur inattendue est survenue');
    }
  }

  async logout(email: string): Promise<{ message: string }> {
    try {
      console.log(`Attempting logout for email: ${email}`);

      // Invalidate all tokens for the user
      await this.userService.invalidateTokens(email);

      console.log(`Logout successful for email: ${email}`);
      return {
        message: 'Déconnexion réussie',
      };
    } catch (error: unknown) {
      console.error('Logout error:', error);

      // For errors, throw a generic error
      if (error instanceof Error) {
        throw new Error(`Déconnexion échouée: ${error.message}`);
      }

      throw new Error(
        'Déconnexion échouée: Une erreur inattendue est survenue',
      );
    }
  }
}
