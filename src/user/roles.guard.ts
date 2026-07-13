import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';
import { RequestWithUser } from './jwt-auth.guard';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException(
        'Foydalanuvchi tizimga kirmagan (token topilmadi)!',
      );
    }

    if (!user.role) {
      throw new ForbiddenException('Foydalanuvchining roli aniqlanmadi!');
    }

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new ForbiddenException(
        `Sizda ushbu amalni bajarish uchun huquq yetarli emas! Talab etiladigan rollar: ${requiredRoles.join(', ')}`,
      );
    }

    return true;
  }
}
