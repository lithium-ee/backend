import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class OriginCheckMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const allowedOrigin = process.env.FRONTEND_URL;
        const origin = req.headers.origin;
        console.log(origin);

        // if (
        //     origin !== allowedOrigin ||
        //     origin !== 'http://192.168.1.124:4200'
        // ) {
        //     res.status(403).send('Origin not allowed');
        // } else {
        next();
        // }
    }
}
