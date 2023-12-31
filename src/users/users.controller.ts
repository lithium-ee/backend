import {
    Body,
    Controller,
    Delete,
    Get,
    Post,
    UseGuards,
    Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SaveCodeDto } from './dto/save-code.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post('save-code')
    async saveCode(@Body() saveCodeDto: SaveCodeDto): Promise<boolean> {
        return this.usersService.saveCode(saveCodeDto);
    }

    @Get('active-devices')
    @UseGuards(AuthGuard) // this endpoint is protected by the AuthGuard
    async getActiveDevices(@Request() req) {
        // You can now use accessToken in your method
        return this.usersService.getActiveDevices(req.user.sub);
    }
    // this endpoints takes a dto from the request body
    @Post()
    async create(
        @Body() createUserDto: CreateUserDto,
    ): Promise<{ access_token: string }> {
        return this.usersService.create(createUserDto);
    }

    // this endpoints returns all users from the database
    @Get()
    async findAll() {
        return this.usersService.findAll();
    }

    @Delete()
    async deleteAll() {
        return this.usersService.deleteAll();
    }
}
