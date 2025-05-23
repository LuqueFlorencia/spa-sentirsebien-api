const fs = require('fs');
const path = require('path');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

const generateInvoicePDF = async (bookingData) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Cargar el logo
  const logoBytes = fs.readFileSync(path.join(__dirname, 'logo-sb.png'));
  const logoImage = await pdfDoc.embedPng(logoBytes);
  const logoDims = logoImage.scale(0.2);

  // Dibujar el logo (centrado)
  page.drawImage(logoImage, {
    x: (width - logoDims.width) / 2,
    y: height - logoDims.height - 40,
    width: logoDims.width,
    height: logoDims.height,
  });

  let yPosition = height - logoDims.height - 80;

  const marginLeft = 60;

  // Título centrado
  const title = "Factura de Reserva - Sentirse Bien SPA";
  const titleSize = 20;
  const textWidth = font.widthOfTextAtSize(title, titleSize);
  page.drawText(title, {
    x: (width - textWidth) / 2,
    y: yPosition,
    size: titleSize,
    font,
    color: rgb(0.847, 0.549, 0.549)
  });

  yPosition -= 60;

  const fields = [
    `Servicio: ${bookingData.serviceId.name}`,
    `Profesional: ${bookingData.serviceId.professionalLastname}`,
    `Fecha: ${bookingData.date}`,
    `Hora: ${bookingData.hour} hs`,
    `Duración: ${bookingData.serviceId.duration} minutos`,
    `Precio: $${bookingData.serviceId.price}`,
  ];

  fields.forEach((field, index) => {
    page.drawText(field, {
      x: marginLeft,
      y: yPosition - index * 30,
      size: 14,
      font,
      color: rgb(0, 0, 0),
    });
  });

  // Footer
  const drawFooterLine = (text, yOffset = 0, size = 8) => {
    page.drawText(text, {
      x: marginLeft,
      y: 100 - yOffset,
      size,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
  };

  drawFooterLine("Av. Alberdi 200, Resistencia", 0);
  drawFooterLine("+3624 532536", 12);
  drawFooterLine("sentirsebienspa@gmail.com", 24);
  drawFooterLine("Instagram / Facebook / TikTok", 36);
  drawFooterLine("© 2025 Sentirse Bien Spa. Todos los derechos reservados.", 54);

  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
};

module.exports = { generateInvoicePDF };
