import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
    imports: [
        UsersModule,
        TypeOrmModule.forRoot({
            type: 'postgres', // the type of your database
            host: process.env.POSTGRES_HOST, // the host of your database
            port: parseInt(process.env.POSTGRES_PORT), // the port of your database
            username: process.env.POSTGRES_USERNAME, // the username to connect to your database
            password: process.env.POSTGRES_PASSWORD, // the password to connect to your database
            database: process.env.POSTGRES_NAME, // the name of your database
            entities: [__dirname + '/**/*.entity{.ts,.js}'], // the path to your entities
            synchronize: false, // whether to automatically create the database schema on every application launch
        }),
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
