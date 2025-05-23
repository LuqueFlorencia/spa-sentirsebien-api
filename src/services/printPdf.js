const fs = require('fs');
const path = require('path');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

const printAppointmentPDF = async (appointment) => {
	const pdfDoc = await PDFDocument.create();
	const page = pdfDoc.addPage([600, 800]);
	const { width, height } = page.getSize();
	const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

	// Logo
	const logoBytes = fs.readFileSync(path.join(__dirname, 'logo-sb.png'));
	const logoImage = await pdfDoc.embedPng(logoBytes);
	const logoDims = logoImage.scale(0.2);

	page.drawImage(logoImage, {
		x: (width - logoDims.width) / 2,
		y: height - logoDims.height - 40,
		width: logoDims.width,
		height: logoDims.height,
	});

	let yPosition = height - logoDims.height - 80;
	const marginLeft = 60;

	// Título
	const title = "Detalles de la Cita";
	const titleSize = 20;
	const titleWidth = font.widthOfTextAtSize(title, titleSize);
	page.drawText(title, {
		x: (width - titleWidth) / 2,
		y: yPosition,
		size: titleSize,
		font,
		color: rgb(0.847, 0.549, 0.549)
	});

	yPosition -= 40;

	// Información del Servicio
	const serviceFields = [
		`Servicio: ${appointment.serviceName}`,
		`Duración: ${appointment.duration} minutos`,
		`Precio: $${appointment.price?.toLocaleString() || 'N/A'}`,
	];
	serviceFields.forEach((line, i) => {
		page.drawText(line, {
		x: marginLeft,
		y: yPosition - i * 20,
		size: 12,
		font,
		});
	});

	yPosition -= serviceFields.length * 20 + 20;

	// Información del Cliente
	const clientFields = [
		`Cliente: ${appointment.clientName}`,
		`Email: ${appointment.clientEmail}`,
		`Teléfono: ${appointment.clientTelephone || 'N/A'}`
	];
	clientFields.forEach((line, i) => {
		page.drawText(line, {
		x: marginLeft,
		y: yPosition - i * 20,
		size: 12,
		font,
		});
	});

	yPosition -= clientFields.length * 20 + 20;

	// Fecha y Estado
	const statusText = {
		pendiente: 'Pendiente',
		confirmado: 'Confirmada',
		completado: 'Completada',
		cancelado: 'Cancelada'
	};

	const status = statusText[appointment.status] || appointment.status;
	const payment = appointment.paymentStatus === 'paid' ? 'Pagado' :
					appointment.paymentStatus === 'pending' ? 'Pendiente' :
					appointment.paymentStatus === 'refunded' ? 'Reembolsado' : 'N/A';

	const miscFields = [
		`Fecha: ${appointment.date}`,
		`Hora: ${appointment.time}`,
		`Estado: ${status}`,
		`Estado de Pago: ${payment}`,
	];
	miscFields.forEach((line, i) => {
		page.drawText(line, {
		x: marginLeft,
		y: yPosition - i * 20,
		size: 12,
		font,
		});
	});

	// Footer institucional
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

module.exports = { printAppointmentPDF };
