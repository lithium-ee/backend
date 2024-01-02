import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { Event } from './events.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { UsersService } from '../users/users.service';
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

    public async getCooldown(eventId: string): Promise<number> {
        const event = await this.eventRepository.findOne({
            where: { id: eventId },
        });

        if (!event) {
            throw new HttpException('Event not found', HttpStatus.NOT_FOUND);
        }

        return event.cooldown;
    }
}
