# 🚀 Guía de Supervivencia: Presentación Donatón

Si por alguna razón la computadora se reinicia, se cierra el editor o tienes que volver a levantar todo desde cero para tu presentación, sigue **exactamente** estos 4 pasos en orden. 

---

### PASO 1: Levantar la Base de Datos y Microservicios (Docker)
1. Abre una terminal en la carpeta principal del proyecto (`donaton-frok`).
2. Ejecuta este comando para prender las bases de datos y microservicios de Spring Boot:
   ```bash
   docker-compose up -d
   ```
3. Espera un minuto a que todo levante correctamente.

### PASO 2: Levantar el Backend Node.js (BFF)
1. Abre una **nueva terminal** (deja la anterior quieta).
2. Entra a la carpeta del BFF:
   ```bash
   cd bff
   ```
3. Inicia el servidor de Node:
   ```bash
   node index.js
   ```
4. Verás el mensaje *"🚀 BFF (Node.js) corriendo en http://localhost:3001"*. **NO cierres esta terminal.**

### PASO 3: Crear el Túnel de Cloudflare (Internet)
1. Abre **otra terminal nueva** (la tercera).
2. Ejecuta el comando mágico para exponer el puerto 3001 a internet:
   ```bash
   npx -y cloudflared tunnel --url http://localhost:3001
   ```
3. En la terminal aparecerán muchas letras, busca un link que termine en `.trycloudflare.com` (ejemplo: `https://palabras-raras.trycloudflare.com`).
4. **Copia ese link**. Ese es tu nuevo puente hacia Vercel. **NO cierres esta terminal por nada del mundo** (si la cierras, la web se cae).

### PASO 4: Actualizar el Frontend y Vercel
Como la URL de Cloudflare cambia cada vez que ejecutas el comando, debes actualizar el código de tu frontend con la nueva URL.
1. Abre tu editor de código (VSCode, Cursor, etc).
2. Usa el buscador global (`Ctrl + Shift + F`).
3. Busca la URL vieja (la que tenías antes) y **reemplázala en todos los archivos** por la **URL nueva** que copiaste en el Paso 3.
4. Abre una cuarta terminal y sube los cambios a GitHub para que Vercel se actualice solo:
   ```bash
   git add .
   git commit -m "update: nueva url de cloudflare"
   git push origin main
   ```
5. Ve a Vercel, espera 2 minutos a que el despliegue termine, recarga tu página con `Ctrl + F5` y ¡listo para el 10!

---

### ⚠️ AVISO IMPORTANTE PARA HOY:
**AHORA MISMO NO TIENES QUE HACER NADA DE ESTO.**
Yo ya dejé corriendo los procesos del BFF y el túnel de Cloudflare ocultos en segundo plano en esta sesión. 
**Simplemente bloquea tu computadora (Windows + L), vete a tu instituto, abre la página de Vercel allá y todo funcionará perfecto.** Solo asegúrate de **NO APAGAR** la computadora ni desconectarla del internet. ¡Mucho éxito en tu presentación! 🏆
