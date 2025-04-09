const UserModel = require("../models/userModel");

// Obtener todos los usuarios o filtrados por tipo
const getUsers = async (req, res) => {
    try {
        const { userType } = req.query;
        const users = await UserModel.getUsers(userType);

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Error obteniendo usuarios", error });
    }
};

// Modificar datos de un perfil
const updateUser = async (req, res) => {
    try {
        const email = req.params.email;
        const updates = req.body;

        // Solo admins o el mismo usuario pueden modificar
        if (req.user.userType !== "admin" && req.user.email !== email) {
            return res.status(403).json({ message: "No autorizado para actualizar este usuario" });
        }
        
        await UserModel.updateUser(email, updates);
        res.json({ message: "Usuario actualizado correctamente" });

    } catch (error) {
        res.status(500).json({ message: "Error al actualizar usuario", error });
    }
};

// Eliminar un usuario por el email registrado
const deleteUser = async (req, res) => {
    try {
        if (req.user.userType !== "admin") {
            return res.status(403).json({ message: "No autorizado: solo administradores pueden eliminar usuarios." });
        }

        const emailToDelete = req.params.email;
        const deleted = await UserModel.deleteUser(emailToDelete);
        if (!deleted)
            return res.status(404).json({ message: "Usuario no encontrado" });

        res.json({ message: `Usuario con email: '${emailToDelete}', eliminado correctamente.` });
    } catch (error) {
        res.status(500).json({ message: "Error eliminando usuario", error });
    }
};

module.exports = { getUsers, updateUser, deleteUser };
