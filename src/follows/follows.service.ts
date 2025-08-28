import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { Follow } from './entities/follow.entity';
import { User } from '../users/entities/user.entity';
import { CreateFollowDto } from './dto/create-follow.dto';
import { FollowResponseDto, FollowStatsDto, FollowListResponseDto, FollowListWithUsersResponseDto, FollowWithUserDto } from './dto/follow-response.dto';
import { FollowQueryDto } from './dto/follow-query.dto';

@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Crear una nueva relación de seguimiento
   */
  async create(createFollowDto: CreateFollowDto, followerId: string): Promise<FollowResponseDto> {
    // Verificar que el usuario a seguir existe
    const followingUser = await this.userRepository.findOne({
      where: { id: createFollowDto.followingId },
    });
    if (!followingUser) {
      throw new NotFoundException('Usuario a seguir no encontrado');
    }

    // Verificar que no se está siguiendo a sí mismo
    if (followerId === createFollowDto.followingId) {
      throw new ForbiddenException('No puedes seguirte a ti mismo');
    }

    // Verificar que no existe ya la relación
    const existingFollow = await this.followRepository.findOne({
      where: {
        follower: { id: followerId },
        following: { id: createFollowDto.followingId },
      },
    });

    if (existingFollow) {
      throw new ConflictException('Ya estás siguiendo a este usuario');
    }

    // Crear la relación de seguimiento
    const follow = this.followRepository.create({
      follower: { id: followerId },
      following: { id: createFollowDto.followingId },
    });

    const savedFollow = await this.followRepository.save(follow);

    return {
      id: savedFollow.id,
      followerId: savedFollow.follower.id,
      followingId: savedFollow.following.id,
      createdAt: savedFollow.createdAt,
    };
  }

  /**
   * Dejar de seguir a un usuario
   */
  async unfollow(followingId: string, followerId: string): Promise<void> {
    const follow = await this.followRepository.findOne({
      where: {
        follower: { id: followerId },
        following: { id: followingId },
      },
    });

    if (!follow) {
      throw new NotFoundException('No estás siguiendo a este usuario');
    }

    await this.followRepository.remove(follow);
  }

  /**
   * Alternar entre seguir y dejar de seguir
   */
  async toggleFollow(followingId: string, followerId: string): Promise<{ isFollowing: boolean }> {
    const existingFollow = await this.followRepository.findOne({
      where: {
        follower: { id: followerId },
        following: { id: followingId },
      },
    });

    if (existingFollow) {
      await this.followRepository.remove(existingFollow);
      return { isFollowing: false };
    } else {
      await this.create({ followingId }, followerId);
      return { isFollowing: true };
    }
  }

  /**
   * Obtener estadísticas de seguimiento de un usuario
   */
  async getFollowStats(userId: string, currentUserId?: string): Promise<FollowStatsDto> {
    const [followersCount, followingCount] = await Promise.all([
      this.followRepository.count({
        where: { following: { id: userId } },
      }),
      this.followRepository.count({
        where: { follower: { id: userId } },
      }),
    ]);

    let isFollowing = false;
    if (currentUserId && currentUserId !== userId) {
      const follow = await this.followRepository.findOne({
        where: {
          follower: { id: currentUserId },
          following: { id: userId },
        },
      });
      isFollowing = !!follow;
    }

    return {
      followersCount,
      followingCount,
      isFollowing,
    };
  }

  /**
   * Obtener lista de seguidores de un usuario
   */
  async getFollowers(
    userId: string,
    query: FollowQueryDto,
    currentUserId?: string,
  ): Promise<FollowListWithUsersResponseDto> {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const [follows, total] = await this.followRepository.findAndCount({
      where: { following: { id: userId } },
      relations: ['follower', 'follower.profile'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const users = follows.map((follow) => ({
      id: follow.id,
      followerId: follow.follower.id,
      followingId: follow.following.id,
      createdAt: follow.createdAt,
      follower: {
        id: follow.follower.id,
        email: follow.follower.email,
        profile: follow.follower.profile,
      },
      following: {
        id: follow.following.id,
        email: follow.following.email,
        profile: follow.following.profile,
      },
    }));

    return {
      users,
      total,
      page,
      limit,
    };
  }

  /**
   * Obtener lista de usuarios que sigue un usuario
   */
  async getFollowing(
    userId: string,
    query: FollowQueryDto,
    currentUserId?: string,
  ): Promise<FollowListWithUsersResponseDto> {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const [follows, total] = await this.followRepository.findAndCount({
      where: { follower: { id: userId } },
      relations: ['following', 'following.profile'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const users = follows.map((follow) => ({
      id: follow.id,
      followerId: follow.follower.id,
      followingId: follow.following.id,
      createdAt: follow.createdAt,
      follower: {
        id: follow.follower.id,
        email: follow.follower.email,
        profile: follow.follower.profile,
      },
      following: {
        id: follow.following.id,
        email: follow.following.email,
        profile: follow.following.profile,
      },
    }));

    return {
      users,
      total,
      page,
      limit,
    };
  }

  /**
   * Verificar si un usuario sigue a otro
   */
  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.followRepository.findOne({
      where: {
        follower: { id: followerId },
        following: { id: followingId },
      },
    });

    return !!follow;
  }

  /**
   * Obtener usuarios sugeridos para seguir (usuarios que no sigues)
   */
  async getSuggestedUsers(
    currentUserId: string,
    query: FollowQueryDto,
  ): Promise<FollowListWithUsersResponseDto> {
    const { page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    // Obtener IDs de usuarios que ya sigues
    const followingIds = await this.followRepository
      .createQueryBuilder('follow')
      .select('follow.following.id')
      .where('follow.follower.id = :currentUserId', { currentUserId })
      .getRawMany();

    const followingIdSet = new Set(followingIds.map(item => item.following_id));

    // Obtener usuarios que no sigues (excluyendo al usuario actual y a los que ya sigues)
    const [users, total] = await this.userRepository.findAndCount({
      where: {
        id: Not(In([currentUserId, ...Array.from(followingIdSet)])),
      },
      relations: ['profile'],
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      users: users.map((user) => ({
        id: `suggested-${user.id}`, // ID único para usuarios sugeridos
        followerId: currentUserId,
        followingId: user.id,
        createdAt: new Date(),
        follower: {
          id: currentUserId,
          email: '', // No necesitamos el email del follower aquí
          profile: null, // No necesitamos el profile del follower aquí
        },
        following: {
          id: user.id,
          email: user.email,
          profile: user.profile,
        },
      })),
      total,
      page,
      limit,
    };
  }

  /**
   * Obtener todas las relaciones de seguimiento (solo para admins)
   */
  async findAll(): Promise<FollowResponseDto[]> {
    const follows = await this.followRepository.find({
      relations: ['follower', 'following'],
    });

    return follows.map((follow) => ({
      id: follow.id,
      followerId: follow.follower.id,
      followingId: follow.following.id,
      createdAt: follow.createdAt,
    }));
  }

  /**
   * Eliminar una relación de seguimiento por ID (solo para admins)
   */
  async remove(id: string): Promise<void> {
    const follow = await this.followRepository.findOne({
      where: { id },
    });

    if (!follow) {
      throw new NotFoundException('Relación de seguimiento no encontrada');
    }

    await this.followRepository.remove(follow);
  }
}
