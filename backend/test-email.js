const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || '"Found Me" <noreply@foundme.com>';

  console.log('--- Probando configuración de correo ---');
  console.log('Host:', host);
  console.log('Port:', port);
  console.log('User:', user);
  console.log('From:', from);

  if (!host || !user || !pass) {
    console.error('\nError: Faltan variables de entorno en el archivo .env.');
    console.error('Asegúrate de configurar SMTP_HOST, SMTP_PORT, SMTP_USER y SMTP_PASS.');
    process.exit(1);
  }

  const config = {
    host: host,
    port: parseInt(port) || 587,
    secure: parseInt(port) === 465,
    auth: {
      user: user,
      pass: pass
    },
    tls: {
      rejectUnauthorized: false
    }
  };

  if (host.includes('gmail')) {
    console.log('Se detectó Gmail. Usando configuración optimizada para Gmail...');
    delete config.host;
    delete config.port;
    delete config.secure;
    config.service = 'gmail';
  }

  try {
    const transporter = nodemailer.createTransport(config);
    console.log('Verificando conexión con el servidor SMTP...');
    await transporter.verify();
    console.log('¡Conexión verificada con éxito!');

    console.log(`Enviando correo de prueba a ${user}...`);
    const info = await transporter.sendMail({
      from: from,
      to: user,
      subject: 'Prueba de Nodemailer - Found Me',
      text: 'Si recibiste este correo, la configuración de Nodemailer funciona perfectamente.',
      html: '<p>Si recibiste este correo, la configuración de <strong>Nodemailer</strong> funciona perfectamente.</p>'
    });

    console.log('¡Correo enviado con éxito!');
    console.log('Message ID:', info.messageId);
  } catch (error) {
    console.error('Error al enviar el correo:', error);
  }
}

testEmail();
