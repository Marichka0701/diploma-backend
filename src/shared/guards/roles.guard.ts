import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles } from '../reflectors/roles.reflector';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const roles = this.reflector.get(Roles, context.getHandler());
    if (!roles) {
      return true;
    }

    if (user.role && roles.includes(user.role)) {
      return true;
    }

    return false;
  }
}
