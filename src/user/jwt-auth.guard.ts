import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Role } from '@prisma/client';

export interface UserPayload {
  sub: number;
  email: string;
  name: string;
  role: Role;
}

export interface RequestWithUser extends Request {
  user?: UserPayload;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token topilmadi! Tizimga kiring.');
    }

    try {
      const payload = await this.jwtService.verifyAsync<UserPayload>(token, {
        secret: process.env.JWT_SECRET || 'super-secret-key',
      });
      // request'ga user ma'lumotlarini yuklaymiz
      request.user = payload;
    } catch {
      throw new UnauthorizedException("Yaroqsiz yoki muddati o'tgan token!");
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
