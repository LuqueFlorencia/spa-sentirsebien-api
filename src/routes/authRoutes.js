const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

 /**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login de usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso
 *       401:
 *         description: Contraseña incorrecta 
 *       404:
 *         description: Usuario no encontrado 
 */
router.post("/login", authController.login); //auth/login

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *               - lastname
 *               - userType
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               name:
 *                 type: string
 *               lastname:
 *                 type: string
 *               userType:
 *                 type: string
 *                 enum: [cliente, profesional]
 *               telephone:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario creado exitosamente
 *       400:
 *         description: Faltan campos obligatorios; Email invalido o ya registrado; Tipo de usuario invalido 
 */
router.post("/register", authController.register); //auth/register

/**
 * @swagger
 * /auth/resetPassword:
 *   post:
 *     summary: Resetear la contraseña de una cuenta
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Contraseña restablecida correctamente
 *       404:
 *         description: Email invalido; Usuario no asociado al mail proporcionado 
 */
router.post("/resetPassword", authController.resetPassword); //auth/resetPassword

module.exports = router;
