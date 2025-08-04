import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreatePostDto {
  @IsString({ message: 'El contenido debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El contenido es requerido' })
  content: string;

  @IsOptional()
  @IsString({ message: 'La imagen debe ser una cadena de texto' })
  image?: string;

  @IsNumber({}, { message: 'El ID del autor debe ser un número' })
  @IsNotEmpty({ message: 'El ID del autor es requerido' })
  authorId: number;
}
