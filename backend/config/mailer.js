const nodemailer = require('nodemailer');
require('dotenv').config();

let transporterPromise = new Promise(async (resolve, reject) => {
  try {
    let config = {};

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      console.log('Mailer: Usando SMTP de producción configurado en .env');
      config = {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: parseInt(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      };

      if (process.env.SMTP_HOST.includes('gmail')) {
        console.log('Mailer: Detectado Gmail. Usando configuración optimizada para Gmail');
        config = {
          service: 'gmail',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        };
      }

      const transporter = nodemailer.createTransport(config);
      resolve(transporter);
    } else {
      console.log('Mailer: No se detectaron credenciales SMTP en .env. Creando cuenta de pruebas en Ethereal...');
      nodemailer.createTestAccount((err, account) => {
        if (err) {
          console.error('Error creando cuenta de prueba de Ethereal:', err);
          reject(err);
          return;
        }

        console.log(`Mailer: Cuenta de Ethereal creada. Usuario: ${account.user}`);
        config = {
          host: account.smtp.host,
          port: account.smtp.port,
          secure: account.smtp.secure,
          auth: {
            user: account.user,
            pass: account.pass
          }
        };
        const transporter = nodemailer.createTransport(config);
        resolve(transporter);
      });
    }
  } catch (error) {
    reject(error);
  }
});

const sendVerificationEmail = async (email, nombre, code) => {
  try {
    const transporter = await transporterPromise;
    const from = process.env.SMTP_FROM || '"Found Me" <noreply@foundme.com>';

    const mailOptions = {
      from: from,
      to: email,
      subject: 'Verifica tu cuenta - Found Me',
      html: `
        <div style="font-family: 'Outfit', 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <h2 style="color: #2b7d9e; text-align: center; font-size: 24px; margin-bottom: 20px;">¡Hola, ${nombre}!</h2>
          <p style="color: #4a5568; font-size: 16px; line-height: 1.6; text-align: center;">
            Gracias por registrarte en <strong>Found Me</strong>. Para completar tu registro y activar tu cuenta, utiliza el siguiente código de verificación de 6 dígitos:
          </p>
          <div style="margin: 30px auto; padding: 15px; background-color: #f7fafc; border: 2px dashed #2b7d9e; border-radius: 8px; width: fit-content; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2b7d9e; text-align: center;">
            ${code}
          </div>
          <p style="color: #718096; font-size: 14px; line-height: 1.5; text-align: center; margin-top: 30px;">
            Este código es necesario para validar tu cuenta. Si no solicitaste este registro, puedes ignorar este correo de forma segura.
          </p>
          <hr style="border: 0; border-top: 1px solid #edf2f7; margin: 30px 0;" />
          <p style="color: #a0aec0; font-size: 12px; text-align: center;">
            © 2026 Found Me. Plataforma para la búsqueda de personas desaparecidas.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Correo de verificación enviado a ${email}. MessageId: ${info.messageId}`);
    
    if (nodemailer.getTestMessageUrl(info)) {
      console.log('----------------------------------------------------');
      console.log(`[ETHEREAL MAIL] URL de previsualización: ${nodemailer.getTestMessageUrl(info)}`);
      console.log(`[ETHEREAL MAIL] Código de verificación: ${code}`);
      console.log('----------------------------------------------------');
    }
    return info;
  } catch (error) {
    console.error('Error al enviar el correo de verificación:', error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail
};
