import {
  IsEmail,
  IsString,
  Length,
  MinLength,
  IsLowercase,
} from 'class-validator';

export class RegisterDto {
  @IsString({ message: 'Ism matn korinishida bolishi shart!' })
  @Length(3, 50, { message: 'Ism eng oz 3 bolishi zarur!' })
  name: string;

  @IsLowercase()
  @IsEmail({}, { message: 'Emailda xatolik mavjud!' })
  email: string;

  //   @IsInt({ message: "Yosh butun son bo'lishi shart!" })
  //   @Min(0, { message: "Yosh 0 dan kichik bo'la olmaydi!" })
  //   age: number;

  @MinLength(8, { message: 'Parolga eng oz 8 ta belgi kiritilsin!' })
  password: string;
}
