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
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';
import { LikeResponseDto, LikeCountDto } from './dto/like-response.dto';

@Controller('likes')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createLikeDto: CreateLikeDto,
    @Request() req,
  ): Promise<LikeResponseDto> {
    return await this.likesService.create(createLikeDto, req.user.id);
  }

  @Post('toggle/:postId')
  @HttpCode(HttpStatus.OK)
  async toggleLike(
    @Param('postId') postId: string,
    @Request() req,
  ): Promise<LikeCountDto> {
    return await this.likesService.toggleLike(postId, req.user.id);
  }

  @Post(':postId')
  @HttpCode(HttpStatus.OK)
  async likePost(
    @Param('postId') postId: string,
    @Request() req,
  ): Promise<LikeResponseDto> {
    return await this.likesService.create({ postId }, req.user.id);
  }

  @Delete(':postId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unlikePost(
    @Param('postId') postId: string,
    @Request() req,
  ): Promise<void> {
    await this.likesService.remove(postId, req.user.id);
  }

  @Get('count/:postId')
  @HttpCode(HttpStatus.OK)
  async getLikeCount(
    @Param('postId') postId: string,
    @Request() req,
  ): Promise<LikeCountDto> {
    return await this.likesService.getLikeCount(postId, req.user.id);
  }

  @Get('post/:postId')
  @HttpCode(HttpStatus.OK)
  async getLikesByPost(
    @Param('postId') postId: string,
  ): Promise<LikeResponseDto[]> {
    return await this.likesService.getLikesByPost(postId);
  }

  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  async getLikesByUser(
    @Param('userId') userId: string,
    @Request() req,
  ): Promise<LikeResponseDto[]> {
    // Solo permitir ver likes propios o si es admin
    if (req.user.role !== Role.ADMIN && req.user.id !== userId) {
      throw new Error('No tienes permisos para ver estos likes');
    }
    return await this.likesService.getLikesByUser(userId);
  }

  @Get('my-likes')
  @HttpCode(HttpStatus.OK)
  async getMyLikes(@Request() req): Promise<LikeResponseDto[]> {
    return await this.likesService.getLikesByUser(req.user.id);
  }

  @Get()
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<LikeResponseDto[]> {
    return await this.likesService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string): Promise<LikeResponseDto> {
    return await this.likesService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateLikeDto: UpdateLikeDto,
    @Request() req,
  ): Promise<LikeResponseDto> {
    // Solo permitir actualizar likes propios o si es admin
    if (req.user.role !== Role.ADMIN) {
      const like = await this.likesService.findOne(id);
      if (like.user.id !== req.user.id) {
        throw new Error('No tienes permisos para actualizar este like');
      }
    }
    return await this.likesService.update(id, updateLikeDto);
  }

  @Delete('id/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeById(
    @Param('id') id: string,
    @Request() req,
  ): Promise<void> {
    await this.likesService.removeById(id, req.user.id);
  }
}
