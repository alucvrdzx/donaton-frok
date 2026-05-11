# Proyecto Donaton - Plataforma de Microservicios

Donaton es una plataforma humanitaria basada en una arquitectura de microservicios robusta (Spring Boot), orquestada con Docker Compose, y consumida mediante un BFF (Node.js) hacia un Frontend moderno (React con Vite).

## Requisitos Previos (Para una PC Nueva)

Asegúrate de tener instalados los siguientes programas antes de comenzar:
1. [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Iniciado y corriendo en segundo plano).
2. [Java 17](https://adoptium.net/es/) y [Maven](https://maven.apache.org/) (Para compilar los servicios del Backend).
3. [Node.js](https://nodejs.org/) (Para ejecutar el Frontend y el BFF).
4. Git (Para clonar este repositorio).

---

## 🚀 Paso a Paso: Cómo levantar el proyecto desde cero

### Paso 1: Clonar el proyecto
Abre tu terminal y clona el repositorio:
```bash
git clone <URL_DE_TU_REPOSITORIO_GITHUB>
cd donaton
```

### Paso 2: Compilar los Microservicios (Backend)
Debido a que nuestros Dockerfiles utilizan los archivos compilados (`.jar`), debes empaquetar los microservicios usando Maven.

Ejecuta el siguiente comando desde la raíz del proyecto para compilar los 4 servicios (Donaciones, Inventario, Logística y Gateway):
*(Si estás en Windows PowerShell)*:
```powershell
cd services\donaciones; .\mvnw.cmd clean package -DskipTests -q; cd ..\..
cd services\inventario; .\mvnw.cmd clean package -DskipTests -q; cd ..\..
cd services\logistica; .\mvnw.cmd clean package -DskipTests -q; cd ..\..
cd services\gateway; .\mvnw.cmd clean package -DskipTests -q; cd ..\..
```

### Paso 3: Levantar la Infraestructura con Docker Compose
Este es el paso mágico. Docker descargará PostgreSQL, creará las 3 bases de datos, levantará los 4 microservicios en Java y configurará las redes automáticamente.

En la raíz del proyecto (donde está el archivo `docker-compose.yml`), ejecuta:
```bash
docker-compose up -d --build
```
> Nota: El parámetro `-d` hace que los contenedores corran en segundo plano. Puedes usar `docker ps` para verificar que los 7 contenedores estén corriendo (`gateway`, `logistica`, `inventario`, `donaciones` y las 3 bases de datos de postgres).

### Paso 4: Levantar el Backend For Frontend (BFF)
El BFF es un puente de Node.js que conecta a React con el API Gateway de Java.

Abre una nueva pestaña en la terminal:
```bash
cd bff
npm install
node index.js
```
> Deberías ver el mensaje: 🚀 BFF (Node.js) corriendo en http://localhost:3001

### Paso 5: Levantar el Frontend (React)
Finalmente, encendemos la interfaz visual de los usuarios.

Abre otra pestaña en la terminal:
```bash
cd frontend
npm install
npm run dev
```
> Deberías ver un mensaje de Vite indicando que la app corre en `http://localhost:5173`

---

## 🌐 Enlaces Importantes

Una vez completados los 5 pasos, tendrás acceso a todo el ecosistema:

- **Frontend Web**: [http://localhost:5173](http://localhost:5173)
- **API Gateway (Punto de entrada general)**: [http://localhost:8080](http://localhost:8080)
- **BFF (Node.js Intermediario)**: [http://localhost:3001/api/donaciones](http://localhost:3001/api/donaciones)

### Swagger UI (Para probar las APIs directamente)
- **Donaciones**: [http://localhost:8081/swagger-ui/index.html](http://localhost:8081/swagger-ui/index.html)
- **Inventario**: [http://localhost:8082/swagger-ui/index.html](http://localhost:8082/swagger-ui/index.html)
- **Logística**: [http://localhost:8083/swagger-ui/index.html](http://localhost:8083/swagger-ui/index.html)

---

### ¿Cómo apagar todo?
Para detener los contenedores de Docker sin perder los datos:
```bash
docker-compose down
```
Y en tus pestañas de terminal donde corren Node y React, presiona `Ctrl + C`.
