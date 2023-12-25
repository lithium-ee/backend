import { IsNotEmpty, Length } from 'class-validator';

export class SaveCodeDto {
    @IsNotEmpty()
    @Length(10, 100)
    code: string;

    @IsNotEmpty()
    @Length(10, 100)
    access_token: string;
}
