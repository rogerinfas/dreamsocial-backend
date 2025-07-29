# DreamSocial Backend - Documentación Técnica

## 📋 Resumen General

**DreamSocial Backend** es una API REST construida con **NestJS** y **TypeScript** que implementa un sistema de gestión de usuarios y perfiles para una red social. La aplicación utiliza **MySQL** como base de datos principal con **TypeORM** como ORM, siguiendo una arquitectura modular y escalable.

## 🏗️ Arquitectura del Sistema

### Tecnologías Principales
- **Framework**: NestJS v10+
- **Lenguaje**: TypeScript
- **Base de Datos**: MySQL
- **ORM**: TypeORM
- **Autenticación**: bcryptjs para hash de contraseñas
- **Subida de Archivos**: Multer
- **Validación**: class-validator y class-transformer

### Estructura de Módulos

```
src/
├── app.module.ts          # Módulo raíz de la aplicación
├── main.ts               # Punto de entrada de la aplicación
├── users/                # Módulo de gestión de usuarios
│   ├── dto/             # Data Transfer Objects
│   ├── entities/        # Entidades de base de datos
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
└── profiles/            # Módulo de gestión de perfiles
    ├── dto/            # Data Transfer Objects
    ├── entities/       # Entidades de base de datos
    ├── profiles.controller.ts
    ├── profiles.service.ts
    └── profiles.module.ts
```

## 🔧 Módulo Principal (AppModule)

### Configuración
El `AppModule` es el módulo raíz que orquesta toda la aplicación:

```typescript
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      // Configuración MySQL con variables de entorno
      type: 'mysql',
      entities: [User, Profile],
      synchronize: true, // Solo para desarrollo
    }),
    UsersModule,
    ProfilesModule,
  ],
})
```

### Características Técnicas
- **Configuración Global**: Variables de entorno accesibles en toda la aplicación
- **Base de Datos**: Conexión asíncrona a MySQL con TypeORM
- **Sincronización**: Habilitada para desarrollo (auto-creación de tablas)
- **Entidades Registradas**: User y Profile

## 👥 Módulo de Usuarios (UsersModule)

### Entidad User
```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude() // Excluye la contraseña de las respuestas JSON
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Profile, (profile) => profile.user, { cascade: true })
  profile: Profile;
}
```

### Características Técnicas de la Entidad
- **Clave Primaria**: Auto-incremental
- **Email Único**: Constraint de unicidad a nivel de base de datos
- **Seguridad**: Contraseña excluida automáticamente de respuestas
- **Auditoría**: Timestamps automáticos de creación y actualización
- **Relación**: OneToOne con Profile (cascada habilitada)

### UsersService - Lógica de Negocio

#### Métodos Principales

**1. create(createUserDto: CreateUserDto)**
```typescript
async create(createUserDto: CreateUserDto): Promise<User> {
  // Validación de email único
  const existingUser = await this.userRepository.findOne({ where: { email } });
  if (existingUser) {
    throw new ConflictException('El email ya está registrado');
  }
  
  // Hash de contraseña con bcrypt (saltRounds: 10)
  const hashedPassword = await bcrypt.hash(password, 10);
  
  // Creación y persistencia
  const user = this.userRepository.create({ email, password: hashedPassword });
  return await this.userRepository.save(user);
}
```

**2. findAll() / findOne(id) / findByEmail(email)**
- Incluyen relaciones con Profile automáticamente
- Manejo de excepciones NotFoundException
- Queries optimizadas con TypeORM

**3. update(id: number, updateUserDto: UpdateUserDto)**
- Re-hash de contraseña si se actualiza
- Validación de existencia previa
- Actualización parcial con Object.assign()

**4. validatePassword(plainPassword: string, hashedPassword: string)**
- Comparación segura con bcrypt.compare()
- Método auxiliar para autenticación

### Arquitectura del Módulo
- **Inyección de Dependencias**: Repository pattern con @InjectRepository
- **Exportación**: UsersService exportado para uso en otros módulos
- **Manejo de Errores**: Excepciones específicas de NestJS

