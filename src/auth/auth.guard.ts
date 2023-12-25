import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interface/jwt-payload.interface';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        return this.validateRequest(request);
    }

    validateRequest(request): boolean {
        const token =
            request.headers.authorization &&
            request.headers.authorization.split(' ')[1]; // Extract the token from the Authorization header
        if (!token) {
            throw new UnauthorizedException('No token provided');
        }

        try {
            const decoded: JwtPayload = this.jwtService.verify(token); // Use JwtService to verify the token
            request.user = decoded; // Attach the decoded token to the request
            return true;
        } catch (error) {
            throw new UnauthorizedException('Invalid token');
        }
    }
}
