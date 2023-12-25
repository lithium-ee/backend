import { IsEmail, IsNotEmpty, Length } from 'class-validator';

// TODO: Correct field size parameters, in sync with frontend
export class CreateUserDto {
    @IsNotEmpty()
    @Length(1, 50)
    readonly username: string;

    @IsNotEmpty()
    @IsEmail()
    readonly email: string;

    @IsNotEmpty()
    @Length(8, 100)
    readonly password: string;
}
