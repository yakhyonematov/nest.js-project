import {IsString, IsNotEmpty, Length, IsNumber, Min, Max } from 'class-validator'

export class CreateProductDto {
@IsString({ message: "Title must be text" })
@IsNotEmpty({ message: "Title cannot be empty" })
@Length(3, 30, {
message: "Title: 3,30 belgi"
})
title: string;

@IsNumber({}, { message: "Price must be number" })
@Min(1, { message: "Min narx: 1" })
@Max(100000, { message: "Max narx: 100000" })
price: number;

}