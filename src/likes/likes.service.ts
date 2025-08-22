import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { Like } from './entities/like.entity';
import { User } from '../users/entities/user.entity';
import { Post } from '../posts/entities/post.entity';
import { LikeResponseDto, LikeCountDto } from './dto/like-response.dto';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createLikeDto: CreateLikeDto, userId: string): Promise<LikeResponseDto> {
    const { postId } = createLikeDto;

    // Verificar que el post existe
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post no encontrado');
    }

    // Verificar que el usuario existe
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar que el usuario no haya dado like ya a este post
    const existingLike = await this.likeRepository.findOne({
      where: { user: { id: userId }, post: { id: postId } },
    });

    if (existingLike) {
      throw new ConflictException('Ya has dado like a este post');
    }

    // Crear el like
    const like = this.likeRepository.create({
      user,
      post,
    });

    const savedLike = await this.likeRepository.save(like);

    // Actualizar el contador de likes en el post
    await this.updatePostLikeCount(postId);

    return {
      id: savedLike.id,
      user,
      post,
      createdAt: savedLike.createdAt,
    };
  }

  async remove(postId: string, userId: string): Promise<void> {
    // Buscar el like existente
    const like = await this.likeRepository.findOne({
      where: { user: { id: userId }, post: { id: postId } },
    });

    if (!like) {
      throw new NotFoundException('No has dado like a este post');
    }

    // Eliminar el like
    await this.likeRepository.remove(like);

    // Actualizar el contador de likes en el post
    await this.updatePostLikeCount(postId);
  }

  async toggleLike(postId: string, userId: string): Promise<LikeCountDto> {
    // Verificar que el post existe
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new NotFoundException('Post no encontrado');
    }

    // Verificar si ya existe un like
    const existingLike = await this.likeRepository.findOne({
      where: { user: { id: userId }, post: { id: postId } },
    });

    if (existingLike) {
      // Si ya existe, eliminar el like
      await this.likeRepository.remove(existingLike);
      await this.updatePostLikeCount(postId);
    } else {
      // Si no existe, crear el like
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) {
        throw new NotFoundException('Usuario no encontrado');
      }

      const like = this.likeRepository.create({ user, post });
      await this.likeRepository.save(like);
      await this.updatePostLikeCount(postId);
    }

    // Retornar el estado actual
    return await this.getLikeCount(postId, userId);
  }

  async getLikeCount(postId: string, userId?: string): Promise<LikeCountDto> {
    // Contar likes del post
    const likeCount = await this.likeRepository.count({
      where: { post: { id: postId } },
    });

    // Verificar si el usuario actual dio like (si se proporciona userId)
    let isLikedByUser = false;
    if (userId) {
      const userLike = await this.likeRepository.findOne({
        where: { user: { id: userId }, post: { id: postId } },
      });
      isLikedByUser = !!userLike;
    }

    return {
      postId,
      likeCount,
      isLikedByUser,
    };
  }

  async getLikesByPost(postId: string): Promise<LikeResponseDto[]> {
    const likes = await this.likeRepository.find({
      where: { post: { id: postId } },
      relations: ['user', 'post'],
      order: { createdAt: 'DESC' },
    });

    return likes.map(like => ({
      id: like.id,
      user: like.user,
      post: like.post,
      createdAt: like.createdAt,
    }));
  }

  async getLikesByUser(userId: string): Promise<LikeResponseDto[]> {
    const likes = await this.likeRepository.find({
      where: { user: { id: userId } },
      relations: ['user', 'post'],
      order: { createdAt: 'DESC' },
    });

    return likes.map(like => ({
      id: like.id,
      user: like.user,
      post: like.post,
      createdAt: like.createdAt,
    }));
  }

  async findAll(): Promise<LikeResponseDto[]> {
    const likes = await this.likeRepository.find({
      relations: ['user', 'post'],
      order: { createdAt: 'DESC' },
    });

    return likes.map(like => ({
      id: like.id,
      user: like.user,
      post: like.post,
      createdAt: like.createdAt,
    }));
  }

  async findOne(id: string): Promise<LikeResponseDto> {
    const like = await this.likeRepository.findOne({
      where: { id },
      relations: ['user', 'post'],
    });

    if (!like) {
      throw new NotFoundException('Like no encontrado');
    }

    return {
      id: like.id,
      user: like.user,
      post: like.post,
      createdAt: like.createdAt,
    };
  }

  async update(id: string, updateLikeDto: UpdateLikeDto): Promise<LikeResponseDto> {
    const like = await this.likeRepository.findOne({
      where: { id },
      relations: ['user', 'post'],
    });

    if (!like) {
      throw new NotFoundException('Like no encontrado');
    }

    // Actualizar el like (aunque en la práctica no se suele actualizar)
    Object.assign(like, updateLikeDto);
    const updatedLike = await this.likeRepository.save(like);

    return {
      id: updatedLike.id,
      user: updatedLike.user,
      post: updatedLike.post,
      createdAt: updatedLike.createdAt,
    };
  }

  async removeById(id: string, userId: string): Promise<void> {
    const like = await this.likeRepository.findOne({
      where: { id },
      relations: ['user', 'post'],
    });

    if (!like) {
      throw new NotFoundException('Like no encontrado');
    }

    // Verificar que el usuario solo puede eliminar sus propios likes
    if (like.user.id !== userId) {
      throw new ForbiddenException('Solo puedes eliminar tus propios likes');
    }

    await this.likeRepository.remove(like);
    
    // Actualizar el contador de likes en el post
    await this.updatePostLikeCount(like.post.id);
  }

  private async updatePostLikeCount(postId: string): Promise<void> {
    const likeCount = await this.likeRepository.count({
      where: { post: { id: postId } },
    });

    await this.postRepository.update(postId, { likes: likeCount });
  }
}
