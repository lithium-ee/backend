import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('sign-in')
    async login(@Body() loginUserDto: LoginUserDto) {
        return this.authService.signIn(loginUserDto);
    }

    @Post('verify-token')
    async verifyToken(@Body() dto: { access_token: string }) {
        return this.authService.verifyToken(dto.access_token);
    }
}
