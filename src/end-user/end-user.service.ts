import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { EndUser } from './end-user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EventsService } from '../events/events.service';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { UsersService } from '../users/users.service';
import { SongsService } from '../songs/songs.service';
import { SubmitSongDto } from './interfaces/submit-song.interface';

@Injectable()
export class EndUserService {
    constructor(
        @InjectRepository(EndUser)
        private readonly endUserRepository: Repository<EndUser>,
        private readonly eventsService: EventsService,
        private readonly usersService: UsersService,
        private readonly songsService: SongsService,
        private httpService: HttpService,
    ) {}
    public async createNewEndUserForEvent(
        eventId: string,
    ): Promise<{ endUserId: string }> {
        const newEndUser = await this.endUserRepository.create({
            event: { id: eventId },
        });
        const res = await this.endUserRepository.save(newEndUser);
        return {
            endUserId: res.id,
        };
    }

    public async verifyEndUserForEvent(verifyUserDto: {
        eventId: string;
        userId: string;
    }): Promise<boolean> {
        const endUser = await this.endUserRepository.findOne({
            where: {
                id: verifyUserDto.userId,
                event: { id: verifyUserDto.eventId },
            },
        });
        if (!endUser) {
            return false;
        }
        return true;
    }

    public async getCooldown(
        eventId: string,
        userId: string,
    ): Promise<{ cooldown: number }> {
        const endUser = await this.endUserRepository.findOne({
            where: {
                id: userId,
                event: { id: eventId },
            },
            relations: ['event'],
        });

        if (!endUser) {
            throw new HttpException(
                'Something went wrong, please rescan QR code',
                HttpStatus.BAD_REQUEST,
            );
        }

        const now = new Date();
        const cooldownStart = endUser.cooldownStart;
        const cooldown = endUser.event.cooldown; // in millisedonds
        console.log(cooldown);

        if (!cooldownStart) {
            // this user has not send a song to this event yet
            return { cooldown: 0 };
        }
        // if cooldown is not 0 and cooldownStart is not null
        // then we need to calculate the remaining cooldown
        const cooldownEnd = new Date(cooldownStart.getTime() + cooldown);
        // if cooldownEnd is in the future, then we need to return the remaining cooldown
        if (cooldownEnd > now) {
            return { cooldown: cooldownEnd.getTime() - now.getTime() };
        }
        // if cooldownEnd is in the past, then we need to return 0
        return { cooldown: 0 };
    }

    public async searchSong(
        eventId: string,
        query: string,
        retry = true,
    ): Promise<any> {
        // get the events auth token
        const user = await this.eventsService.getUserByEventID(eventId);
        try {
            console.log(query);
            const response = await lastValueFrom(
                this.httpService.get('https://api.spotify.com/v1/search', {
                    params: {
                        q: query,
                        type: 'track',
                    },
                    headers: {
                        Authorization: `Bearer ${user.accessToken}`,
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }),
            );

            // log out the first tracks image url

            return response.data.tracks.items.map((item: any) => ({
                id: item.id,
                name: item.name,
                artists:
                    item.artists.length > 1
                        ? `${item.artists
                              .slice(0, -1)
                              .map((artist: any) => artist.name)
                              .join(', ')} and ${
                              item.artists[item.artists.length - 1].name
                          }`
                        : item.artists[0].name,
                image: item.album.images[0].url,
            }));
        } catch (error) {
            if (error.response && error.response.status === 401 && retry) {
                await this.usersService.refreshAccessToken(user);
                return await this.searchSong(eventId, query, false);
            } else {
                // Some other error occurred
                throw new HttpException(
                    'An error occurred while fetching active devices',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    public async submitSong(
        submitSongDto: SubmitSongDto,
    ): Promise<boolean | number> {
        const endUser = await this.endUserRepository.findOne({
            where: {
                id: submitSongDto.userId,
            },
            relations: ['event'],
        });

        if (!endUser) {
            return false;
        }
        const coolDown = await this.getCooldown(
            submitSongDto.eventId,
            submitSongDto.userId,
        );

        if (coolDown.cooldown > 0) {
            return coolDown.cooldown;
        }

        const res = await this.songsService.addSong(
            submitSongDto.song,
            submitSongDto.eventId,
            endUser,
        );

        if (res) {
            endUser.cooldownStart = new Date();
            await this.endUserRepository.save(endUser);
            return true;
        } else {
            return false;
        }
    }
}
