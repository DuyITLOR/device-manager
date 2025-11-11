import { Injectable, HttpException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hashPassword, comparePassword } from '../../shared/utils';
import { AUTH_MESSAGES, ROLES, Role } from '../../shared/constants';
import { PrismaClient } from '@prisma/client';
import { UsersService } from '../users/users.service';

type User = { id: string; email: string; password: string; role: Role };

const user: User[] = [];

function throwAuthError(code: keyof typeof AUTH_MESSAGES): never {
  const err = AUTH_MESSAGES[code];
  throw new HttpException({ code, message: err.message }, err.status);
}
@Injectable()
export class AuthService {
  private prisma = new PrismaClient();

  constructor(
    private readonly jwt: JwtService,
    private readonly users: UsersService,
  ) {}

  async signup(dto: {
    email: string;
    password: string;
    name?: string;
    role?: Role;
  }) {
    const exists = await this.users.findByEmail(dto.email);
    if (exists) throwAuthError('AUTH_DUPLICATE_EMAIL');

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: await hashPassword(dto.password),
        name: dto.name ?? '',
        role: dto.role || ROLES.USER,
      },
    });

    return {
      status: AUTH_MESSAGES.SIGNUP_SUCCESS.status,
      success: true,
      message: AUTH_MESSAGES.SIGNUP_SUCCESS.message,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async signin(dto: { email: string; password: string }) {
    if (!dto.email || !dto.password) throwAuthError('AUTH_MISSING_FIELDS');

    const user = await this.users.findByEmail(dto.email);
    if (!user) throwAuthError('AUTH_INVALID_CREDENTIALS');

    const valid = await comparePassword(dto.password, user.password);
    if (!valid) throwAuthError('AUTH_INVALID_CREDENTIALS');

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwt.signAsync(payload);

    return {
      status: AUTH_MESSAGES.LOGIN_SUCCESS.status,
      success: true,
      message: AUTH_MESSAGES.LOGIN_SUCCESS.message,
      data: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
    };
  }
}
