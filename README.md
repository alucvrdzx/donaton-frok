# Proyecto Donaton - Plataforma de Microservicios

Donaton es una plataforma humanitaria basada en una arquitectura de microservicios robusta (Spring Boot), orquestada con Docker Compose, y consumida mediante un BFF (Node.js) hacia un Frontend moderno (React con Vite).

## Arquitectura

```
┌─────────────┐     ┌──────────┐     ┌──────────────┐     ┌──────────────────────────┐
│  Frontend   │────▶│   BFF    │────▶│ API Gateway  │────▶│  Microservicios (x5)     │
│  React/Vite │     │ Node.js  │     │ Spring Cloud │     │  Auth · Donaciones ·     │
│  :5173      │     │  :3001   │     │    :8080     │     │  Inventario · Logística  │
└─────────────┘     └──────────┘     └──────────────┘     │  Necesidades             │
                                                          └──────────────────────────┘
                                                                    │
                                                          ┌────────────────────┐
                                                          │  PostgreSQL (x5)   │
                                                          │  RabbitMQ · Redis  │
                                                          └────────────────────┘
```

## Requisitos Previos

Asegúrate de tener instalados los siguientes programas antes de comenzar:

| Herramienta | Versión mínima | Descarga |
|---|---|---|
| Docker Desktop | 4.x | [docker.com](https://www.docker.com/products/docker-desktop/) |
| Java (JDK) | 17 | [adoptium.net](https://adoptium.net/es/) |
| Node.js | 18+ | [nodejs.org](https://nodejs.org/) |
| Git | 2.x | [git-scm.com](https://git-scm.com/) |

> ⚠️ **Docker Desktop debe estar iniciado y corriendo** antes de ejecutar los comandos.

---

## 🚀 Levantar el Proyecto Completo

### Paso 1 — Clonar el repositorio
```bash
git clone <URL_DE_TU_REPOSITORIO_GITHUB>
cd donaton
```

### Paso 2 — Compilar los Microservicios (Backend)

Los Dockerfiles utilizan los archivos `.jar` compilados, por lo tanto es necesario empaquetarlos primero.

**Windows PowerShell:**
```powershell
Push-Location services\authservice;   .\mvnw.cmd clean package -DskipTests -q; Pop-Location
Push-Location services\donaciones;    .\mvnw.cmd clean package -DskipTests -q; Pop-Location
Push-Location services\inventario;    .\mvnw.cmd clean package -DskipTests -q; Pop-Location
Push-Location services\logistica;     .\mvnw.cmd clean package -DskipTests -q; Pop-Location
Push-Location services\necesidades;   .\mvnw.cmd clean package -DskipTests -q; Pop-Location
Push-Location services\gateway;       .\mvnw.cmd clean package -DskipTests -q; Pop-Location
```

**Linux / macOS:**
```bash
for svc in authservice donaciones inventario logistica necesidades gateway; do
  (cd services/$svc && ./mvnw clean package -DskipTests -q)
done
```

### Paso 3 — Levantar toda la infraestructura con Docker Compose

```bash
docker compose up -d --build
```

Esto creará y levantará **13 contenedores**: 5 bases de datos PostgreSQL, RabbitMQ, Redis, 5 microservicios Java y el API Gateway.

Verifica que todo esté corriendo:
```bash
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### Paso 4 — Levantar el BFF (Node.js)

```bash
cd bff
npm install
node index.js
```
> Deberías ver: `🚀 BFF (Node.js) corriendo en http://localhost:3001`

### Paso 5 — Levantar el Frontend (React)

```bash
cd frontend
npm install
npm run dev
```
> Deberías ver el mensaje de Vite indicando que la app corre en `http://localhost:5173`

---

## 🧪 Ejecutar Tests Unitarios

Cada microservicio tiene tests unitarios con JUnit 5 + Mockito. Para ejecutarlos:

```powershell
# Donaciones (9 tests)
Push-Location services\donaciones; .\mvnw.cmd test -Dtest="DonacionServiceTest" -q; Pop-Location

# Inventario (7 tests)
Push-Location services\inventario; .\mvnw.cmd test -Dtest="InventarioServiceTest" -q; Pop-Location

# Logística (7 tests)
Push-Location services\logistica; .\mvnw.cmd test -Dtest="LogisticaServiceTest" -q; Pop-Location

# Necesidades (5 tests)
Push-Location services\necesidades; .\mvnw.cmd test -Dtest="NecesidadServiceTest" -q; Pop-Location
```

> **Nota:** Los tests `*ApplicationTests` (contextLoads) requieren conexión a las bases de datos reales. Para ejecutar solo los tests unitarios sin infraestructura, usa el flag `-Dtest="NombreDelTest"`.

---

## 🌐 Enlaces y Puertos

| Componente | URL |
|---|---|
| **Frontend Web** | http://localhost:5173 |
| **BFF (Node.js)** | http://localhost:3001/api |
| **API Gateway** | http://localhost:8080 |
| **RabbitMQ Management** | http://localhost:15672 (guest/guest) |

### Swagger UI (Documentación interactiva de cada API)

| Servicio | URL |
|---|---|
| Autenticación | http://localhost:8084/swagger-ui/index.html |
| Donaciones | http://localhost:8081/swagger-ui/index.html |
| Inventario | http://localhost:8086/swagger-ui/index.html |
| Logística | http://localhost:8083/swagger-ui/index.html |
| Necesidades | http://localhost:8085/swagger-ui/index.html |

### Paginación de APIs

Todos los endpoints GET de listado soportan paginación mediante query params:
```
GET /donaciones?page=0&size=10&sort=id,desc
GET /inventario?page=0&size=20
GET /logistica?page=0&size=5
GET /necesidades?page=0&size=10
```

La respuesta paginada tiene la siguiente estructura:
```json
{
  "content": [...],
  "totalElements": 42,
  "totalPages": 5,
  "number": 0,
  "size": 10
}
```

---

## 🔐 Credenciales por defecto

| Recurso | Usuario | Contraseña |
|---|---|---|
| App Web (Admin) | admin@administrador.cl | admin123 |
| PostgreSQL | postgres | admin123 |
| PostgreSQL (Auth) | postgres | 1234 |
| RabbitMQ | guest | guest |

---

## ¿Cómo apagar todo?

```bash
# Detener contenedores Docker
docker compose down

# En las terminales de BFF y Frontend, presiona Ctrl + C
```

Para borrar contenedores **y sus datos**:
```bash
docker compose down -v
```
