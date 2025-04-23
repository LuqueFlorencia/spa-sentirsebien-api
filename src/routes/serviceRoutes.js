const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");
const authMiddleware = require("../middlewares/authMiddleware");

/**
 * @swagger
 * /services:
 *   get:
 *     summary: Obtener todos los servicios (no auth)
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: state
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [corporales, faciales, belleza, grupales]
 *         description: Filtra los servicios por estado (activos/eliminados) y/o por categoria
 *     responses:
 *       200:
 *         description: Lista de servicios
 */
router.get("/", serviceController.getService); //solo service

/**
 * @swagger
 * /services/getBy:
 *   get:
 *     summary: Obtener todos los servicios para el profesional (solo prof)
 *     tags: [Services]
 *     parameters:
 *       - in: query
 *         name: state
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [corporales, faciales, belleza, grupales]
 *         description: Filtra los servicios por estado (activos/eliminados) y/o por categoria
 *     responses:
 *       200:
 *         description: Lista de servicios
 */
router.get("/getBy/", authMiddleware, serviceController.getProfService);

/**
 * @swagger
 * /services/{id}:
 *   put:
 *     summary: Actualizar un servicio existente (solo admin)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del servicio a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Campos a actualizar
 *     responses:
 *       200:
 *         description: Servicio actualizado correctamente
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Servicio no encontrado
 */
router.put("/:id", authMiddleware, serviceController.updateService); //services/{id}

/**
 * @swagger
 * /services/deleted/{id}:
 *   put:
 *     summary: Eliminar lógicamente un servicio (solo admin)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del servicio a eliminar
 *     responses:
 *       200:
 *         description: Servicio eliminado correctamente
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Servicio no encontrado
 */
router.put("/deleted/:id", authMiddleware, serviceController.deleteService); //services/deleted/{id}

/**
 * @swagger
 * /services/actived/{id}:
 *   put:
 *     summary: Activar un servicio eliminado (solo admin)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del servicio a activar
 *     responses:
 *       200:
 *         description: Servicio activado correctamente
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Servicio no encontrado
 */
router.put("/actived/:id", authMiddleware, serviceController.activeService); //services/active/{id}

/**
 * @swagger
 * /services:
 *   post:
 *     summary: Crear un nuevo servicio (solo admin)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - professional
 *             properties:
 *               professional:
 *                 type: string
 *                 description: ID del profesional que crea el servicio
 *               name:
 *                 type: string
 *                 description: Nombre del servicio
 *               description:
 *                 type: string
 *                 description: Descripción del servicio
 *               price:
 *                 type: number
 *                 description: Precio del servicio
 *     responses:
 *       201:
 *         description: Servicio creado exitosamente
 *       400:
 *         description: Datos faltantes o inválidos
 *       403:
 *         description: No autorizado
 *       409:
 *         description: Conflicto al crear el servicio
 */
router.post("/", authMiddleware, serviceController.createService); //services/new

module.exports = router;