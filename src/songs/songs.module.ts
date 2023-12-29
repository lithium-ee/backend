import { Module } from '@nestjs/common';
import { SongsService } from './songs.service';
import { SongsController } from './songs.controller';
import { Song } from './songs.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { EventsModule } from '../events/events.module';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Song]),
        HttpModule,
        EventsModule,
        UsersModule,
    ],
    controllers: [SongsController],
    providers: [SongsService],
    exports: [SongsService],
})
export class SongsModule {}
