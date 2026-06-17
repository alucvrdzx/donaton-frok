const sgMail = require('@sendgrid/mail');

// Configurar SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL;

const enviarEmailConfirmacion = async (emailDestinatario, datosDonacion) => {
    const tipoEmoji = {
        'ROPA': '👕', 'ALIMENTO': '🍎', 'BEBESTIBLE': '🥤',
        'MONETARIA': '💰', 'MEDICAMENTO': '💊', 'HIGIENE': '🧴',
        'JUGUETE': '🧸', 'ELECTRONICO': '💻'
    };

    const emoji = tipoEmoji[datosDonacion.tipoDonacion] || '📦';

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #0f172a; padding: 40px 20px;">
            <tr>
                <td align="center">
                    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">
                        <tr>
                            <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%); border-radius: 20px 20px 0 0; padding: 40px 40px 30px 40px; text-align: center;">
                                <h1 style="color: #ffffff; font-size: 32px; margin: 0 0 8px 0; font-weight: 800;">Donatón</h1>
                                <p style="color: rgba(255,255,255,0.85); font-size: 16px; margin: 0;">Transparencia en Cada Ayuda</p>
                            </td>
                        </tr>
                        <tr>
                            <td style="background-color: #1e293b; padding: 40px; border-left: 1px solid rgba(255,255,255,0.08); border-right: 1px solid rgba(255,255,255,0.08);">
                                <div style="text-align: center; margin-bottom: 24px;">
                                    <div style="display: inline-block; background: rgba(16, 185, 129, 0.15); border-radius: 50%; width: 72px; height: 72px; line-height: 72px; font-size: 36px;">✅</div>
                                </div>
                                <h2 style="color: #f8fafc; font-size: 24px; text-align: center; margin: 0 0 8px 0;">¡Donación Registrada con Éxito!</h2>
                                <p style="color: #94a3b8; text-align: center; font-size: 15px; margin: 0 0 32px 0;">Gracias por tu generosidad, <strong style="color: #e2e8f0;">${datosDonacion.nombreDonante}</strong>.</p>
                                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px;">
                                    <tr><td style="padding: 24px;">
                                        <p style="color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 16px 0;">Detalles</p>
                                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                            <tr><td style="color: #94a3b8; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">Tipo</td><td style="color: #f8fafc; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); text-align: right; font-weight: 600;">${emoji} ${datosDonacion.tipoDonacion}</td></tr>
                                            <tr><td style="color: #94a3b8; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">Producto</td><td style="color: #f8fafc; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); text-align: right; font-weight: 600;">${datosDonacion.detalle}</td></tr>
                                            <tr><td style="color: #94a3b8; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">Cantidad</td><td style="color: #a78bfa; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05); text-align: right; font-weight: 800; font-size: 20px;">${datosDonacion.cantidad}</td></tr>
                                            <tr><td style="color: #94a3b8; padding: 8px 0;">Donante</td><td style="color: #f8fafc; padding: 8px 0; text-align: right; font-weight: 600;">${datosDonacion.nombreDonante}</td></tr>
                                        </table>
                                    </td></tr>
                                </table>
                                <div style="text-align: center; margin-top: 32px; padding: 20px; background: rgba(99, 102, 241, 0.1); border-radius: 12px;">
                                    <p style="color: #c7d2fe; font-size: 15px; margin: 0;">🌟 Cada donación cuenta. Gracias a personas como tú, podemos llevar ayuda a quienes más lo necesitan.</p>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="background-color: rgba(15, 23, 42, 0.8); border-radius: 0 0 20px 20px; padding: 24px 40px; text-align: center;">
                                <p style="color: #64748b; font-size: 13px; margin: 0;">Fundación Donatón — Transparencia en Cada Ayuda 💜</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;

    const msg = {
        to: emailDestinatario,
        from: { email: FROM_EMAIL, name: 'Donatón' },
        subject: `✅ ¡Donación registrada exitosamente! — ${emoji} ${datosDonacion.tipoDonacion}`,
        html: htmlContent,
    };

    try {
        await sgMail.send(msg);
        console.log(`📧 Email de confirmación enviado a: ${emailDestinatario}`);
        return true;
    } catch (error) {
        console.error('❌ Error enviando email:', error.response?.body || error.message);
        return false;
    }
};

module.exports = { enviarEmailConfirmacion };
