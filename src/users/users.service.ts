import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password } = createUserDto;

    // Verificar si el email ya existe
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hashear la contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear el usuario
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
    });

    return await this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      relations: ['profile'],
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      relations: ['profile'],
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.password) {
      const saltRounds = 10;
      updateUserDto.password = await bcrypt.hash(
        updateUserDto.password,
        saltRounds,
      );
    }

    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}
