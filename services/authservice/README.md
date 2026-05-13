# Autentificación
Microservicio de autentificación de usuarios con Spring Boot y Spring Security.

## Requisitos previos
- **Docker** y **Docker Compose**
- **Java 17**
- **Maven** (incluido en el proyecto mediante el wrapper `mvnw`)

## Instrucciones para levantar el servicio

Tienes dos formas de levantar este servicio: de forma completamente local (para desarrollo) o mediante Docker Compose.

### Opción 1: Levantar solo la Base de Datos con Docker y la app localmente

Esta es la mejor opción si vas a estar editando y probando código:

1. Inicia solo el contenedor de la base de datos PostgreSQL:
   ```bash
   docker-compose up -d postgres_auth
   ```
2. Entra al directorio del microservicio:
   ```bash
   cd services/authservice
   ```
3. Ejecuta la aplicación de Spring Boot:
   ```bash
   .\mvnw.cmd spring-boot:run
   ```

### Opción 2: Levantar todo con Docker Compose (Actualizando el .jar)

Dado que la imagen de Docker utiliza el `.jar` compilado, **cada vez que hagas cambios en el código** debes recompilar antes de decirle a Docker que levante todo. Puedes hacer el proceso completo de compilar la app y levantar base de datos + servicio con este único bloque de código:

**En Windows (PowerShell/CMD):**
```bash
cd services\authservice && .\mvnw.cmd clean package -DskipTests && cd ..\.. && docker-compose up --build -d
```

**En Linux/Mac:**
```bash
cd services/authservice && ./mvnw clean package -DskipTests && cd ../.. && docker-compose up --build -d
```

> **Nota:** El comando `--build` obliga a Docker a actualizar la imagen con tu nuevo `.jar`. Al tener un solo comando concatenado con `&&`, ambas cosas subirán de forma sincronizada tras la compilación exitosa.

*(Ten en cuenta que usando Docker, la aplicación estará expuesta en el puerto `8084` en vez del `8080`)*

---

## 📚 Documentación de la API (Swagger UI)

El proyecto incluye **Swagger** (a través de `springdoc-openapi`) para poder testear los endpoints fácilmente desde el navegador.

Dependiendo de cómo hayas levantado la aplicación, la URL de Swagger será diferente:

- **Si ejecutaste la aplicación localmente (Opción 1)**:  
  👉 [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
  
- **Si levantaste todo con Docker (Opción 2)**:  
  👉 [http://localhost:8084/swagger-ui/index.html](http://localhost:8084/swagger-ui/index.html)

Desde ahí podrás ver y probar los endpoints:
- `POST /api/auth/registrar`
- `POST /api/auth/login`

---

## 🏗️ Arquitectura y Características Implementadas

Este microservicio fue diseñado con estándares profesionales para garantizar la seguridad y correcta gestión de los usuarios en la plataforma Donaton.

### 1. Seguridad y Autenticación (JWT)
- **BCrypt**: Las contraseñas nunca se guardan en texto plano. Se utiliza `BCryptPasswordEncoder` para encriptarlas en la base de datos.
- **JSON Web Tokens (JWT)**: Al iniciar sesión (`/api/auth/login`), el servidor devuelve un token firmado digitalmente. Este token contiene el ID del usuario, su correo y su rol.
- **CORS**: Configurado para permitir peticiones desde aplicaciones Frontend (React, Angular, etc.) sin bloqueos del navegador.
- **Manejo Global de Excepciones**: Los errores (credenciales inválidas, correos duplicados, etc.) son interceptados por el `GlobalExceptionHandler`, devolviendo un JSON limpio y estructurado en lugar de un volcado de error de Java.

### 2. Gestión de Roles (RBAC)
El sistema divide a los usuarios en tres categorías principales:
- **USER (Donante)**: Rol asignado por defecto a cualquier usuario que se registre públicamente.
- **TRABAJADOR**: Encargado de logística e inventario.
- **ADMIN**: Control total sobre la plataforma.

### 3. Registro Seguro y Prevención de Spoofing
Para evitar que un usuario común se registre como administrador usando un correo falso:
- **Registro Público (`/api/auth/registrar`)**: Asigna *siempre* el rol `USER`, sin importar el correo.
- **Registro de Personal (`/api/usuarios/registrar-personal`)**: Endpoint protegido. Solo accesible por un `ADMIN`. Aquí, el sistema asigna roles dinámicamente:
  - Correos con `@administrador.` -> Rol `ADMIN`
  - Correos con `@donaton.` -> Rol `TRABAJADOR`

### 4. Endpoints Protegidos (Gestión Administrativa)
Todas las rutas bajo `/api/usuarios/**` requieren que la petición contenga un token JWT de un usuario con rol `ADMIN`.
- `GET /api/usuarios`: Lista todos los usuarios registrados.
- `POST /api/usuarios/registrar-personal`: Crea cuentas para el equipo interno.
- `PUT /api/usuarios/{id}/rol`: Permite a un administrador cambiar (ascender o degradar) el rol de otro usuario.
- `DELETE /api/usuarios/{id}`: Elimina a un usuario del sistema.

### 5. Semilla Inicial (Data Initializer)
Para evitar el problema de "el huevo o la gallina" (necesitar un admin para crear admins), el servicio cuenta con un `DataInitializer`. Si la base de datos está vacía al arrancar, crea automáticamente un usuario administrador por defecto:
- **Correo**: `admin@administrador.cl`
- **Clave**: `admin123`
