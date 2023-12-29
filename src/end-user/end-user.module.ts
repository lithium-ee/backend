import { Module } from '@nestjs/common';
import { EndUserService } from './end-user.service';
import { EndUserController } from './end-user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EndUser } from './end-user.entity';
import { EventsModule } from '../events/events.module';
import { HttpModule } from '@nestjs/axios';
import { UsersModule } from '../users/users.module';
import { SongsModule } from '../songs/songs.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([EndUser]),
        EventsModule,
        HttpModule,
        UsersModule,
        SongsModule,
    ],
    controllers: [EndUserController],
    providers: [EndUserService],
})
export class EndUserModule {}
