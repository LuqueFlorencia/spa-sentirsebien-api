const UserModel = require("../models/userModel");

// Controlador para obtener todos los usuarios
const getUsers = async (req, res) => {
    try {
        const users = await UserModel.getUsers();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Error obteniendo usuarios", error });
    }
};

// Controlador para crear un usuario
const addUser = async (req, res) => {
    try {
        const user = await UserModel.addUser(req.body);
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ message: "Error creando usuario", error });
    }
};

// Controlador para obtener usuario por ID
const getUser = async (req, res) => {
    try {
        const user = await UserModel.getUser(req.params.id);
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: "Error obteniendo usuario", error });
    }
};

// Controlador para eliminar un usuario
const deleteUser = async (req, res) => {
    try {
        const result = await UserModel.deleteUser(req.params.id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Error eliminando usuario", error });
    }
};

module.exports = { getUsers, addUser, getUser, deleteUser };
