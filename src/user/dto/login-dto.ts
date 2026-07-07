import { IsEmail, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Emailda xatolik mavjud!' })
  email: string;

  @MinLength(8, { message: 'Parolga eng kamida 8 ta belgi kiritilishi lozim!' })
  password: string;
}
