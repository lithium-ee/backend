import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { EndUserService } from './end-user.service';
import { SubmitSongDto } from './interfaces/submit-song.interface';

@Controller('end-user')
export class EndUserController {
    constructor(private readonly endUserService: EndUserService) {}

    @Get('search')
    searchSong(
        @Query('eventId') eventId: string,
        @Query('query') query: string,
    ) {
        return this.endUserService.searchSong(eventId, query);
    }

    @Get('cooldown')
    getCooldown(
        @Query('eventId') eventId: string,
        @Query('userId') userId: string,
    ) {
        return this.endUserService.getCooldown(eventId, userId);
    }

    @Get()
    createNewEndUserForEvent(@Query('eventId') eventId: string) {
        return this.endUserService.createNewEndUserForEvent(eventId);
    }

    @Post('submit-song')
    submitSong(
        @Body()
        submitSongDto: SubmitSongDto,
    ) {
        return this.endUserService.submitSong(submitSongDto);
    }

    @Post('verify')
    verifyEndUserForEvent(
        @Body() verifyUserDto: { eventId: string; userId: string },
    ) {
        return this.endUserService.verifyEndUserForEvent(verifyUserDto);
    }
}