import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsString, IsNumber } from 'class-validator';
import { CreatePostDto } from './create-post.dto';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @IsOptional()
  @IsString({ message: 'El contenido debe ser una cadena de texto' })
  content?: string;

  @IsOptional()
  @IsString({ message: 'La imagen debe ser una cadena de texto' })
  image?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Los likes deben ser un número' })
  likes?: number;
}
