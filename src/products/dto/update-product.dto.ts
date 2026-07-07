import {
  IsOptional,
  IsString,
  Length,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @Length(3, 30)
  title?: string;
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100000)
  price?: number;
}
