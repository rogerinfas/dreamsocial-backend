import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Profile } from './entities/profile.entity';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('avatar'))
  async create(
    @Body() createProfileDto: CreateProfileDto,
    @UploadedFile() avatarFile?: Express.Multer.File,
  ): Promise<Profile> {
    return await this.profilesService.create(createProfileDto, avatarFile);
  }

  @Get()
  async findAll(): Promise<Profile[]> {
    return await this.profilesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Profile> {
    return await this.profilesService.findOne(id);
  }

  @Get('user/:userId')
  async findByUserId(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<Profile> {
    return await this.profilesService.findByUserId(userId);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('avatar'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFile() avatarFile?: Express.Multer.File,
  ): Promise<Profile> {
    return await this.profilesService.update(id, updateProfileDto, avatarFile);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return await this.profilesService.remove(id);
  }
}
