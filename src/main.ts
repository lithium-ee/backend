import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { connectionSource } from './data-source';
import { OriginCheckMiddleware } from './middleware/origin-check.middleware';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // app.enableCors({
    //     origin: process.env.FRONTEND_URL, // get the origin from the environment variable
    // });
    app.enableCors();

    app.use(new OriginCheckMiddleware().use);
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
