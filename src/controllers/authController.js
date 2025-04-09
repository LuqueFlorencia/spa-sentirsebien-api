const UserModel = require("../models/authModel");
const jwt = require("jsonwebtoken");
require('dotenv').config(); 

/* ESTRUCTURA PARA REGISTRO DE USUARIO
{
  "id": id unico autogenerado,
  "email": "laura@gmail.com",
  "password": "laugon01"
  "name": "Laura",
  "lastname": "Gonzalez"
  "userType": "cliente",  // cliente | profesional
  "telephone": "123456789", // (opcional)
  "services": ["services/id", "services/id"], // solo si es profesional
  "state": true
} */

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password)
            return res.status(400).json({ message: "Faltan credenciales" });
        
        const userDoc = await UserModel.searchUser(email);
        if (!userDoc)
            return res.status(404).json({ message: "Usuario no encontrado" });

        const user = userDoc.data();
        if (password !== user.password)
            return res.status(401).json({ message: "Contraseña incorrecta" });

        const payload = {
            id: userDoc.id,
            email: user.email,
            userType: user["userType"]
        };
        const secret = process.env.JWT_SECRET;
        const token = jwt.sign(payload, secret, { expiresIn: '2h' });

        res.json({ message: "Login exitoso", token, user: payload });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al iniciar sesión", error });
    }
};


const register = async (req, res) => {
    try {
        const { email, password, name, lastname, telephone, userType } = req.body;

        if (!email || !password || !name || !lastname || !userType)
            return res.status(400).json({ message: "Faltan campos obligatorios" });

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email))
            return res.status(400).json({ message: "Email inválido" });

        if (!['cliente', 'profesional'].includes(userType))
            return res.status(400).json({ message: "Tipo de usuario inválido" });

        const existingUser = await UserModel.searchUser(email);
        if (existingUser)
            return res.status(400).json({ message: "El email ya está registrado" });

        const newUser = {
            email,
            password,
            name,
            lastname,
            telephone: telephone || null,
            userType,
            state: true
        };

        if (userType === 'profesional') {
            newUser.services = [];
        }

        const docRef = await UserModel.addUser(newUser);
        res.status(201).json({ message: "Usuario registrado correctamente", id: docRef.id });

    } catch (error) {
        res.status(500).json({ message: "Error al registrar usuario", error });
    }
};


const resetPassword  = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email)
            return res.status(400).json({ message: "Debe proporcionar un email" });

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email))
            return res.status(400).json({ message: "Email inválido" });

        const updatedUserId = await UserModel.resetPassword(email);
        if (!updatedUserId)
            return res.status(404).json({ message: "No se encontró un usuario con ese email" });

        res.json({ message: "Contraseña restablecida correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al restablecer contraseña", error });
    }
};

module.exports = { login, register, resetPassword };
