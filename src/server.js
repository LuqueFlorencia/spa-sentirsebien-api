require("dotenv").config();
console.log(process.env.PORT);

const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const apptRoutes = require("./routes/apptRoutes");
const serviceRoutes = require("./routes/serviceRoutes");

const allowedOrigins = ['http://localhost:5173', 'https://spa-sentirsebien.vercel.app'];

const app = express();
app.use(cors({
    origin: (origin, callback) => {
		if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
		return callback(new Error('Not allowed by CORS'));
    },
  credentials: true,
}));
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas de autenticación
app.use("/auth", authRoutes);
// Rutas de usuarios
app.use("/users", userRoutes);
// Rutas de turnos
app.use("/appointments", apptRoutes);
// rutas de servicios
app.use("/services", serviceRoutes);

// Puerto y arranque del servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
