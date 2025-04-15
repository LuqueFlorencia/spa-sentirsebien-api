const ApptModel = require("../models/apptModel");
const jwt = require("jsonwebtoken");
const { Timestamp } = require("firebase-admin/firestore");
require('dotenv').config(); 

//SOLO LOS ADMIN PUEDEN HACER CAMBIOS EN LA BD SOBRE TURNOS 
/* ESTRUCTURA PARA REGISTRO DE TURNO
{
  "id": id unico autogenerado,
  "clientId": "/users/id", (referencia)
  "professionalId": "/users/id", (referencia)
  "serviceId": "/services/id", (referencia)
  "date": "2025-04-08",
  "hour": "10:00",
  "state": "confirmado",  // ["confirmado", "cancelado", "completado", "pendiente"]
  "notes": "Alergia a lavanda", // (opcional)
} */


// Obtener todos los turnos
const getAppts = async (req, res) => {
    try {
        const user = req.user;
        const state = req.query.state;
        const validState = ["confirmado", "cancelado", "completado", "pendiente"];
        const validUsers = ["admin", "profesional", "cliente"];

        if (!validUsers.includes(user.userType))
            return res.status(403).json({ message: "No autorizado para consultar turnos" });

        if (state && !validState.includes(state))
            return res.status(400).json({ message: "Tipo de estado no válido" });
        
        let rol;

        if (user.userType === "admin" ) rol = "admin";
        if (user.userType === "profesional") rol = "profesional";
        if (user.userType === "cliente") rol = "cliente";

        const appointments = await ApptModel.getAppts(rol, user.id, state);

        return res.status(200).json(appointments);
    } catch (error) {
        return res.status(500).json({ message: "Error obteniendo turnos", error})
    }
};

// Obtener los horarios disponibles para un servicio determinado
const getAvailableSlots = async (req, res) => {
    try {
        const serviceId = req.params.serviceId;
        const { date } = req.query;
        const validUsers = ["admin", "profesional", "cliente"];

        if (!validUsers.includes(req.user.userType))
            return res.status(403).json({ message: "No autorizado para consultar horarios disponibles" });

        if (!date) 
            return res.status(400).json({ message: "La fecha es requerida" });

        if (!isValidDate(date))
          return res.status(400).json({ message: 'Formato de fecha inválido (YYYY-MM-DD)' });
        
        const response = await ApptModel.getAvailableSlots(serviceId, date);
        if (!response.isOK)
            return res.status(404).json({ message: response.message });

        return res.status(200).json({ message: response.data });
    } catch (error) {
        return res.status(500).json({ message: "Error al obtener las disponibilidades horarias", error})
    }
};

function isValidDate(fecha) {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(fecha)) return false;
  
    const [year, month, day] = fecha.split('-').map(Number);
    const dateObj = new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00`);
  
    return (
      dateObj.getFullYear() === year &&
      dateObj.getMonth() + 1 === month &&
      dateObj.getDate() === day
    );
};

// Agregar nuevo turno 
const newAppt = async (req, res) => {
    try{
        const { serviceId, date, hour, notes } = req.body;
        const clienteId = req.user.id;
        const validUsers = ["admin", "profesional", "cliente"];

        if (!validUsers.includes(req.user.userType))
            return res.status(403).json({ message: "No autorizado para solicitar un turno" });

        if (!serviceId || !date || !hour)
            return res.status(400).json({ message: "Faltan campos obligatorios para solicitud de turno" });

        if (!isValidDate(date))
            return res.status(400).json({ message: 'Formato de fecha inválido (YYYY-MM-DD)' });

        const response = await ApptModel.createAppointment({ serviceId, clienteId, date, hour, notes });
        if (!response.isOK)
            return res.status(400).json({ message: response.message });

        return res.status(200).json({ message: "Turno reservado exitosamente. Id: " + response.id });
    } catch (error) {
        return res.status(500).json({ message: "Error al registrar turno", error });
    }
};

// Cancelar un turno ya registrado
const cancelAppt = async (req,res) => {
    try {
        const id = req.params.id;
        const validUsers = ["admin", "profesional", "cliente"];

        if (!validUsers.includes(req.user.userType))
            return res.status(403).json({ message: "No autorizado para cancelar un turno" });

        const response = await ApptModel.cancelAppt(id);
        if (!response.isOK)
            return res.status(400).json({ message: response.message });

        return res.status(200).json({ message: "Turno cancelado correctamente" });
    } catch (error) {
        return res.status(500).json({ message: "Error al cancelar turno", error })
    }
};

// Modificar un turno 
const updateAppt = async (req,res) => {
    try {
        const id = req.params.id;
        const updates = req.body;
        const validUsers = ["admin", "profesional", "cliente"];

        if (!validUsers.includes(req.user.userType))
            return res.status(403).json({ message: "No autorizado para modificar un turno" });

        const response = await ApptModel.updateAppt(id, updates);
        if (!response.isOK)
            return res.status(400).json({ message: response.message } )

        return res.status(200).json({ message: "Turno actualizado correctamente" });
    } catch (error) {
        return res.status(500).json({ message: "Error al actualizar turno", error })
    }
};

// Cancelar un turno ya registrado
const confirmAppt = async (req,res) => {
    try {
        const id = req.params.id;
        const validUsers = ["admin", "profesional"];

        if (!validUsers.includes(req.user.userType))
            return res.status(403).json({ message: "No autorizado para confirmar un turno" });

        const response = await ApptModel.confirmAppt(id);
        if (!response.isOK)
            return res.status(400).json({ message: response.message });

        return res.status(200).json({ message: "Turno confirmado correctamente" });
    } catch (error) {
        return res.status(500).json({ message: "Error al confirmar turno", error })
    }
};
  
module.exports = { getAppts, getAvailableSlots, newAppt, cancelAppt, confirmAppt, updateAppt };