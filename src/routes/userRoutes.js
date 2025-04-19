const express = require("express");
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

 /**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtener todos los usuarios o filtrados por tipo (no auth)
 *     tags: [Usuarios]
 *     parameters:
 *       - in: query
 *         name: userType
 *         schema:
 *           type: string
 *           enum: [admin, profesional, cliente]
 *         description: Tipo de usuario para filtrar
 *       - in: query
 *         name: state
 *         schema:
 *           type: boolean
 *         description: Estado activo/inactivo
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida con éxito
 *       400:
 *         description: Tipo de usuario no válido
 */
router.get("/", userController.getUsers); //users solo o /users?userType=admin&state=true

/**
 * @swagger
 * /users/clients:
 *   get:
 *     summary: Obtener todos clientes de un profesional (solo prof)
 *     tags: [Usuarios]
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida con éxito
 *       400:
 *         description: Tipo de usuario no válido
 */
router.get("/clients/", authMiddleware, userController.getClients);

/**
 * @swagger
 * /users:
 *   put:
 *     summary: Actualizar datos del propio usuario (propio user)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
router.put("/", authMiddleware, userController.updateUser);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Actualizar datos de un tercero (solo admin)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario a eliminar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
router.put("/:id", authMiddleware, userController.updateUserById);

/**
 * @swagger
 * /users/{id}/setDates:
 *   post:
 *     summary: Actualiza la disponibilidad base de un profesional (solo profesional)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               schedule:
 *                 type: object
 *     responses:
 *       200:
 *         description: Disponibilidad actualizada correctamente.
 *       400:
 *         description: Formato de horarios inválido.
 *       403:
 *         description: No autorizado para modificar disponibilidad
 */
router.post("/:id/setDates", authMiddleware, userController.setDailyDates); //users/{id}/setDates

/**
 * @swagger
 * /users/delete/{id}:
 *   put:
 *     summary: Inactivar un usuario (solo admin)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario a inactivar
 *     responses:
 *       200:
 *         description: Usuario inactivado correctamente
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
router.put("/delete/:id", authMiddleware, userController.deleteUser);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Eliminar de la BD a un usuario (solo admin)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del usuario a eliminar
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
router.delete("/:id", authMiddleware, userController.realDeleteUser);

/**
 * @swagger
 * /users/approveUser/{id}:
 *   put:
 *     summary: Aprobar profesional (solo admin)
 *     tags: [Usuarios]
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
 *         description: Profesional activado correctamente
 *       400:
 *         description: No se encontro el usuario a activar
 *       403:
 *         description: No autorizado para aprobar a un usuario
 */
router.put("/approveUser/:id", authMiddleware, userController.approveUser); //users/approveUser/{id}

module.exports = router;
