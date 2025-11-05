import { Injectable, ConflictException, UnauthorizedException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hashPassword, comparePassword } from 'src/shared/utils';
import { AUTH_MESSAGES, ROLES, Role } from 'src/shared/constants';
import { PrismaClient } from '@prisma/client';

type User = { id: string, email: string, password: string, role: Role };

const user: User[] = [];

@Injectable()
export class AuthService {
    private prisma = new PrismaClient();

    constructor(private readonly jwt: JwtService) { }

    async signup(dto: { email: string; password: string; name?: string; role?: Role }) {
        const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (exists) throw new ConflictException(AUTH_MESSAGES.EMAIL_EXISTS);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: await hashPassword(dto.password),
                name: dto.name ?? '',
                role: dto.role || ROLES.USER,
            },
        });

        return {
            message: AUTH_MESSAGES.SIGNUP_SUCCESS,
            data: { 
                id: user.id, 
                email: user.email, 
                name: user.name, 
                role: user.role 
            },
        };
    }



    async login(dto: { email: string; password: string }) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user) throw new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS);

        const valid = await comparePassword(dto.password, user.password);
        if (!valid) throw new UnauthorizedException(AUTH_MESSAGES.INVALID_CREDENTIALS);

        const payload = { sub: user.id, email: user.email, role: user.role };
        const accessToken = await this.jwt.signAsync(payload);

        return {
            message: AUTH_MESSAGES.LOGIN_SUCCESS,
            data: {
                accessToken,
                user: { 
                    id: user.id, 
                    email: user.email, 
                    name: user.name, 
                    role: user.role 
                },
            },
        };
    }
}