# Usamos la imagen ligera de Java 17 (JDK)
FROM eclipse-temurin:17-jdk-alpine

# Definimos la carpeta de trabajo
WORKDIR /app

# Copiamos el JAR que generaste con Maven
# Importante: Antes de construir la imagen, debes correr 'mvn clean package -DskipTests'
COPY target/authservice-0.0.1-SNAPSHOT.jar app.jar

# Exponemos el puerto que configuraste (8084)
EXPOSE 8084

# Ejecutamos la aplicación
ENTRYPOINT ["java", "-jar", "app.jar"]