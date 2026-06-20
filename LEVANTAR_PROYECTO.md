# 🚀 CHEAT SHEET: LEVANTAR EL PROYECTO (RÁPIDO)

Ejecuta esto **en terminales separadas** y no las cierres:

### 1. Base de Datos (Terminal 1)
```bash
docker-compose up -d
```

### 2. Backend / BFF (Terminal 2)
```bash
cd bff
node index.js
```

### 3. Exponer a Internet (Terminal 3)
```bash
npx -y cloudflared tunnel --url http://localhost:3001
```
*(Copia la URL que dice `https://[algo].trycloudflare.com`)*

### 4. Actualizar Frontend (En tu Editor)
1. Presiona `Ctrl + Shift + F` en tu editor de código.
2. Busca la palabra `trycloudflare.com`
3. **Reemplaza todas** las URLs viejas por la **nueva URL** que copiaste.

### 5. Subir a Vercel (Terminal 4)
```bash
git add .
git commit -m "update url"
git push origin main
```
**Listo.** Espera 1 minuto a que Vercel termine y entra a tu web.
