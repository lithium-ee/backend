import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { Event } from './events.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { UsersService } from '../users/users.service';
import { lastValueFrom } from 'rxjs';
import { User } from '../users/users.entity';

@Injectable()
export class EventsService {
    constructor(
        // inject the events repository
        @InjectRepository(Event)
        private eventRepository: Repository<Event>,
        private httpService: HttpService,
        private usersService: UsersService,
    ) {}

    public async create(createEventDto: CreateEventDto, userId: string) {
        const existingEvent = await this.findEventByUserId(userId);

        // if an existing event is found, delete it
        if (existingEvent) {
            await this.eventRepository.remove(existingEvent);
        }

        // create a new event entity
        const newEvent = this.eventRepository.create({
            ...createEventDto,
            user: { id: userId },
        });

        // save the entity to the database
        return this.eventRepository.save(newEvent);
    }

    public async getQueueAndRequests(userId: string, retry = true) {
        try {
            const token = await this.usersService.getAccessToken(userId);
            const url = 'https://api.spotify.com/v1/me/player/queue';
            const headers = { Authorization: `Bearer ${token}` };

            const response = await lastValueFrom(
                this.httpService.get(url, { headers }),
            );

            return {
                queue: response.data.queue.map((item: any) => ({
                    name: item.name,
                    artists: item.artists.map((artist: any) => artist.name),
                })),
                requests: [],
            };
        } catch (error) {
            if (error.response && error.response.status === 401 && retry) {
                const user = await this.usersService.findOneById(userId);

                await this.usersService.refreshAccessToken(user);
                return await this.getQueueAndRequests(userId, false);
            } else {
                // Some other error occurred
                throw new HttpException(
                    'An error occurred while fetching your queue',
                    HttpStatus.INTERNAL_SERVER_ERROR,
                );
            }
        }
    }

    public findEventByUserId(userId: string) {
        return this.eventRepository.findOne({
            where: { user: { id: userId } },
        });
    }

    public async getUserByEventID(eventId: string): Promise<User> {
        const event = await this.eventRepository.findOne({
            where: { id: eventId },
            relations: ['user'],
        });

        if (!event) {
            throw new HttpException('Event not found', HttpStatus.NOT_FOUND);
        }

        return event.user;
    }
}
