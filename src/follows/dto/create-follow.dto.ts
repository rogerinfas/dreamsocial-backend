import { IsUUID, IsNotEmpty } from 'class-validator';

export class CreateFollowDto {
  @IsUUID()
  @IsNotEmpty()
  followingId: string;
}
