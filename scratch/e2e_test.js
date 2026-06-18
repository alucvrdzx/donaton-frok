const http = require('http');

const delay = ms => new Promise(res => setTimeout(res, ms));

async function run() {
    console.log("=== INICIANDO PRUEBA END-TO-END (E2E) ===");
    
    try {
        // 1. Login
        console.log("1. Autenticando en Auth-Service...");
        const authRes = await fetch("http://localhost:8084/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ correo: "admin@administrador.cl", clave: "admin123" })
        });
        
        if (!authRes.ok) throw new Error(`Fallo Auth: ${authRes.status}`);
        const authData = await authRes.json();
        const token = authData.token;
        console.log("   -> Token obtenido:", token.substring(0, 20) + "...");

        // 2. Crear una Necesidad
        console.log("2. Creando una Necesidad...");
        const necesidadRes = await fetch("http://localhost:8080/necesidades", { // Via Gateway
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                titulo: "Ayuda para refugio E2E",
                descripcion: "Agua y abrigo",
                cantidadRequerida: 100.0,
                categoria: "Refugio",
                producto: "Abrigo",
                ubicacion: "Santiago, Chile",
                lat: -33.4489,
                lng: -70.6693
            })
        });
        
        if (!necesidadRes.ok) throw new Error(`Fallo creación necesidad: ${necesidadRes.status}`);
        const necesidadData = await necesidadRes.json();
        console.log(`   -> Necesidad creada con ID: ${necesidadData.id}`);

        // Esperar que RabbitMQ propague los eventos
        console.log("3. Esperando 3 segundos para propagación en RabbitMQ...");
        await delay(3000);

        console.log("=== PRUEBA E2E COMPLETADA CON ÉXITO ===");

    } catch (e) {
        console.error("ERROR EN PRUEBA E2E:", e);
    }
}

run();
