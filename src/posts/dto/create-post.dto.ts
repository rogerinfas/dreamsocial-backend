import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreatePostDto {
  @IsString({ message: 'El contenido debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El contenido es requerido' })
  content: string;

  @IsOptional()
  @IsString({ message: 'La imagen debe ser una cadena de texto' })
  image?: string;
}
