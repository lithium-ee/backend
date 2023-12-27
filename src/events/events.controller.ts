import {
    Body,
    Controller,
    Post,
    UseGuards,
    Request,
    Get,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('events')
export class EventsController {
    constructor(private readonly eventsService: EventsService) {}

    @Post()
    @UseGuards(AuthGuard)
    async create(@Body() createEventDto: CreateEventDto, @Request() req) {
        return this.eventsService.create(createEventDto, req.user.sub);
    }

    @Get('queue-and-requests')
    @UseGuards(AuthGuard)
    async getQueueAndRequests(@Request() req) {
        return this.eventsService.getQueueAndRequests(req.user.sub);
    }

    @Get()
    @UseGuards(AuthGuard)
    async find(@Request() req) {
        return this.eventsService.findEventByUserId(req.user.sub);
    }
}
