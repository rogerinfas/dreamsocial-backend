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
import { FollowsService } from './follows.service';
import { CreateFollowDto } from './dto/create-follow.dto';
import { FollowQueryDto } from './dto/follow-query.dto';
import { FollowResponseDto, FollowStatsDto, FollowListResponseDto } from './dto/follow-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums/role.enum';

@Controller('follows')
@UseGuards(JwtAuthGuard)
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createFollowDto: CreateFollowDto,
    @Req() req,
  ): Promise<FollowResponseDto> {
    return await this.followsService.create(createFollowDto, req.user.userId);
  }

  @Post('toggle/:userId')
  @HttpCode(HttpStatus.OK)
  async toggleFollow(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Req() req,
  ): Promise<{ isFollowing: boolean }> {
    return await this.followsService.toggleFollow(userId, req.user.userId);
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async unfollow(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Req() req,
  ): Promise<void> {
    await this.followsService.unfollow(userId, req.user.userId);
  }

  @Get('stats/:userId')
  @HttpCode(HttpStatus.OK)
  async getFollowStats(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Req() req,
  ): Promise<FollowStatsDto> {
    return await this.followsService.getFollowStats(userId, req.user.userId);
  }

  @Get('followers/:userId')
  @HttpCode(HttpStatus.OK)
  async getFollowers(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query() query: FollowQueryDto,
    @Req() req,
  ): Promise<FollowListResponseDto> {
    return await this.followsService.getFollowers(userId, query, req.user.userId);
  }

  @Get('following/:userId')
  @HttpCode(HttpStatus.OK)
  async getFollowing(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query() query: FollowQueryDto,
    @Req() req,
  ): Promise<FollowListResponseDto> {
    return await this.followsService.getFollowing(userId, query, req.user.userId);
  }

  @Get('suggested')
  @HttpCode(HttpStatus.OK)
  async getSuggestedUsers(
    @Query() query: FollowQueryDto,
    @Req() req,
  ): Promise<FollowListResponseDto> {
    return await this.followsService.getSuggestedUsers(req.user.userId, query);
  }

  @Get('check/:userId')
  @HttpCode(HttpStatus.OK)
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
  async findAll(): Promise<FollowResponseDto[]> {
    return await this.followsService.findAll();
  }

  @Delete('admin/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.followsService.remove(id);
  }
}
