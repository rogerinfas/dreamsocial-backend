import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

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
    @Request() req,
    @UploadedFile() imageFile?: Express.Multer.File,
  ) {
    // El authorId viene del token JWT
    const authorId = req.user.userId;
    return this.postsService.create(createPostDto, authorId, imageFile);
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
  }

  @Get('user/:userId')
  findByAuthor(@Param('userId', ParseIntPipe) userId: number) {
    return this.postsService.findByAuthor(userId);
  }

  @Get(':id')
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
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
    @Request() req,
    @UploadedFile() imageFile?: Express.Multer.File,
  ) {
    return this.postsService.update(id, updatePostDto, req.user.userId, imageFile);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.postsService.remove(id, req.user.userId);
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
