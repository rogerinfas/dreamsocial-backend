import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ForbiddenException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FollowsService } from './follows.service';
import { CreateFollowDto } from './dto/create-follow.dto';
import { FollowQueryDto } from './dto/follow-query.dto';
import { FollowResponseDto, FollowStatsDto, FollowListResponseDto } from './dto/follow-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@ApiTags('follows')
@Controller('follows')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Seguir a un usuario' })
  @ApiResponse({
    status: 201,
    description: 'Usuario seguido exitosamente',
    type: FollowResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 409, description: 'Ya sigues a este usuario' })
  async create(
    @Body() createFollowDto: CreateFollowDto,
    @Req() req,
  ): Promise<FollowResponseDto> {
    return await this.followsService.create(createFollowDto, req.user.userId);
  }

  @Post('toggle/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Alternar entre seguir y dejar de seguir' })
  @ApiResponse({
    status: 200,
    description: 'Estado del seguimiento actualizado',
    schema: {
      type: 'object',
      properties: {
        isFollowing: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async toggleFollow(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Req() req,
  ): Promise<{ isFollowing: boolean }> {
    return await this.followsService.toggleFollow(userId, req.user.userId);
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Dejar de seguir a un usuario' })
  @ApiResponse({ status: 204, description: 'Dejaste de seguir al usuario' })
  @ApiResponse({ status: 404, description: 'No sigues a este usuario' })
  async unfollow(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Req() req,
  ): Promise<void> {
    await this.followsService.unfollow(userId, req.user.userId);
  }

  @Get('stats/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener estadísticas de seguimiento de un usuario' })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de seguimiento',
    type: FollowStatsDto,
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async getFollowStats(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Req() req,
  ): Promise<FollowStatsDto> {
    return await this.followsService.getFollowStats(userId, req.user.userId);
  }

  @Get('followers/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener lista de seguidores de un usuario' })
  @ApiResponse({
    status: 200,
    description: 'Lista de seguidores',
    type: FollowListResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async getFollowers(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query() query: FollowQueryDto,
    @Req() req,
  ): Promise<FollowListResponseDto> {
    return await this.followsService.getFollowers(userId, query, req.user.userId);
  }

  @Get('following/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener lista de usuarios que sigue un usuario' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios seguidos',
    type: FollowListResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  async getFollowing(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query() query: FollowQueryDto,
    @Req() req,
  ): Promise<FollowListResponseDto> {
    return await this.followsService.getFollowing(userId, query, req.user.userId);
  }

  @Get('suggested')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Obtener usuarios sugeridos para seguir' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios sugeridos',
    type: FollowListResponseDto,
  })
  async getSuggestedUsers(
    @Query() query: FollowQueryDto,
    @Req() req,
  ): Promise<FollowListResponseDto> {
    return await this.followsService.getSuggestedUsers(req.user.userId, query);
  }

  @Get('check/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Verificar si sigues a un usuario' })
  @ApiResponse({
    status: 200,
    description: 'Estado del seguimiento',
    schema: {
      type: 'object',
      properties: {
        isFollowing: { type: 'boolean' },
      },
    },
  })
  async isFollowing(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Req() req,
  ): Promise<{ isFollowing: boolean }> {
    const isFollowing = await this.followsService.isFollowing(req.user.userId, userId);
    return { isFollowing };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Obtener todas las relaciones de seguimiento (Solo Admin)' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todas las relaciones de seguimiento',
    type: [FollowResponseDto],
  })
  async findAll(): Promise<FollowResponseDto[]> {
    return await this.followsService.findAll();
  }

  @Delete('admin/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar relación de seguimiento por ID (Solo Admin)' })
  @ApiResponse({ status: 204, description: 'Relación eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Relación no encontrada' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.followsService.remove(id);
  }
}
