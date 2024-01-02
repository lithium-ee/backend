import {
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
    forwardRef,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './interface/jwt-payload.interface';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
    constructor(
        @Inject(forwardRef(() => UsersService))
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}

    async signIn(loginUserDto: LoginUserDto) {
        const user = await this.usersService.findOneByEmail(loginUserDto.email);

        if (
            user &&
            (await bcrypt.compare(loginUserDto.password, user.password))
        ) {
            const payload: JwtPayload = {
                email: user.email,
                sub: user.id,
            };
            return {
                access_token: this.jwtService.sign(payload),
            };
        } else {
            throw new HttpException(
                'Wrong email or password',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    async verifyToken(token: string) {
        // the token has a payload of username and id
        // find the user with the id and validate that they have the same username
        const payload: JwtPayload = this.jwtService.verify(token);
        const user = await this.usersService.findOneByEmail(payload.email);

        if (user && user.id === payload.sub) {
            console.log('here');
            return true;
        } else {
            console.log('didnt allow');
            return false;
        }
    }

    // this fn takes a jwt and returns the username and id
    async decodeToken(token: string) {
        const payload: JwtPayload = this.jwtService.decode(token) as JwtPayload;
        return payload;
    }
}
