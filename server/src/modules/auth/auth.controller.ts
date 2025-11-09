import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Public()
    @Post('signup')
    signup(@Body() dto: SignupDto)
    {
        return this.authService.signup(dto);
    }

    @Public()
    @Post('signin')
    login(@Body() dto: SigninDto)
    {
        return this.authService.signin(dto);
    }
}