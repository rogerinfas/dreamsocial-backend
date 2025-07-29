import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Profile } from './entities/profile.entity';
import { UsersService } from '../users/users.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    private readonly usersService: UsersService,
  ) {}

  async create(
    createProfileDto: CreateProfileDto,
    avatarFile?: Express.Multer.File,
  ): Promise<Profile> {
    const { userId, firstName, lastName } = createProfileDto;

    // Verificar que el usuario existe
    const user = await this.usersService.findOne(userId);

    // Verificar que el usuario no tenga ya un perfil
    const existingProfile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
    });
    if (existingProfile) {
      throw new ConflictException('El usuario ya tiene un perfil');
    }

    // Crear el perfil
    const profile = this.profileRepository.create({
      firstName,
      lastName,
      user,
    });

    // Si hay un archivo de avatar, guardar la ruta relativa
    if (avatarFile) {
      profile.avatar = `uploads/avatars/${avatarFile.filename}`;
    }

    return await this.profileRepository.save(profile);
  }

  async findAll(): Promise<Profile[]> {
    return await this.profileRepository.find({
      relations: ['user'],
    });
  }

  async findOne(id: number): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException(`Perfil con ID ${id} no encontrado`);
    }

    return profile;
  }

  async findByUserId(userId: number): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!profile) {
      throw new NotFoundException(
        `Perfil para el usuario con ID ${userId} no encontrado`,
      );
    }

    return profile;
  }

  async update(
    id: number,
    updateProfileDto: UpdateProfileDto,
    avatarFile?: Express.Multer.File,
  ): Promise<Profile> {
    const profile = await this.findOne(id);

    // Si hay un nuevo avatar, eliminar el anterior y guardar el nuevo
    if (avatarFile) {
      // Eliminar avatar anterior si existe
      if (profile.avatar) {
        const oldAvatarPath = path.join(process.cwd(), profile.avatar);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }
      profile.avatar = `uploads/avatars/${avatarFile.filename}`;
    }

    // Actualizar otros campos
    Object.assign(profile, updateProfileDto);

    return await this.profileRepository.save(profile);
  }

  async remove(id: number): Promise<void> {
    const profile = await this.findOne(id);

    // Eliminar avatar si existe
    if (profile.avatar) {
      const avatarPath = path.join(process.cwd(), profile.avatar);
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }

    await this.profileRepository.remove(profile);
  }
}
