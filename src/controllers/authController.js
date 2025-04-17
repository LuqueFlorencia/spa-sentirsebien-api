const AuthModel = require("../models/authModel");
const jwt = require("jsonwebtoken");
require('dotenv').config(); 

/* ESTRUCTURA PARA REGISTRO DE USUARIO
{
  "id": id unico autogenerado,
  "email": "nombre@spa.com",
  "password": "prof123"
  "name": "Nombre",
  "lastname": "Apellido"
  "telephone": "123456789",     // (opcional)
  "userType": "cliente",        // cliente | profesional
  "certification": "titulo",    // solo si es profesional
  "bio": "descripcion "         // solo si es profesional
  "specialties": ["tag", "tag"],// solo si es profesional
  "availability": [{ 0: ["9:00",true], ["10:00",false]}, { 1: ["9:00",true]}]
  "state": true
} */

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password)
            return res.status(400).json({ message: "Faltan credenciales" });
        
        const userDoc = await AuthModel.searchUser(email);
        if (!userDoc)
            return res.status(404).json({ message: "Usuario no encontrado" });

        const user = userDoc.data();
        if (password !== user.password)
            return res.status(401).json({ message: "Usuario y/o Contraseña incorrecta" });

        const payload = {
            id: userDoc.id,
            email: user.email,
            userType: user["userType"]
        };
        const secret = process.env.JWT_SECRET;
        const token = jwt.sign(payload, secret, { expiresIn: '2h' });
        payload.name = user.name
        payload.lastname = user.lastname
        payload.telephone = user.telephone

        return res.status(200).json({ message: "Login exitoso", token, user: payload });
    } catch (error) {
        return res.status(500).json({ message: "Error al iniciar sesión", error });
    }
};


const register = async (req, res) => {
    try {
        const { email, password, name, lastname, telephone, userType, specialties, certification, bio } = req.body;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email))
            return res.status(400).json({ message: "Email inválido" });
        if (!['cliente', 'profesional'].includes(userType))
            return res.status(400).json({ message: "Tipo de usuario inválido" });
        const existingUser = await AuthModel.searchUser(email);
        if (existingUser)
            return res.status(400).json({ message: "El email ya está registrado" });

        const newUser = {
            email,
            password,
            name,
            lastname,
            telephone,
            userType,
            state : true
        };        

        if (userType === "profesional") {
            newUser.certification = certification || null;
            newUser.bio = bio || null;
            newUser.specialties = specialties || null;
            newUser.state = false;
        }

        const docRef = await AuthModel.addUser(newUser);
        return res.status(200).json({ message: "Usuario registrado correctamente", id: docRef.id });
    } catch (error) {
        return res.status(500).json({ message: "Error al registrar usuario", error });
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

        const updatedUserId = await AuthModel.resetPassword(email);
        if (!updatedUserId)
            return res.status(404).json({ message: "No se encontró un usuario con ese email" });

        return res.status(200).json({ message: "Contraseña restablecida correctamente" });
    } catch (error) {
        return res.status(500).json({ message: "Error al restablecer contraseña", error });
    }
};

module.exports = { login, register, resetPassword };
