import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateLikeDto {
  @IsNotEmpty()
  @IsUUID()
  postId: string;
}
