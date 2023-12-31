import {
    Controller,
    Get,
    UseGuards,
    Request,
    Post,
    Body,
} from '@nestjs/common';
import { SongsService } from './songs.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('songs')
export class SongsController {
    constructor(private readonly songsService: SongsService) {}

    @Get('logs-and-requests')
    @UseGuards(AuthGuard)
    async getLogsAndRequests(@Request() req) {
        return this.songsService.getLogsAndRequests(req.user.sub);
    }

    @Post('accept-request')
    @UseGuards(AuthGuard)
    async acceptRequest(@Request() req, @Body() body: { songId: string }) {
        return this.songsService.acceptRequest(req.user.sub, body.songId);
    }

    @Post('reject-request')
    @UseGuards(AuthGuard)
    async rejectRequest(@Body() body: { songId: string }) {
        return this.songsService.rejectRequest(body.songId);
    }
}
