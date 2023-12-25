import {
    HttpException,
    HttpStatus,
    Inject,
    Injectable,
    forwardRef,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../auth/auth.service';
import { SaveCodeDto } from './dto/save-code.dto';
import { JwtPayload } from '../auth/interface/jwt-payload.interface';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom, map } from 'rxjs';
import { Device } from './interfaces/device.interface';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @Inject(forwardRef(() => AuthService))
        private authService: AuthService,
        private httpService: HttpService,
    ) {}

    public async create(createUserDto: CreateUserDto) {
        await this.checkIfEmailExists(createUserDto);

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const newUser = this.usersRepository.create({
            ...createUserDto,
            password: hashedPassword,
        });

        await this.usersRepository.save(newUser);

        // return an auth token generated from the signIn func of authservice
        return this.authService.signIn(createUserDto);
    }

    public async saveCode(saveCodeDto: SaveCodeDto): Promise<boolean> {
        try {
            const { access_token } = saveCodeDto;
            const payload: JwtPayload = await this.authService.decodeToken(
                access_token,
            );

            const params = new URLSearchParams();
            params.append('grant_type', 'authorization_code');
            params.append('code', saveCodeDto.code);
            params.append(
                'redirect_uri',
                process.env.FRONTEND_URL + '/set-up/step-two-redirected',
            );
            const res = await lastValueFrom(
                this.httpService
                    .post('https://accounts.spotify.com/api/token', params, {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            Authorization:
                                'Basic ' +
                                Buffer.from(
                                    process.env.CLIENT_ID +
                                        ':' +
                                        process.env.CLIENT_SECRET,
                                ).toString('base64'),
                        },
                    })
                    .pipe(map((resp) => resp.data)),
            );

            let user = await this.usersRepository.findOne({
                where: { id: payload.sub },
            });

            user = {
                ...user,
                code: access_token,
                refreshToken: res.refresh_token,
                accessToken: res.access_token,
            };
            await this.usersRepository.save(user);

            return true; // return true if the operation was successful
        } catch (error) {
            return false; // return false if an error occurred
        }
    }

    public async getActiveDevices(
        userId: string,
        retry = true,
    ): Promise<Device[] | string> {
        try {
            const user = await this.usersRepository.findOne({
                where: { id: userId },
            });

            const url = 'https://api.spotify.com/v1/me/player/devices';
            const headers = { Authorization: `Bearer ${user.accessToken}` };

            const response = await lastValueFrom(
                this.httpService.get(url, { headers }),
            );

            const devices: Device[] = response.data.devices.map(
                (device: any) => ({
                    id: device.id,
                    name: device.name,
                    type: device.type,
                }),
            );

            return devices;
        } catch (error) {
            if (error.response && error.response.status === 401 && retry) {
                const user = await this.usersRepository.findOne({
                    where: { id: userId },
                });

                await this.refreshAccessToken(user);
                return await this.getActiveDevices(userId, false);
            } else {
                // Some other error occurred
                throw new HttpException(
                    'An error occurred while fetching active devices',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    public async setDevice(deviceId: string, userId: string): Promise<boolean> {
        try {
            const user = await this.usersRepository.findOne({
                where: { id: userId },
            });
            user.deviceId = deviceId;
            await this.usersRepository.save(user);

            return true;
        } catch (error) {
            // Some other error occurred
            throw new HttpException(
                'An error occurred while setting active device',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    // this fn returns all users from the database
    public async findAll(): Promise<User[]> {
        return this.usersRepository.find();
    }

    public async findOneByEmail(email: string): Promise<User> {
        return this.usersRepository.findOne({ where: { email } });
    }

    public async findOneByUsername(username: string): Promise<User> {
        return this.usersRepository.findOne({ where: { username } });
    }

    // this fn deletes all users from the database
    public async deleteAll(): Promise<void> {
        await this.usersRepository.delete({});
    }

    private async refreshAccessToken(user: User): Promise<void> {
        const params = new URLSearchParams();
        params.append('grant_type', 'refresh_token');
        params.append('refresh_token', user.refreshToken);
        const res = await lastValueFrom(
            this.httpService
                .post('https://accounts.spotify.com/api/token', params, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        Authorization:
                            'Basic ' +
                            Buffer.from(
                                process.env.CLIENT_ID +
                                    ':' +
                                    process.env.CLIENT_SECRET,
                            ).toString('base64'),
                    },
                })
                .pipe(map((resp) => resp.data)),
        );

        user = {
            ...user,
            accessToken: res.access_token,
        };

        await this.usersRepository.save(user);
    }

    private async checkIfEmailExists(
        createUserDto: CreateUserDto,
    ): Promise<void> {
        const existingEmail = await this.usersRepository.findOne({
            where: { email: createUserDto.email },
        });
        if (existingEmail) {
            throw new HttpException(
                'A user with this email already exists.',
                HttpStatus.BAD_REQUEST,
            );
        }
    }
}
