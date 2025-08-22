# 🚀 Sistema de Likes Mejorado - DreamSocial Backend

## 📋 Resumen del Sistema

El sistema de likes ha sido completamente rediseñado y mejorado para proporcionar una experiencia más robusta y escalable. Se ha implementado siguiendo las mejores prácticas de NestJS y respetando la arquitectura modular existente.

## 🏗️ Arquitectura del Sistema de Likes

### **Entidad Like**
```typescript
@Entity('likes')
@Unique(['user', 'post']) // Un usuario solo puede dar like una vez al mismo post
export class Like {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Post, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @CreateDateColumn()
  createdAt: Date;
}
```

### **Características Técnicas**
- **ID Único**: UUID para identificación única
- **Relaciones**: ManyToOne con User y Post
- **Constraint Único**: Previene likes duplicados
- **Eliminación en Cascada**: Al eliminar usuario/post se eliminan sus likes
- **Timestamps**: Fecha de creación automática

## 🔗 Relaciones del Sistema

```
User (1) ←→ (N) Likes ←→ (1) Post
```

- **User → Likes**: Un usuario puede dar muchos likes
- **Post → Likes**: Un post puede recibir muchos likes
- **Like**: Entidad intermedia que conecta usuario y post

## 🎯 Funcionalidades Implementadas

### **1. Gestión de Likes**
- ✅ **Dar Like**: Crear un nuevo like a un post
- ✅ **Quitar Like**: Eliminar like existente
- ✅ **Toggle Like**: Alternar entre dar/quitar like
- ✅ **Prevención de Duplicados**: Un usuario solo puede dar like una vez al mismo post

### **2. Consultas y Estadísticas**
- ✅ **Contador de Likes**: Número total de likes por post
- ✅ **Estado de Usuario**: Verificar si el usuario actual dio like
- ✅ **Likes por Post**: Listar todos los likes de un post específico
- ✅ **Likes por Usuario**: Listar todos los likes de un usuario
- ✅ **Likes Propios**: Endpoint para ver likes del usuario autenticado

### **3. Integración con Posts**
- ✅ **Contador Automático**: Actualización automática del campo `likes` en posts
- ✅ **Información en Tiempo Real**: Contador actualizado en cada operación
- ✅ **Relaciones Optimizadas**: Carga eficiente de datos relacionados

## 🛡️ Seguridad y Autorización

### **Guards Implementados**
- **JwtAuthGuard**: Autenticación requerida para todas las operaciones
- **RolesGuard**: Control de acceso basado en roles

### **Permisos por Rol**
- **USER**: 
  - ✅ Dar/quitar like a cualquier post
  - ✅ Ver sus propios likes
  - ✅ Ver likes de posts públicos
  - ❌ Ver likes de otros usuarios
- **ADMIN**: 
  - ✅ Acceso total a todos los likes
  - ✅ Gestión completa del sistema

### **Validaciones de Seguridad**
- Usuario solo puede eliminar sus propios likes
- Verificación de existencia de post y usuario
- Prevención de likes duplicados
- Manejo de errores con códigos HTTP apropiados

## 📡 Endpoints de la API

### **Base URL**
```
http://localhost:3000/likes
```

### **Endpoints Principales**

#### **1. Crear Like**
```http
POST /likes
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "postId": "uuid-del-post"
}
```

