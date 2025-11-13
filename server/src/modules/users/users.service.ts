import { Injectable, HttpException } from '@nestjs/common';
import { PrismaClient, User, Prisma } from '@prisma/client';
import { USER_MESSAGES, ROLES, Role } from '../../shared/constants';
import { createUserDto } from './dto/createUser.dto';
import { hashPassword, comparePassword } from '../../shared/utils';
import { updateUserDto } from './dto/updateUser.dto';
import { changePasswordDto } from './dto/changePassword.dto';
import { updateRoleDto } from './dto/updateRole.dto';
import { QueryUser } from './dto/queryUser.dto';

function throwUserError(code: keyof typeof USER_MESSAGES): never {
  const err = USER_MESSAGES[code];
  throw new HttpException({ code, message: err.message }, err.status);
}
@Injectable()
export class UsersService {
  private prisma = new PrismaClient();

  private sanitize(u: User) {
    const { id, code, name, email, role, createdAt } = u;
    return { id, code, name, email, role, createdAt };
  }

  // Get all users
  async findAll(query: QueryUser) {
    const { code, name, role, limit = 20, page = 1 } = query;
    const where: Prisma.UserWhereInput = {};
    if (role) where.role = role;
    if (name) where.name = { contains: name, mode: 'insensitive' as const };
    if (code) where.code = { contains: code, mode: 'insensitive' as const };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      status: USER_MESSAGES.USER_FETCH_SUCCESS.status,
      success: true,
      message: USER_MESSAGES.USER_FETCH_SUCCESS.message,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit),
      },
      data,
    };
  }

  // Get one user by id
  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throwUserError('USER_NOT_FOUND');

    return this.sanitize(user);
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async create(dto: createUserDto) {
    const existed = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existed) throwUserError('USER_DUPLICATE_EMAIL');

    const hashed = await hashPassword(dto.password);
    const user = await this.prisma.user.create({
      data: {
        code: dto.code,
        name: dto.name,
        email: dto.email,
        password: hashed,
        role: dto.role ?? ROLES.USER,
      },
    });

    return {
      status: USER_MESSAGES.USER_CREATE_SUCCESS.status,
      success: true,
      message: USER_MESSAGES.USER_CREATE_SUCCESS.message,
      data: this.sanitize(user),
    };
  }

  async updateProfile(id: string, dto: updateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throwUserError('USER_NOT_FOUND');

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        name: dto.name ?? user.name,
        code: dto.code ?? user.code,
        role: dto.role ?? user.role,
      },
    });

    return {
      status: USER_MESSAGES.USER_UPDATE_SUCCESS.status,
      success: true,
      message: USER_MESSAGES.USER_UPDATE_SUCCESS.message,
      data: this.sanitize(updated),
    };
  }

  async changePassword(
    id: string,
    dto: changePasswordDto,
    meta: { id: string; role: Role },
  ) {
    if (meta.role === ROLES.USER && meta.id === id)
      throwUserError('USER_FORBIDDEN_CHANGE_PASSWORD_OTHERS');

    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throwUserError('USER_NOT_FOUND');

    const valid = await comparePassword(dto.currentPassword, user.password);
    if (!valid) throwUserError('USER_WRONG_PASSWORD');

    const hashed = await hashPassword(dto.newPassword);
    await this.prisma.user.update({
      where: { id },
      data: { password: hashed },
    });

    return {
      status: USER_MESSAGES.USER_UPDATE_SUCCESS.status,
      success: true,
      message: USER_MESSAGES.USER_UPDATE_SUCCESS.message,
    };
  }

  async updateRole(id: string, dto: updateRoleDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throwUserError('USER_NOT_FOUND');

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        role: dto.role,
      },
    });

    return {
      status: USER_MESSAGES.USER_UPDATE_SUCCESS.status,
      success: true,
      message: USER_MESSAGES.USER_UPDATE_SUCCESS.message,
      data: this.sanitize(updated),
    };
  }

  async delete(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throwUserError('USER_NOT_FOUND');

    await this.prisma.user.delete({ where: { id } });

    return {
      status: USER_MESSAGES.USER_DELETE_SUCCESS.status,
      success: true,
      message: USER_MESSAGES.USER_DELETE_SUCCESS.message,
    };
  }

  async resetPassword(id: string) {
    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        password: await hashPassword('123456'),
      },
    });

    return {
      status: USER_MESSAGES.USER_UPDATE_SUCCESS.status,
      success: true,
      message: USER_MESSAGES.USER_UPDATE_SUCCESS.message,
      data: this.sanitize(updated),
    };
  }
}
