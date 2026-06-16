process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
require('dotenv').config();
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

console.log('API Key cargada:', process.env.SENDGRID_API_KEY ? 'Sí (' + process.env.SENDGRID_API_KEY.substring(0, 10) + '...)' : 'NO');
console.log('From Email:', process.env.SENDGRID_FROM_EMAIL);

const msg = {
    to: 'ni.mirandar@duocuc.cl',
    from: {
        email: process.env.SENDGRID_FROM_EMAIL,
        name: 'Donatón'
    },
    subject: 'Test - Prueba de envío Donatón',
    html: '<h1>¡Funciona!</h1><p>Este es un correo de prueba desde Donatón.</p>',
};

sgMail.send(msg)
    .then((response) => {
        console.log('✅ Email enviado exitosamente!');
        console.log('Status Code:', response[0].statusCode);
    })
    .catch((error) => {
        console.error('❌ Error al enviar email:');
        console.error('Status:', error.code);
        console.error('Message:', error.message);
        if (error.response) {
            console.error('Body:', JSON.stringify(error.response.body, null, 2));
        }
    });
