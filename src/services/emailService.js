const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  }
});

/*transporter.verify(function (error, success) {
  if (error) {
    console.error("Verificación del transporter falló:", error);
  } else {
    console.log("Servidor listo para enviar mensajes");
  }
});*/

const sendInvoiceEmail = async ({ to, subject, text, pdfStream, filename }) => {

  const emailOptions = {
    from: `"Sentirse Bien SPA" <${process.env.EMAIL_USER}>`,
    to,
    subject: subject || "Tu Comprobante de Reserva - Sentirse Bien Spa",
    text: text || "Gracias por tu reserva en Sentirse Bien Spa. Adjuntamos tu comprobante.",
    attachments: [
      {
        filename: filename || "comprobante.pdf",
        content: pdfStream,
        contentType: "application/pdf",
      },
    ],
  };

  const info = await transporter.sendMail(emailOptions);

  console.log("Mensaje enviado: %s", info.messageId);
};

module.exports = { sendInvoiceEmail };
