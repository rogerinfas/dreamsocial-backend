import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { ProfilesService } from '../profiles/profiles.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private profilesService: ProfilesService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.usersService.findByEmail(email);
      if (user && await bcrypt.compare(password, user.password)) {
        const { password, ...result } = user;
        return result;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    try {
      // 1. Crear el usuario
      const user = await this.usersService.create({
        email: registerDto.email,
        password: registerDto.password,
      });

      // 2. Crear el perfil asociado
      await this.profilesService.create({
        userId: user.id,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
      });

      // 3. Iniciar sesión y devolver el token
      const payload = { email: user.email, sub: user.id, role: user.role };
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          profile: user.profile,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('El email ya está registrado');
      }
      throw error;
    }
  }
}
