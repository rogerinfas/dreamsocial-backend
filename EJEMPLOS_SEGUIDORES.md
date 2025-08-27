# 🧪 Ejemplos Prácticos - Sistema de Seguidores

## 📱 Casos de Uso Comunes

### **1. Seguir a un Usuario**

```bash
# Seguir a un usuario específico
curl -X POST http://localhost:3000/follows \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "followingId": "123e4567-e89b-12d3-a456-426614174000"
  }'
```

**Respuesta Exitosa:**
```json
{
  "id": "456e7890-e89b-12d3-a456-426614174000",
  "followerId": "789e0123-e89b-12d3-a456-426614174000",
  "followingId": "123e4567-e89b-12d3-a456-426614174000",
  "createdAt": "2024-01-01T12:00:00.000Z"
}
```

### **2. Alternar Seguimiento (Toggle)**

```bash
# Alternar entre seguir y dejar de seguir
curl -X POST http://localhost:3000/follows/toggle/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Respuesta:**
```json
{
  "isFollowing": true
}
```

### **3. Obtener Estadísticas de Seguimiento**

```bash
# Ver estadísticas de un usuario
curl -X GET http://localhost:3000/follows/stats/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Respuesta:**
```json
{
  "followersCount": 150,
  "followingCount": 89,
  "isFollowing": true
}
```

### **4. Lista de Seguidores**