## 👤 Módulo de Perfiles (ProfilesModule)

### Entidad Profile
```typescript
@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  avatar: string; // Ruta del archivo de avatar

  @OneToOne(() => User, (user) => user.profile, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
}
```

### Características Técnicas de la Entidad
- **Relación Bidireccional**: OneToOne con User
- **Eliminación en Cascada**: onDelete: 'CASCADE'
- **Join Column**: Profile es el propietario de la relación
- **Avatar Opcional**: Campo nullable para imagen de perfil

### ProfilesService - Lógica de Negocio Avanzada

#### Gestión de Archivos con Multer

**Configuración en ProfilesModule:**
```typescript
MulterModule.register({
  storage: diskStorage({
    destination: './uploads/avatars',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(null, `avatar-${uniqueSuffix}${extname(file.originalname)}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    // Solo imágenes: jpg, jpeg, png, webp
    if (!file.originalname.match(/\.(jpg|jpeg|png|webp)$/)) {
      return cb(new Error('Solo se permiten archivos de imagen'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB máximo
})
```

#### Métodos Principales

**1. create(createProfileDto, avatarFile?)**
```typescript
async create(createProfileDto: CreateProfileDto, avatarFile?: Express.Multer.File) {
  // Validación de usuario existente
  const user = await this.usersService.findOne(userId);
  
  // Prevención de perfiles duplicados
  const existingProfile = await this.profileRepository.findOne({
    where: { user: { id: userId } }
  });
  if (existingProfile) {
    throw new ConflictException('El usuario ya tiene un perfil');
  }
  
  // Manejo de avatar opcional
  if (avatarFile) {
    profile.avatar = `uploads/avatars/${avatarFile.filename}`;
  }
}
```

**2. update(id, updateProfileDto, avatarFile?)**
- **Gestión de Archivos**: Eliminación automática de avatar anterior
- **Validación de Rutas**: Verificación de existencia con fs.existsSync()
- **Actualización Atómica**: Transacción implícita con TypeORM

**3. remove(id)**
- **Limpieza de Archivos**: Eliminación física del avatar del sistema de archivos
- **Eliminación en Cascada**: Manejo automático de relaciones

### Dependencias entre Módulos
```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([Profile]),
    UsersModule, // Importación del módulo completo
    MulterModule.register({...}),
  ],
  providers: [ProfilesService],
  controllers: [ProfilesController],
})
```

## 🔗 Relaciones y Dependencias

### Diagrama de Relaciones
```
User (1) ←→ (1) Profile
├── id (PK)           ├── id (PK)
├── email (UNIQUE)    ├── firstName
├── password          ├── lastName
├── createdAt         ├── avatar (nullable)
├── updatedAt         └── user_id (FK)
└── profile
```

### Flujo de Dependencias
1. **AppModule** → Importa UsersModule y ProfilesModule
2. **ProfilesModule** → Importa UsersModule (para UsersService)
3. **ProfilesService** → Inyecta UsersService
4. **Entidades** → Relación bidireccional OneToOne

## 🛡️ Seguridad y Validaciones

### Seguridad de Contraseñas
- **Algoritmo**: bcryptjs con salt rounds = 10
- **Exclusión**: @Exclude() decorator para respuestas JSON
- **Validación**: Método validatePassword() para autenticación

### Validación de Archivos
- **Tipos Permitidos**: jpg, jpeg, png, webp
- **Tamaño Máximo**: 2MB
- **Nomenclatura**: Timestamp + random para evitar colisiones
- **Ubicación**: ./uploads/avatars/

### Manejo de Errores
- **ConflictException**: Emails duplicados, perfiles duplicados
- **NotFoundException**: Recursos no encontrados
- **Validación de Archivos**: Error personalizado para tipos no permitidos

## 🚀 Configuración y Despliegue

### Variables de Entorno (.env)
```
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=dreamsocial
```

### Estructura de Directorios de Producción
```
proyecto/
├── src/                 # Código fuente
├── dist/               # Código compilado
├── uploads/            # Archivos subidos
│   └── avatars/       # Avatares de usuarios
├── node_modules/      # Dependencias
└── .env              # Variables de entorno
```

## 📊 Consideraciones de Rendimiento

### Optimizaciones Implementadas
- **Relaciones Lazy**: Carga bajo demanda con relations: ['profile']
- **Índices**: Email único con índice automático
- **Validaciones Tempranas**: Verificación de existencia antes de operaciones costosas
- **Gestión de Memoria**: Eliminación física de archivos huérfanos

### Escalabilidad
- **Arquitectura Modular**: Fácil extensión con nuevos módulos
- **Inyección de Dependencias**: Testeable y mantenible
- **TypeORM**: Soporte para múltiples bases de datos
- **Configuración Asíncrona**: No bloquea el inicio de la aplicación

---

## 🌐 API REST - Documentación para Frontend

### Base URL
```
http://localhost:3000
```

### Headers Requeridos
```json
{
  "Content-Type": "application/json"
}
```

### Para subida de archivos:
```json
{
  "Content-Type": "multipart/form-data"
}
```

## 👥 Endpoints de Usuarios

### 1. Crear Usuario
```http
POST /users
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "password123"
}
```

**Validaciones:**
- Email: Formato válido y requerido
- Password: Mínimo 6 caracteres, requerido

**Respuesta (201):**
```json
{
  "id": 1,
  "email": "usuario@ejemplo.com",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "profile": null
}
```

**Errores:**
- `409 Conflict`: Email ya registrado
- `400 Bad Request`: Validaciones fallidas

### 2. Obtener Todos los Usuarios
```http
GET /users
```

**Respuesta (200):**
```json
[
  {
    "id": 1,
    "email": "usuario@ejemplo.com",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "profile": {
      "id": 1,
      "firstName": "Juan",
      "lastName": "Pérez",
      "avatar": "uploads/avatars/avatar-1642248600000-123456789.jpg"
    }
  }
]
```

### 3. Obtener Usuario por ID
```http
GET /users/{id}
```

**Parámetros:**
- `id` (number): ID del usuario

**Respuesta (200):** Igual al formato de creación con profile incluido

**Errores:**
- `404 Not Found`: Usuario no encontrado
- `400 Bad Request`: ID inválido

### 4. Actualizar Usuario
```http
PATCH /users/{id}
Content-Type: application/json

