import { IsNotEmpty } from 'class-validator';

export class SetDeviceDto {
    @IsNotEmpty()
    deviceId: string;
}