```bash
# Ver quién te sigue
curl -X GET "http://localhost:3000/follows/followers/123e4567-e89b-12d3-a456-426614174000?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Respuesta:**
```json
{
  "users": [
    {
      "id": "789e0123-e89b-12d3-a456-426614174000",
      "email": "usuario1@ejemplo.com",
      "profile": {
        "firstName": "Juan",
        "lastName": "Pérez",
        "avatar": "avatar1.jpg"
      },
      "followedAt": "2024-01-01T10:00:00.000Z"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 10
}
```

### **5. Lista de Usuarios Seguidos**

```bash
# Ver a quién sigues
curl -X GET "http://localhost:3000/follows/following/123e4567-e89b-12d3-a456-426614174000?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **6. Usuarios Sugeridos**

```bash
# Obtener sugerencias de usuarios para seguir
curl -X GET "http://localhost:3000/follows/suggested?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### **7. Verificar si Sigues a Alguien**

```bash
# Verificar estado de seguimiento
curl -X GET http://localhost:3000/follows/check/123e4567-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Respuesta:**
```json
{
  "isFollowing": true
}
```

### **8. Feed Personalizado**

```bash
# Obtener posts de usuarios seguidos + posts propios
curl -X GET "http://localhost:3000/posts/feed?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Respuesta:**
```json
{
  "posts": [
    {
      "id": "post123",
      "content": "¡Hola mundo!",
      "image": "post-image.jpg",
      "author": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "email": "autor@ejemplo.com",
        "profile": {
          "firstName": "María",
          "lastName": "García"
        }
      },
      "hasLiked": false,
      "likesCount": 5,
      "createdAt": "2024-01-01T12:00:00.000Z"
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 20,
  "hasMore": true
}
```

## 🔄 Flujos Completos de Usuario

### **Flujo 1: Nuevo Usuario Descubriendo la Red**

1. **Registrarse e Iniciar Sesión**
2. **Ver Usuarios Sugeridos**
   ```bash
   GET /follows/suggested
   ```
3. **Seguir a Varios Usuarios**
   ```bash
   POST /follows
   POST /follows
   POST /follows
   ```
4. **Ver Feed Personalizado**
   ```bash
   GET /posts/feed
   ```

### **Flujo 2: Usuario Activo Gestionando Seguimientos**

1. **Ver Estadísticas Propias**
   ```bash
   GET /follows/stats/MY_USER_ID
   ```
2. **Ver Lista de Seguidores**
   ```bash
   GET /follows/followers/MY_USER_ID
   ```
3. **Ver Lista de Seguidos**
   ```bash
   GET /follows/following/MY_USER_ID
   ```
4. **Dejar de Seguir a Alguien**
   ```bash
   DELETE /follows/USER_TO_UNFOLLOW_ID
   ```

### **Flujo 3: Administrador Monitoreando el Sistema**

1. **Ver Todas las Relaciones de Seguimiento**
   ```bash
   GET /follows
   ```
2. **Eliminar Relación Problemática**
   ```bash
   DELETE /follows/admin/RELATION_ID
   ```

## 🧪 Testing con Postman

### **Variables de Entorno**
```json
{
  "base_url": "http://localhost:3000",
  "jwt_token": "YOUR_JWT_TOKEN_HERE",
  "user_id": "YOUR_USER_ID_HERE",
  "target_user_id": "TARGET_USER_ID_HERE"
}
```

### **Colección de Pruebas**

#### **1. Autenticación**
- `POST {{base_url}}/auth/login` - Obtener token JWT
- `POST {{base_url}}/auth/register` - Crear nuevo usuario

#### **2. Operaciones de Seguimiento**
- `POST {{base_url}}/follows` - Seguir usuario
- `POST {{base_url}}/follows/toggle/{{target_user_id}}` - Toggle seguimiento
- `DELETE {{base_url}}/follows/{{target_user_id}}` - Dejar de seguir

#### **3. Consultas de Seguimiento**
- `GET {{base_url}}/follows/stats/{{target_user_id}}` - Estadísticas
- `GET {{base_url}}/follows/followers/{{target_user_id}}` - Seguidores
- `GET {{base_url}}/follows/following/{{target_user_id}}` - Seguidos
- `GET {{base_url}}/follows/suggested` - Usuarios sugeridos
- `GET {{base_url}}/follows/check/{{target_user_id}}` - Verificar seguimiento

#### **4. Feed Personalizado**
- `GET {{base_url}}/posts/feed` - Feed personalizado

## 🚨 Casos de Error Comunes

### **1. Usuario No Encontrado**
```bash
POST /follows
{
  "followingId": "invalid-uuid"
}
```
**Respuesta:**
```json
{
  "statusCode": 404,
  "message": "Usuario a seguir no encontrado"
}
```

### **2. Ya Sigues a Este Usuario**
```bash
POST /follows
{
  "followingId": "already-followed-user-id"
}
```
**Respuesta:**
```json
{
  "statusCode": 409,
  "message": "Ya estás siguiendo a este usuario"
}
```

### **3. No Puedes Seguirte a Ti Mismo**
```bash
POST /follows
{
  "followingId": "your-own-user-id"
}
```
**Respuesta:**
```json
{
  "statusCode": 403,
  "message": "No puedes seguirte a ti mismo"
}
```

### **4. No Estás Siguiendo a Este Usuario**
```bash
DELETE /follows/user-not-followed-id
```
**Respuesta:**
```json
{
  "statusCode": 404,
  "message": "No estás siguiendo a este usuario"
}
```

## 📊 Métricas y Estadísticas

### **Contadores Importantes**
- **Seguidores**: Número de usuarios que te siguen
- **Seguidos**: Número de usuarios que sigues
- **Posts en Feed**: Cantidad de contenido disponible
- **Engagement**: Interacciones con usuarios seguidos

### **Análisis de Crecimiento**
```bash
# Ver estadísticas de múltiples usuarios
for user_id in "user1" "user2" "user3"; do
  curl -X GET "http://localhost:3000/follows/stats/$user_id" \
    -H "Authorization: Bearer YOUR_JWT_TOKEN"
done
```

## 🔧 Optimizaciones Recomendadas

### **1. Paginación Eficiente**
- Usar `limit` apropiado (10-50)
- Implementar cursor-based pagination para feeds grandes

### **2. Caché de Estadísticas**
- Cachear contadores de seguidores
- Actualizar en tiempo real solo cuando sea necesario

### **3. Consultas Optimizadas**
- Usar índices en campos frecuentemente consultados
- Implementar lazy loading para perfiles

---

**¡Estos ejemplos te ayudarán a entender y probar completamente el sistema de seguidores!** 🎯
