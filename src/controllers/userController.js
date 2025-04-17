const UserModel = require("../models/userModel");

// Obtener todos los usuarios o filtrados por tipo
const getUsers = async (req, res) => {
    try {
        const { userType } = req.query;
        const validUserType = ["admin", "profesional", "cliente"];
        const state = req.query.state === "true" ? true : req.query.state === "false" ? false : undefined;

        if (userType && !validUserType.includes(userType))
            return res.status(400).json({ message: "Tipo de usuario no válido" });

        const users = await UserModel.getUsers(userType, state);

        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ message: "Error obteniendo usuarios", error });
    }
};

// Obtener usuario por email
const getUserByEmail = async (req, res) => {
    try {
        const email = req.params.email;
        
        const user = await UserModel.getUserByEmail(email);
        if (!user)
            return res.status(404).json({ message: "Usuario no encontrado" });

        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: "Error obteniendo el usuario especificado", error})
    }
};

// Modificar datos de un perfil
const updateUser = async (req, res) => {
    try {
        const email = req.user.email;
        const updates = req.body;

        const updated = await UserModel.updateUser(email, updates);
        if (!updated.isOK)
            return res.status(404).json({ message: updated.message });

        return res.status(200).json({ message: "Usuario actualizado correctamente" });
    } catch (error) {
        return res.status(500).json({ message: "Error al actualizar usuario", error });
    }
};

// Generar matriz de disponibilidad horaria base
const setDailyDates = async (req, res) => {
    try {
        const id = req.params.id;
        const schedule = req.body.schedule;
    
        if (!schedule || typeof schedule !== "object")
            return res.status(400).json({ error: "Formato de horarios inválido." });

        if (req.user.userType !== "profesional")
            return res.status(403).json({ message: "No autorizado para modificar disponibilidad" });
    
        const availability = setDates(schedule);
        
        await UserModel.setDailyDates(id, availability);
        return res.status(200).json({ message: "Disponibilidad actualizada correctamente." });
    } catch (error) {
        return res.status(500).json({ error: "Error al actualizar disponibilidad" });
    }
};
  /* EJEMPLO
    {
    "schedule": {
        "domingo": [],
        "lunes": ["09:00", "10:00"],
        "martes": ["10:00"],
        "miercoles": ["10:00"],
        "jueves": ["10:00"],
        "viernes": ["10:00", "11:00"],
        "sabado": ["11:00"]
        }
    }
  */

function setDates(hoursPerDay = {}) {
    const days = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
  
    return days.map(day => {
      const hours = hoursPerDay[day] || ["10:00", "11:00", "12:00","13:00", "14:00"];
      return {
        day,
        schedule: hours.map(hour => ({
          hour,
          available: true
        }))
      };
    });
}

// Eliminar un usuario por el email registrado
const deleteUser = async (req, res) => {
    try {
        const id = req.params.id;

        if (req.user.userType !== "admin")
            return res.status(403).json({ message: "No autorizado: solo administradores pueden eliminar usuarios." });
        
        const deleted = await UserModel.deleteUser(id);
        if (!deleted.isOK)
            return res.status(404).json({ message: deleted.message });

        return res.status(200).json({ message: `Usuario eliminado correctamente.` });
    } catch (error) {
        return res.status(500).json({ message: "Error eliminando usuario", error });
    }
};

const approveUser = async (req, res) => {
    try {
        const id = req.params.id;
        
        if (req.user.userType !== "admin")
            return res.status(403).json({ message: "No autorizado: solo administradores pueden confirmar registro de profesionales." });

        const response = await UserModel.approveUser(id);        
        if (!response.isOK)
            return res.status(400).json({ message: response.message });

        return res.status(200).json({ message: "Profesional activado correctamente" });
    } catch (error) {
        return res.status(500).json({ message: "Error al activar profesional", error })
    }
};

module.exports = { getUsers, getUserByEmail, updateUser, setDailyDates, deleteUser, approveUser };
