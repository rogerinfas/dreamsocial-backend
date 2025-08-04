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
  ParseIntPipe,
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
  findAll() {
    return this.postsService.findAll();
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  findByAuthor(@Param('userId', ParseIntPipe) userId: number) {
    return this.postsService.findByAuthor(userId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(id);
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
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @Req() req,
    @UploadedFile() imageFile?: Express.Multer.File,
  ) {
    const user = req.user;
    const post = await this.postsService.findOne(id);
    if (user.role !== Role.ADMIN && post.author.id !== user.userId) {
      throw new ForbiddenException('No tienes permisos para actualizar este post.');
    }
    return this.postsService.update(id, updatePostDto, user.userId, imageFile);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.USER)
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req) {
    const user = req.user;
    const post = await this.postsService.findOne(id);
    if (user.role !== Role.ADMIN && post.author.id !== user.userId) {
      throw new ForbiddenException('No tienes permisos para eliminar este post.');
    }
    return this.postsService.remove(id, user.userId);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  likePost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.likePost(id);
  }

  @Post(':id/unlike')
  @UseGuards(JwtAuthGuard)
  unlikePost(@Param('id', ParseIntPipe) id: number) {
    return this.postsService.unlikePost(id);
  }
}
