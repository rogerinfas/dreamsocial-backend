import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  ForbiddenException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/posts',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `post-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|webp|gif)$/)) {
          return cb(new Error('Solo se permiten archivos de imagen'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
    }),
  )
  create(
    @Body() createPostDto: CreatePostDto,
    @Req() req,
    @UploadedFile() imageFile?: Express.Multer.File,
  ) {
    // El authorId viene del token JWT
    const authorId = req.user.userId;
    return this.postsService.create(createPostDto, authorId, imageFile);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Req() req) {
    // Incluir información de likes para el usuario autenticado
    return this.postsService.findAll(req.user.userId);
  }

  @Get('with-likes')
  @UseGuards(JwtAuthGuard)
  getPostsWithLikeInfo(@Req() req) {
    // Endpoint específico para obtener posts con información completa de likes
    return this.postsService.getPostsWithLikeInfo(req.user.userId);
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  findByAuthor(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Req() req,
  ) {
    // Incluir información de likes para el usuario autenticado
    return this.postsService.findByAuthor(userId, req.user.userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
  ) {
    // Incluir información de likes para el usuario autenticado
    return this.postsService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads/posts',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `post-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|webp|gif)$/)) {
          return cb(new Error('Solo se permiten archivos de imagen'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
    }),
  )
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePostDto: UpdatePostDto,
    @Req() req,
    @UploadedFile() imageFile?: Express.Multer.File,
  ) {
    const userId = req.user.userId;
    return await this.postsService.update(id, updatePostDto, userId, imageFile);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    const userId = req.user.userId;
    await this.postsService.remove(id, userId);
    return { message: 'Post eliminado exitosamente' };
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  likePost(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.likePost(id);
  }

  @Post(':id/unlike')
  @UseGuards(JwtAuthGuard)
  unlikePost(@Param('id', ParseUUIDPipe) id: string) {
    return this.postsService.unlikePost(id);
  }
}
