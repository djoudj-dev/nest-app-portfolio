import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  constructor(private jwtService: JwtService) {
    super();
  }

  canActivate(): boolean | Promise<boolean> | Observable<boolean> {
    // Always allow the request to proceed
    return true;
  }

  handleRequest<TUser = any>(
    _err: unknown,
    user: unknown,
    _info: unknown,
    context: ExecutionContext,
  ): TUser {
    // If regular authentication worked, return the user
    if (user && typeof user === 'object' && 'email' in user) {
      return user as TUser;
    }

    // If authentication failed, try to extract the token manually
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        // Decode the token without verification
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const payload = this.jwtService.decode(token);
        if (payload && typeof payload === 'object' && 'email' in payload) {
          // Create a minimal user object with just the email
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
          const email = payload.email;
          if (typeof email === 'string') {
            return { email } as TUser;
          }
        }
      } catch {
        // Ignore decoding errors
      }
    }

    // If we couldn't extract a user, return an empty object
    // This will allow the request to proceed but with no user info
    return {} as TUser;
  }
}