{
  "email": "nuevo@email.com",
  "password": "nuevaPassword123"
}
```

**Campos opcionales:** email, password

**Respuesta (200):** Usuario actualizado

### 5. Eliminar Usuario
```http
DELETE /users/{id}
```

**Respuesta (204):** Sin contenido

## 👤 Endpoints de Perfiles

### 1. Crear Perfil
```http
POST /profiles
Content-Type: multipart/form-data

Form Data:
- firstName: "Juan"
- lastName: "Pérez"
- userId: 1
- avatar: [archivo de imagen] (opcional)
```

**Validaciones:**
- firstName: String requerido
- lastName: String requerido
- userId: Number requerido, usuario debe existir
- avatar: jpg, jpeg, png, webp (máx 2MB)

**Respuesta (201):**
```json
{
  "id": 1,
  "firstName": "Juan",
  "lastName": "Pérez",
  "avatar": "uploads/avatars/avatar-1642248600000-123456789.jpg",
  "user": {
    "id": 1,
    "email": "usuario@ejemplo.com",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Errores:**
- `409 Conflict`: Usuario ya tiene perfil
- `404 Not Found`: Usuario no encontrado
- `400 Bad Request`: Archivo inválido o validaciones

### 2. Obtener Todos los Perfiles
```http
GET /profiles
```

**Respuesta (200):** Array de perfiles con usuario incluido

### 3. Obtener Perfil por ID
```http
GET /profiles/{id}
```

**Respuesta (200):** Perfil con usuario incluido

### 4. Obtener Perfil por ID de Usuario
```http
GET /profiles/user/{userId}
```

**Parámetros:**
- `userId` (number): ID del usuario

**Respuesta (200):** Perfil del usuario especificado

**Errores:**
- `404 Not Found`: Perfil no encontrado para ese usuario

### 5. Actualizar Perfil
```http
PATCH /profiles/{id}
Content-Type: multipart/form-data

Form Data:
- firstName: "Juan Carlos" (opcional)
- lastName: "Pérez García" (opcional)
- avatar: [nuevo archivo] (opcional)
```

**Comportamiento:**
- Si se envía nuevo avatar, elimina el anterior automáticamente
- Campos no enviados se mantienen sin cambios

**Respuesta (200):** Perfil actualizado

### 6. Eliminar Perfil
```http
DELETE /profiles/{id}
```

**Comportamiento:**
- Elimina el perfil de la base de datos
- Elimina físicamente el archivo de avatar del servidor
- Elimina el usuario asociado (CASCADE)

**Respuesta (204):** Sin contenido

## 📁 Gestión de Archivos

### Subida de Avatar
- **Campo**: `avatar`
- **Tipos permitidos**: jpg, jpeg, png, webp
- **Tamaño máximo**: 2MB
- **Ubicación**: `./uploads/avatars/`
- **Nomenclatura**: `avatar-{timestamp}-{random}.{ext}`

### Acceso a Archivos
```http
GET /uploads/avatars/{filename}
```

**Ejemplo:**
```
http://localhost:3000/uploads/avatars/avatar-1642248600000-123456789.jpg
```

## 🚨 Códigos de Estado HTTP

| Código | Descripción | Cuándo se usa |
|--------|-------------|---------------|
| 200 | OK | GET, PATCH exitosos |
| 201 | Created | POST exitosos |
| 204 | No Content | DELETE exitosos |
| 400 | Bad Request | Validaciones fallidas, parámetros inválidos |
| 404 | Not Found | Recurso no encontrado |
| 409 | Conflict | Email duplicado, perfil duplicado |
| 413 | Payload Too Large | Archivo mayor a 2MB |
| 415 | Unsupported Media Type | Tipo de archivo no permitido |

## 🔍 Ejemplos de Uso Frontend

### JavaScript/Fetch - Crear Usuario
```javascript
const createUser = async (email, password) => {
  try {
    const response = await fetch('http://localhost:3000/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const user = await response.json();
    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};
```

### JavaScript/Fetch - Crear Perfil con Avatar
```javascript
const createProfile = async (firstName, lastName, userId, avatarFile) => {
  const formData = new FormData();
  formData.append('firstName', firstName);
  formData.append('lastName', lastName);
  formData.append('userId', userId);
  
  if (avatarFile) {
    formData.append('avatar', avatarFile);
  }
  
  try {
    const response = await fetch('http://localhost:3000/profiles', {
      method: 'POST',
      body: formData // NO incluir Content-Type, el navegador lo maneja
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const profile = await response.json();
    return profile;
  } catch (error) {
    console.error('Error creating profile:', error);
    throw error;
  }
};
```

### React Hook - Gestión de Estado
```javascript
import { useState, useEffect } from 'react';

const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  return { users, loading, error, refetch: fetchUsers };
};
```

---

## 🔄 Flujo de Operaciones Típicas

### Registro Completo de Usuario
1. **POST /users** → Crear usuario con email/password
2. **POST /profiles** → Crear perfil asociado con avatar opcional
3. **Resultado**: Usuario con perfil completo en el sistema

### Actualización de Perfil
1. **PATCH /profiles/:id** → Actualizar datos + nuevo avatar
2. **Sistema**: Elimina avatar anterior automáticamente
3. **Resultado**: Perfil actualizado sin archivos huérfanos

### Obtener Datos Completos
1. **GET /users** → Lista todos los usuarios con perfiles
2. **GET /profiles/user/:userId** → Perfil específico de un usuario
3. **Acceso a avatar**: URL directa a archivo estático

Esta arquitectura garantiza un sistema robusto, seguro y escalable para la gestión de usuarios y perfiles en DreamSocial.
