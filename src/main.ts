import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { connectionSource } from './data-source';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    if (process.env.NODE_ENV === 'development') {
        app.enableCors(); // enable CORS for all hosts in development mode
    } else {
        app.enableCors({
            origin: process.env.CORS_ORIGIN, // get the origin from the environment variable
        });
    }
    await app.listen(3000);

    console.log('CORS_ORIGIN', process.env.CORS_ORIGIN);
    connectionSource
        .initialize()
        .then(() => {
            console.log('Data Source has been initialized!');
        })
        .catch((err) => {
            console.error('Error during Data Source initialization', err);
        });
}
bootstrap();
