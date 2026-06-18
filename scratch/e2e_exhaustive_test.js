const http = require('http');

const delay = ms => new Promise(res => setTimeout(res, ms));

const BASE_AUTH_URL = "http://localhost:8084/api/auth";
const BASE_NECESIDADES_URL = "http://localhost:8080/necesidades"; // A través del Gateway

async function runChaosTest() {
    console.log("🔥 INICIANDO PRUEBA EXHAUSTIVA E2E (CAOS Y VALIDACIÓN) 🔥\n");

    let token = "";
    let necesidadId = null;

    try {
        // ==========================================
        // 1. ESCENARIOS DE ERROR EN AUTENTICACIÓN
        // ==========================================
        console.log("=> PASO 1: Intentar login con usuario inexistente...");
        const badUserRes = await fetch(`${BASE_AUTH_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ correo: "hacker@malo.com", clave: "1234" })
        });
        if (badUserRes.status === 403 || badUserRes.status === 401 || badUserRes.status === 404 || badUserRes.status === 400) {
            console.log(`   ✅ Correcto: El sistema rechazó el login (Status: ${badUserRes.status})`);
        } else {
            console.error(`   ❌ Fallo: El sistema permitió (o dio un status extraño) al usuario malo. Status: ${badUserRes.status}`);
        }

        console.log("\n=> PASO 2: Intentar login con contraseña incorrecta...");
        const badPassRes = await fetch(`${BASE_AUTH_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ correo: "admin@administrador.cl", clave: "passwordIncorrecta" })
        });
        if (badPassRes.status === 403 || badPassRes.status === 401 || badPassRes.status === 400) {
            console.log(`   ✅ Correcto: El sistema rechazó la contraseña incorrecta (Status: ${badPassRes.status})`);
        } else {
            console.error(`   ❌ Fallo: El sistema aceptó una contraseña incorrecta! Status: ${badPassRes.status}`);
        }

        console.log("\n=> PASO 3: Login exitoso...");
        const goodLoginRes = await fetch(`${BASE_AUTH_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ correo: "admin@administrador.cl", clave: "admin123" })
        });
        if (goodLoginRes.ok) {
            const authData = await goodLoginRes.json();
            token = authData.token;
            console.log("   ✅ Correcto: Login exitoso. Token JWT obtenido.");
        } else {
            throw new Error(`Login válido falló con status ${goodLoginRes.status}`);
        }

        // ==========================================
        // 2. ESCENARIOS DE ERROR DE VALIDACIÓN
        // ==========================================
        console.log("\n=> PASO 4: Intentar crear una Necesidad con datos vacíos...");
        const emptyDataRes = await fetch(BASE_NECESIDADES_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({}) // Payload vacío
        });
        if (emptyDataRes.status === 400) {
            console.log(`   ✅ Correcto: El sistema rechazó datos vacíos (Status: 400 Bad Request)`);
        } else {
            console.error(`   ❌ Fallo: Se esperaba 400, pero dio ${emptyDataRes.status}`);
        }

        console.log("\n=> PASO 5: Intentar crear una Necesidad con cantidad negativa y sin título...");
        const badDataRes = await fetch(BASE_NECESIDADES_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({
                titulo: "", // Inválido
                descripcion: "Falta título",
                cantidadRequerida: -50.0, // Inválido
                categoria: "Salud",
                producto: "Vendas",
                ubicacion: "Arica",
                lat: 0,
                lng: 0
            })
        });
        if (badDataRes.status === 400) {
            console.log(`   ✅ Correcto: El sistema rechazó cantidad negativa y campos en blanco (Status: 400)`);
        } else {
            console.error(`   ❌ Fallo: Se esperaba 400, pero dio ${badDataRes.status}`);
        }

        // ==========================================
        // 3. ESCENARIO DE ÉXITO (CRUD)
        // ==========================================
        console.log("\n=> PASO 6: Crear una Necesidad válida...");
        const validRes = await fetch(BASE_NECESIDADES_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({
                titulo: "Campamento de Prueba E2E",
                descripcion: "Requiere suministros urgentes",
                cantidadRequerida: 50.0,
                categoria: "Alimentos",
                producto: "Raciones",
                ubicacion: "Valparaíso",
                lat: -33.0456,
                lng: -71.6197
            })
        });
        if (validRes.ok) {
            const data = await validRes.json();
            necesidadId = data.id;
            console.log(`   ✅ Correcto: Necesidad creada con ID: ${necesidadId} (Status: ${validRes.status})`);
        } else {
            throw new Error(`Fallo al crear necesidad válida. Status: ${validRes.status}`);
        }

        // Esperar propagación en RabbitMQ
        console.log("   -> Esperando 2 segundos para propagación de eventos...");
        await delay(2000);

        console.log("\n=> PASO 7: Verificar que la Necesidad se guardó en BD...");
        const getRes = await fetch(`${BASE_NECESIDADES_URL}/${necesidadId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (getRes.ok) {
            const data = await getRes.json();
            console.log(`   ✅ Correcto: Necesidad obtenida. Título: '${data.titulo}'`);
        } else {
            console.error(`   ❌ Fallo al intentar obtener la Necesidad. Status: ${getRes.status}`);
        }

        console.log("\n=> PASO 8: Cambiar estado de la Necesidad (PATCH)...");
        // Según el controlador: /necesidades/{id}/estado?estado=EN_PROGRESO (depende del ENUM)
        // Valores comunes: ACTIVA, CUBIERTA, EN_TRANSITO, etc. Probemos con INACTIVA o COMPLETADA.
        // Asumiendo que el ENUM EstadoNecesidad tiene "CUBIERTA" o algo similar.
        const patchRes = await fetch(`${BASE_NECESIDADES_URL}/${necesidadId}/estado?estado=CUBIERTA`, {
            method: "PATCH",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (patchRes.ok) {
            const data = await patchRes.json();
            console.log(`   ✅ Correcto: Estado actualizado a: ${data.estado}`);
        } else {
            console.warn(`   ⚠️ Fallo el PATCH (Quizás el estado enviado no es válido en el ENUM, status: ${patchRes.status})`);
        }

        // ==========================================
        // 4. ELIMINACIÓN Y VERIFICACIÓN DE INTEGRIDAD
        // ==========================================
        console.log("\n=> PASO 9: Eliminar la Necesidad...");
        const deleteRes = await fetch(`${BASE_NECESIDADES_URL}/${necesidadId}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (deleteRes.ok || deleteRes.status === 204) {
            console.log(`   ✅ Correcto: Necesidad eliminada (Status: ${deleteRes.status})`);
        } else {
            console.error(`   ❌ Fallo al eliminar. Status: ${deleteRes.status}`);
        }

        console.log("\n=> PASO 10: Intentar obtener la Necesidad eliminada...");
        const getDeletedRes = await fetch(`${BASE_NECESIDADES_URL}/${necesidadId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (getDeletedRes.status === 404) {
            console.log(`   ✅ Correcto: El sistema devolvió 404 Not Found, la entidad ya no existe.`);
        } else {
            console.error(`   ❌ Fallo: Se esperaba 404, pero dio ${getDeletedRes.status} (¡La entidad sigue en la DB!)`);
        }

        console.log("\n🎉 === TODAS LAS PRUEBAS EXHAUSTIVAS FUERON COMPLETADAS === 🎉");

    } catch (error) {
        console.error("\n💥 ERROR FATAL EN PRUEBA EXHAUSTIVA:", error);
    }
}

runChaosTest();
