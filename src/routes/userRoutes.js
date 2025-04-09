const express = require("express");
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Obtener todos los usuarios o filtrados por tipo
 *     tags: [Usuarios]
 *     parameters:
 *       - in: query
 *         name: userType
 *         schema:
 *           type: string
 *         description: Tipo de usuario (cliente, profesional, admin)
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
router.get("/", userController.getUsers);   

/**
 * @swagger
 * /users/{email}:
 *   put:
 *     summary: Actualiza datos de un usuario
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Email del usuario a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               lastname:
 *                 type: string
 *               telephone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
router.put("/:email", authMiddleware, userController.updateUser);

/**
 * @swagger
 * /users/{email}:
 *   delete:
 *     summary: Eliminar un usuario por email (requiere rol admin)
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *         description: Email del usuario a eliminar
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Usuario no encontrado
 */
router.delete("/:email", authMiddleware, userController.deleteUser);

module.exports = router;
