const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/worcester-alex-despite-facts\.trycloudflare\.com/g, 'option-laden-investigator-careful.trycloudflare.com');
    fs.writeFileSync(filePath, content);
}

const files = [
    "frontend/src/config/api.js",
    "frontend/src/pages/DonacionesPage.jsx",
    "frontend/src/pages/HomePage.jsx",
    "frontend/src/pages/InventarioPage.jsx",
    "frontend/src/pages/LoginPage.jsx",
    "frontend/src/pages/LogisticaPage.jsx",
    "frontend/src/pages/NecesidadesPage.jsx",
    "frontend/src/pages/RegisterPage.jsx",
    "frontend/src/pages/UsuariosPage.jsx"
];

files.forEach(f => {
    let p = path.join(__dirname, f);
    if(fs.existsSync(p)) replaceInFile(p);
});
console.log("Replaced successfully");
