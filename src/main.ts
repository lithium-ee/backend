import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { connectionSource } from './data-source';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    await app.listen(3000);

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
