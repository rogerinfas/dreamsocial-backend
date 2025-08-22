# Tabla de Permisos por Roles

A continuación se detallan los permisos para los roles `USER` y `ADMIN` en la aplicación.

| Recurso | Acción | Rol USER | Rol ADMIN | Notas |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST /auth/login` | ✅ | ✅ | Endpoint público para iniciar sesión. |
| | `POST /auth/register` | ✅ | ✅ | Endpoint público para registrar nuevos usuarios. |
| **Users** | `GET /users` | ❌ | ✅ | Solo administradores. Requiere autenticación. |
| | `GET /users/:id` | ✅ | ✅ | Requiere autenticación. |
| | `PATCH /users/:id` | ✅ (Solo su propio usuario) | ✅ | Un usuario solo puede modificar su propia información. |
| | `DELETE /users/:id` | ❌ | ✅ | Solo los administradores pueden eliminar usuarios. |
| **Profiles** | `POST /profiles` | ✅ | ✅ | Requiere autenticación. |
| | `GET /profiles` | ❌ | ✅ | Solo administradores. Requiere autenticación. |
| | `GET /profiles/:id` | ✅ | ✅ | Requiere autenticación. |
| | `GET /profiles/user/:userId` | ✅ | ✅ | Requiere autenticación. |
| | `PATCH /profiles/:id` | ✅ (Solo su propio perfil) | ✅ | Un usuario solo puede modificar su propio perfil. |
| | `DELETE /profiles/:id` | ❌ | ✅ | Solo los administradores pueden eliminar perfiles. |
| **Posts** | `POST /posts` | ✅ | ✅ | Requiere autenticación. |
| | `GET /posts` | ✅ | ✅ | Requiere autenticación. Incluye información de likes. |
| | `GET /posts/with-likes` | ✅ | ✅ | Requiere autenticación. Posts con información completa de likes. |
| | `GET /posts/user/:userId` | ✅ | ✅ | Requiere autenticación. Incluye información de likes. |
| | `GET /posts/:id` | ✅ | ✅ | Requiere autenticación. Incluye información de likes. |
| | `PATCH /posts/:id` | ✅ (Solo sus propios posts) | ✅ | Un usuario solo puede modificar sus propios posts. |
| | `DELETE /posts/:id` | ✅ (Solo sus propios posts) | ✅ | Un usuario solo puede eliminar sus propios posts. |
| **Likes** | `POST /likes` | ✅ | ✅ | Requiere autenticación. Crear like a un post. |
| | `POST /likes/toggle/:postId` | ✅ | ✅ | Requiere autenticación. Alternar like (dar/quitar). |
| | `POST /likes/:postId` | ✅ | ✅ | Requiere autenticación. Dar like a un post específico. |
| | `DELETE /likes/:postId` | ✅ | ✅ | Requiere autenticación. Quitar like de un post. |
| | `GET /likes/count/:postId` | ✅ | ✅ | Requiere autenticación. Contador de likes y estado del usuario. |
| | `GET /likes/post/:postId` | ✅ | ✅ | Requiere autenticación. Listar likes de un post. |
| | `GET /likes/user/:userId` | ✅ (Solo propios) | ✅ | Usuario solo puede ver sus propios likes. Admin ve todos. |
| | `GET /likes/my-likes` | ✅ | ✅ | Requiere autenticación. Likes del usuario actual. |
| | `GET /likes` | ❌ | ✅ | Solo administradores. Listar todos los likes del sistema. |
| | `GET /likes/:id` | ✅ | ✅ | Requiere autenticación. Obtener like específico. |
| | `PATCH /likes/:id` | ✅ (Solo propios) | ✅ | Usuario solo puede modificar sus propios likes. |
| | `DELETE /likes/id/:id` | ✅ (Solo propios) | ✅ | Usuario solo puede eliminar sus propios likes. |

## 🔐 Notas de Seguridad del Sistema de Likes

### **Prevención de Likes Duplicados**
- Un usuario solo puede dar like una vez al mismo post
- Constraint único a nivel de base de datos
- Validación en el servicio antes de crear

### **Gestión de Contadores**
- El campo `likes` en posts se actualiza automáticamente
- Sincronización en tiempo real
- Consistencia garantizada con transacciones implícitas

### **Control de Acceso**
- **USER**: Solo puede gestionar sus propios likes
- **ADMIN**: Acceso total a todos los likes del sistema
- Verificación de permisos en cada operación

### **Endpoints Recomendados para Frontend**
- **Toggle Like**: `POST /likes/toggle/:postId` (alternar dar/quitar)
- **Posts con Likes**: `GET /posts/with-likes` (información completa)
- **Contador de Likes**: `GET /likes/count/:postId` (estado actual)