**Respuesta (201):**
```json
{
  "id": "uuid-del-like",
  "user": { /* información del usuario */ },
  "post": { /* información del post */ },
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

#### **2. Toggle Like (Recomendado)**
```http
POST /likes/toggle/{postId}
Authorization: Bearer {jwt_token}
```

**Respuesta (200):**
```json
{
  "postId": "uuid-del-post",
  "likeCount": 5,
  "isLikedByUser": true
}
```

#### **3. Quitar Like**
```http
DELETE /likes/{postId}
Authorization: Bearer {jwt_token}
```

**Respuesta (204):** Sin contenido

#### **4. Obtener Contador de Likes**
```http
GET /likes/count/{postId}
Authorization: Bearer {jwt_token}
```

**Respuesta (200):**
```json
{
  "postId": "uuid-del-post",
  "likeCount": 5,
  "isLikedByUser": true
}
```

#### **5. Listar Likes de un Post**
```http
GET /likes/post/{postId}
Authorization: Bearer {jwt_token}
```

**Respuesta (200):**
```json
[
  {
    "id": "uuid-del-like",
    "user": { /* información del usuario */ },
    "post": { /* información del post */ },
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
]
```

#### **6. Mis Likes**
```http
GET /likes/my-likes
Authorization: Bearer {jwt_token}
```

**Respuesta (200):** Array de likes del usuario autenticado

#### **7. Likes de un Usuario Específico**
```http
GET /likes/user/{userId}
Authorization: Bearer {jwt_token}
```

**Nota:** Solo permite ver likes propios o si es admin

#### **8. Todos los Likes (Solo Admin)**
```http
GET /likes
Authorization: Bearer {jwt_token}
```

**Nota:** Requiere rol ADMIN

## 🔄 Integración con Posts

### **Endpoints Mejorados de Posts**

#### **Posts con Información de Likes**
```http
GET /posts/with-likes
Authorization: Bearer {jwt_token}
```

**Respuesta incluye:**
- Información completa del post
- Contador actualizado de likes
- Estado de like del usuario autenticado

#### **Posts por Usuario con Likes**
```http
GET /posts/user/{userId}
Authorization: Bearer {jwt_token}
```

**Respuesta incluye:**
- Posts del usuario especificado
- Contador de likes para cada post
- Estado de like del usuario autenticado

### **Campo Likes Automático**
El campo `likes` en la entidad Post se actualiza automáticamente:
- ✅ Al crear un like: `likes += 1`
- ✅ Al eliminar un like: `likes -= 1`
- ✅ Sincronización en tiempo real

## 📊 DTOs y Tipos de Respuesta

### **CreateLikeDto**
```typescript
export class CreateLikeDto {
  @IsNotEmpty()
  @IsUUID()
  postId: string;
}
```

### **LikeResponseDto**
```typescript
export class LikeResponseDto {
  id: string;
  user: User;
  post: Post;
  createdAt: Date;
}
```

### **LikeCountDto**
```typescript
export class LikeCountDto {
  postId: string;
  likeCount: number;
  isLikedByUser: boolean;
}
```

## 🚨 Manejo de Errores

### **Códigos de Estado HTTP**
| Código | Descripción | Cuándo se usa |
|--------|-------------|---------------|
| 200 | OK | Operaciones exitosas (toggle, consultas) |
| 201 | Created | Like creado exitosamente |
| 204 | No Content | Like eliminado exitosamente |
| 400 | Bad Request | Datos inválidos |
| 401 | Unauthorized | Token JWT inválido o ausente |
| 403 | Forbidden | Sin permisos para la operación |
| 404 | Not Found | Post o usuario no encontrado |
| 409 | Conflict | Like duplicado |

### **Mensajes de Error Comunes**
- `"Post no encontrado"`: El post especificado no existe
- `"Usuario no encontrado"`: El usuario no existe en el sistema
- `"Ya has dado like a este post"`: Intento de like duplicado
- `"No has dado like a este post"`: Intento de quitar like inexistente
- `"No tienes permisos para ver estos likes"`: Acceso denegado

## 🔧 Configuración y Dependencias

### **Módulo de Likes**
```typescript
@Module({
  imports: [
    TypeOrmModule.forFeature([Like, User, Post]),
  ],
  controllers: [LikesController],
  providers: [LikesService],
  exports: [LikesService],
})
export class LikesModule {}
```

### **Dependencias del Servicio**
- **LikeRepository**: Gestión de entidades Like
- **PostRepository**: Acceso a entidades Post
- **UserRepository**: Acceso a entidades User

### **Integración con AppModule**
```typescript
// En app.module.ts
entities: [User, Profile, Post, Like]
```

## 📈 Optimizaciones de Rendimiento

### **Consultas Eficientes**
- **Relaciones Lazy**: Carga bajo demanda
- **Índices Automáticos**: En campos únicos y relaciones
- **Queries Optimizadas**: Uso eficiente de TypeORM

### **Gestión de Memoria**
- **Eliminación en Cascada**: Limpieza automática de datos huérfanos
- **Actualización Atómica**: Contadores sincronizados
- **Transacciones Implícitas**: Consistencia de datos

## 🧪 Testing y Validación

### **Validaciones Implementadas**
- **UUID**: Verificación de formato válido
- **Existencia**: Verificación de post y usuario
- **Unicidad**: Prevención de likes duplicados
- **Permisos**: Verificación de autorización

### **Casos de Prueba Cubiertos**
- ✅ Creación de likes válidos
- ✅ Prevención de likes duplicados
- ✅ Eliminación de likes existentes
- ✅ Toggle de likes
- ✅ Consultas con diferentes permisos
- ✅ Manejo de errores

## 🚀 Uso en Frontend

### **Ejemplo con JavaScript/Fetch**

#### **Toggle Like**
```javascript
const toggleLike = async (postId) => {
  try {
    const response = await fetch(`http://localhost:3000/likes/toggle/${postId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log(`Likes: ${result.likeCount}, Me gusta: ${result.isLikedByUser}`);
    
    // Actualizar UI
    updateLikeButton(result.isLikedByUser);
    updateLikeCount(result.likeCount);
    
  } catch (error) {
    console.error('Error toggling like:', error);
  }
};
```

#### **Obtener Posts con Likes**
```javascript
const getPostsWithLikes = async () => {
  try {
    const response = await fetch('http://localhost:3000/posts/with-likes', {
      headers: {
        'Authorization': `Bearer ${jwtToken}`,
      },
    });
    
    const posts = await response.json();
    
    // Renderizar posts con información de likes
    posts.forEach(post => {
      renderPost(post, post.likes, post.isLikedByUser);
    });
    
  } catch (error) {
    console.error('Error fetching posts:', error);
  }
};
```

### **React Hook para Likes**
```javascript
import { useState, useEffect } from 'react';

const usePostLikes = (postId) => {
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const fetchLikeInfo = async () => {
    try {
      const response = await fetch(`/likes/count/${postId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setLikeCount(data.likeCount);
      setIsLiked(data.isLikedByUser);
    } catch (error) {
      console.error('Error fetching like info:', error);
    }
  };
  
  const toggleLike = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/likes/toggle/${postId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setLikeCount(data.likeCount);
      setIsLiked(data.isLikedByUser);
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchLikeInfo();
  }, [postId]);
  
  return { likeCount, isLiked, loading, toggleLike };
};
```

## 🔄 Flujo de Operaciones

### **1. Usuario Da Like**
1. Frontend envía `POST /likes/toggle/{postId}`
2. Backend verifica autenticación y permisos
3. Se crea el like en la base de datos
4. Se actualiza el contador en la entidad Post
5. Se retorna información actualizada

### **2. Usuario Quita Like**
1. Frontend envía `POST /likes/toggle/{postId}` (mismo endpoint)
2. Backend detecta like existente
3. Se elimina el like de la base de datos
4. Se actualiza el contador en la entidad Post
5. Se retorna información actualizada

### **3. Consulta de Posts con Likes**
1. Frontend envía `GET /posts/with-likes`
2. Backend obtiene todos los posts
3. Para cada post, consulta contador de likes
4. Se retorna array con información completa

## 🌟 Ventajas del Sistema Mejorado

### **1. Escalabilidad**
- **Arquitectura Modular**: Fácil extensión y mantenimiento
- **Relaciones Optimizadas**: Consultas eficientes
- **Separación de Responsabilidades**: Servicios especializados

### **2. Experiencia de Usuario**
- **Toggle Inteligente**: Un solo endpoint para dar/quitar like
- **Información en Tiempo Real**: Contadores siempre actualizados
- **Feedback Inmediato**: Respuesta instantánea a acciones

### **3. Seguridad**
- **Autenticación JWT**: Acceso seguro a todas las operaciones
- **Control de Permisos**: Roles y autorización granular
- **Validación Robusta**: Prevención de datos inválidos

### **4. Mantenibilidad**
- **Código Limpio**: Estructura clara y documentada
- **Testing**: Cobertura completa de funcionalidades
- **Documentación**: Guías detalladas de uso

## 🔮 Futuras Mejoras

### **Funcionalidades Adicionales**
- [ ] **Sistema de Dislikes**: Contrario a likes
- [ ] **Reacciones**: Diferentes tipos de reacciones (❤️, 👍, 😂, etc.)
- [ ] **Notificaciones**: Alertas cuando alguien da like
- [ ] **Analytics**: Estadísticas de engagement
- [ ] **Cache**: Redis para mejorar rendimiento

### **Optimizaciones Técnicas**
- [ ] **Paginación**: Para listas grandes de likes
- [ ] **WebSockets**: Actualizaciones en tiempo real
- [ ] **Rate Limiting**: Prevención de spam
- [ ] **Auditoría**: Logs de todas las operaciones

---

## 📝 Conclusión

El sistema de likes mejorado de DreamSocial representa una implementación robusta y escalable que sigue las mejores prácticas de NestJS. Con su arquitectura modular, sistema de permisos granular y API intuitiva, proporciona una base sólida para la funcionalidad de engagement social.

La integración perfecta con el sistema de posts existente y la gestión automática de contadores asegura una experiencia de usuario fluida y consistente, mientras que las validaciones de seguridad y el manejo de errores garantizan la integridad del sistema.
