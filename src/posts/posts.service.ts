import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { UsersService } from '../users/users.service';
import { LikesService } from '../likes/likes.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    private readonly usersService: UsersService,
    private readonly likesService: LikesService,
  ) {}

  async create(
    createPostDto: CreatePostDto,
    authorId: string,
    imageFile?: Express.Multer.File,
  ): Promise<Post> {
    const { content } = createPostDto;

    // Verificar que el usuario existe
    const author = await this.usersService.findOne(authorId);

    // Crear el post
    const post = this.postRepository.create({
      content,
      author,
    });

    // Si hay una imagen, guardar la ruta relativa
    if (imageFile) {
      post.image = `uploads/posts/${imageFile.filename}`;
    }

    return await this.postRepository.save(post);
  }

  async findAll(userId?: string): Promise<Post[]> {
    const posts = await this.postRepository.find({
      relations: ['author', 'author.profile'],
      order: { createdAt: 'DESC' },
    });

    // Si se proporciona userId, agregar información de likes
    if (userId) {
      for (const post of posts) {
        const likeInfo = await this.likesService.getLikeCount(post.id, userId);
        post.likes = likeInfo.likeCount;
      }
    }

    return posts;
  }

  async findOne(id: string, userId?: string): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['author', 'author.profile'],
    });

    if (!post) {
      throw new NotFoundException(`Post con ID ${id} no encontrado`);
    }

    // Si se proporciona userId, agregar información de likes
    if (userId) {
      const likeInfo = await this.likesService.getLikeCount(post.id, userId);
      post.likes = likeInfo.likeCount;
    }

    return post;
  }

  async findByAuthor(authorId: string, userId?: string): Promise<Post[]> {
    // Verificar que el usuario existe
    await this.usersService.findOne(authorId);

    const posts = await this.postRepository.find({
      where: { author: { id: authorId } },
      relations: ['author', 'author.profile'],
      order: { createdAt: 'DESC' },
    });

    // Si se proporciona userId, agregar información de likes
    if (userId) {
      for (const post of posts) {
        const likeInfo = await this.likesService.getLikeCount(post.id, userId);
        post.likes = likeInfo.likeCount;
      }
    }

    return posts;
  }

  async getPostsWithLikeInfo(userId: string): Promise<Post[]> {
    const posts = await this.postRepository.find({
      relations: ['author', 'author.profile'],
      order: { createdAt: 'DESC' },
    });

    // Agregar información de likes para cada post
    for (const post of posts) {
      const likeInfo = await this.likesService.getLikeCount(post.id, userId);
      post.likes = likeInfo.likeCount;
    }

    return posts;
  }

  async update(
    id: string,
    updatePostDto: UpdatePostDto,
    userId: string,
    imageFile?: Express.Multer.File,
  ): Promise<Post> {
    const post = await this.findOne(id);

    // Verificar que el usuario es el autor del post
    if (post.author.id !== userId) {
      throw new ForbiddenException('No tienes permisos para editar este post');
    }

    // Si hay una nueva imagen, eliminar la anterior y guardar la nueva
    if (imageFile) {
      // Eliminar imagen anterior si existe
      if (post.image) {
        const oldImagePath = path.join(process.cwd(), post.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      post.image = `uploads/posts/${imageFile.filename}`;
    }

    // Actualizar contenido si se proporciona
    if (updatePostDto.content) {
      post.content = updatePostDto.content;
    }

    return await this.postRepository.save(post);
  }

  async remove(id: string, userId: string): Promise<void> {
    const post = await this.findOne(id);

    // Verificar que el usuario es el autor del post
    if (post.author.id !== userId) {
      throw new ForbiddenException('No tienes permisos para eliminar este post');
    }

    // Eliminar imagen si existe
    if (post.image) {
      const imagePath = path.join(process.cwd(), post.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await this.postRepository.remove(post);
  }
}
