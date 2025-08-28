import { ApiProperty } from '@nestjs/swagger';

export class FollowResponseDto {
  @ApiProperty({
    description: 'ID de la relación de seguimiento',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'ID del usuario que sigue',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  followerId: string;

  @ApiProperty({
    description: 'ID del usuario que es seguido',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  followingId: string;

  @ApiProperty({
    description: 'Fecha de creación de la relación',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}

export class FollowUserDto {
  @ApiProperty({
    description: 'ID del usuario',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@ejemplo.com',
  })
  email: string;

  @ApiProperty({
    description: 'Perfil del usuario',
    type: 'object',
    additionalProperties: true,
  })
  profile: any;
}

export class FollowWithUserDto {
  @ApiProperty({
    description: 'ID de la relación de seguimiento',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'ID del usuario que sigue',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  followerId: string;

  @ApiProperty({
    description: 'ID del usuario que es seguido',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  followingId: string;

  @ApiProperty({
    description: 'Fecha de creación de la relación',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Usuario que sigue',
    type: FollowUserDto,
  })
  follower: FollowUserDto;

  @ApiProperty({
    description: 'Usuario que es seguido',
    type: FollowUserDto,
  })
  following: FollowUserDto;
}

export class FollowStatsDto {
  @ApiProperty({
    description: 'Número de seguidores',
    example: 150,
  })
  followersCount: number;

  @ApiProperty({
    description: 'Número de usuarios seguidos',
    example: 89,
  })
  followingCount: number;

  @ApiProperty({
    description: 'Indica si el usuario actual sigue al usuario consultado',
    example: true,
  })
  isFollowing: boolean;
}

export class FollowListResponseDto {
  @ApiProperty({
    description: 'Lista de usuarios',
    type: [FollowResponseDto],
  })
  users: FollowResponseDto[];

  @ApiProperty({
    description: 'Número total de usuarios',
    example: 25,
  })
  total: number;

  @ApiProperty({
    description: 'Página actual',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Tamaño de la página',
    example: 20,
  })
  limit: number;
}

export class FollowListWithUsersResponseDto {
  @ApiProperty({
    description: 'Lista de usuarios con perfiles',
    type: [FollowWithUserDto],
  })
  users: FollowWithUserDto[];

  @ApiProperty({
    description: 'Número total de usuarios',
    example: 25,
  })
  total: number;

  @ApiProperty({
    description: 'Página actual',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Tamaño de la página',
    example: 20,
  })
  limit: number;
}
