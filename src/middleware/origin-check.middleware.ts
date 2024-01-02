import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class OriginCheckMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const allowedOrigins = [
            process.env.FRONTEND_URL,
            process.env.CLIENT_URL,
        ];
        const origin = req.headers.origin;

        if (!allowedOrigins.includes(origin)) {
            console.log(origin);
            console.log(allowedOrigins);
            res.status(403).send('Origin not allowed');
        } else {
            next();
        }
    }
}
