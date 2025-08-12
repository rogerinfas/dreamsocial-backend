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
| | `GET /posts` | ✅ | ✅ | Requiere autenticación. |
| | `GET /posts/user/:userId` | ✅ | ✅ | Requiere autenticación. |
| | `GET /posts/:id` | ✅ | ✅ | Requiere autenticación. |
| | `PATCH /posts/:id` | ✅ (Solo sus propios posts) | ✅ | Un usuario solo puede modificar sus propios posts. |
| | `DELETE /posts/:id` | ✅ (Solo sus propios posts) | ✅ | Un usuario solo puede eliminar sus propios posts. |
| | `POST /posts/:id/like` | ✅ | ✅ | Requiere autenticación. |
| | `POST /posts/:id/unlike` | ✅ | ✅ | Requiere autenticación. |
