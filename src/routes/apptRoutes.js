const express = require("express");
const router = express.Router();
const apptController = require("../controllers/apptController");
const authMiddleware = require("../middlewares/authMiddleware");
//SOLO ADMIN Y PROFESIONALES PUEDEN CONSULTAR TURNOS
//SOLO LOS ADMIN PUEDEN HACER CAMBIOS EN LA BD SOBRE TURNOS 

 /**
 * @swagger
 * /appointments/allAppt:
 *   get:
 *     summary: Obtener todos los turnos (solo user)
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *           enum: [confirmado, cancelado, completado, pendiente]
 *         description: Estado del turno
 *     responses:
 *       200:
 *         description: Lista de turnos
 *       400:
 *         description: Tipo de estado invalido
 *       403:
 *         description: No autorizado para consultar turnos
 */
router.get("/allAppt/", authMiddleware, apptController.getAppts); //appointments solo o /appointments?state=

/**
 * @swagger
 * /appointments/{serviceId}/available:
 *   get:
 *     summary: Obtener horarios disponibles para un servicio en una fecha (solo user)
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: serviceId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del servicio a consultar
 *       - name: date
 *         in: query
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha para consultar la disponibilidad (formato YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Lista de horarios disponibles
 *       400:
 *         description: Error en la solicitud (falta de fecha o fecha en formato invalido)
 *       403:
 *         description: No autorizado para consultar horarios disponibles
 *       404:
 *         description: No se encontro el servicio o el servicio no cuenta con profesional asignado para realizarlo
 */
router.get("/:serviceId/available/", authMiddleware, apptController.getAvailableSlots);

/**
 * @swagger
 * /appointments:
 *   post:
 *     summary: Reservar de turno (solo user)
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceId
 *               - date
 *               - hour
 *             properties:
 *               serviceId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               hour:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Turno reservado exitosamente
 *       400:
 *         description: Datos faltantes o fecha invalida o turno no disponible
 *       403:
 *         description: No autorizado para confirmar el turno
 */
router.post("/", authMiddleware, apptController.newAppt); //appointments/

/**
 * @swagger
 * /appointments/cancel/{id}:
 *   put:
 *     summary: Cancelar turno (solo user)
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Turno cancelado correctamente
 *       400:
 *         description: No se encontro el turno a cancelar
 *       403:
 *         description: No autorizado para cancelar un turno
 */
router.put("/cancel/:id", authMiddleware, apptController.cancelAppt); //appointments/cancel/{id}

/**
 * @swagger
 * /appointments/confirm/{id}:
 *   put:
 *     summary: Confirmar turno (solo admin/profesional)
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Turno confirmado correctamente
 *       400:
 *         description: No se encontro el turno a confirmar
 *       403:
 *         description: No autorizado para confirmar un turno
 */
router.put("/confirm/:id", authMiddleware, apptController.updateAppt); //appointments/confirm/{id}

/**
 * @swagger
 * /appointments/{id}:
 *   put:
 *     summary: Actualizar turno (solo user)
 *     tags: [Turnos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Turno actualizado correctamente
 *       400:
 *         description: No se encontro el turno a modificar
 *       403:
 *         description: No autorizado para modificar un turno
 */
router.put("/:id", authMiddleware, apptController.updateAppt); //appointments/{id}

module.exports = router; 
