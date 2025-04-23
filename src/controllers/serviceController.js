const ServiceModel = require("../models/serviceModel");
require('dotenv').config(); 

// para obtener todos los servicios
const getService = async (req, res) => {
    try {
        const state = req.query.state === "true" ? true : req.query.state === "false" ? false : undefined;
        const category = req.query.category;

        const services = await ServiceModel.getService(state, category);

        return res.status(200).json(services);
    } catch (error) {
        return res.status(500).json({ message: "Error obteniendo servicios", error });
    }
};

const getProfService = async (req, res) => {
    try {
        const user = req.user;
        const state = req.query.state === "true" ? true : req.query.state === "false" ? false : undefined;
        const category = req.query.category;
        
        let rol;
        if (user.userType === "profesional") rol = "profesional";

        const services = await ServiceModel.getService(state, category, rol, user.id, );

        return res.status(200).json(services);
    } catch (error) {
        return res.status(500).json({ message: "Error obteniendo servicios", error });
    }
};

//para modificar un servicio (por su id, solo el admin puede modificarlo)
const updateService = async (req, res) => {
    try {
        const id = req.params.id;
        const updates = req.body;
        if (req.user.userType !== "admin")
            return res.status(403).json({ message: "No autorizado para actualizar servicios" });

        if (!updates || Object.keys(updates).length === 0)
            return res.status(200).json({ message: "Datos de actualización vacíos" });

        const updated = await ServiceModel.updateService(id, updates);

        if (!updated.isOK)
            return res.status(404).json({ message: updated.message });

        return res.status(200).json({ message: "Servicio actualizado correctamente" });
    } catch (error) {
        console.error("Error en updateService:", error);
        return res.status(500).json({ message: "Error al actualizar servicio", error: error.message });
    }
};

//borrado logico del servicio por id(solo el admin puede "borrarlo")
const deleteService = async (req, res) => {
    try {
        const id = req.params.id;

        if (req.user.userType !== "admin")
            return res.status(403).json({ message: "No autorizado: solo administradores pueden eliminar servicios." });

        const deleted = await ServiceModel.deleteService(id);
        if (!deleted.isOK)
            return res.status(404).json({ message: deleted.message });

        return res.status(200).json({ message: "Servicio eliminado correctamente." });
    } catch (error) {
        return res.status(500).json({ message: "Error eliminando servicio", error });
    }
};

//para activar el servicio borrado tambien por id y tambien solo por el admin
const activeService = async (req, res) => {
    try {
        const id = req.params.id;

        if (req.user.userType !== "admin")
            return res.status(403).json({ message: "No autorizado: solo administradores pueden activar servicios." });

        const deleted = await ServiceModel.activeService(id);

        if (!deleted.isOK)
            return res.status(404).json({ message: deleted.message });

        return res.status(200).json({ message: "Servicio activado correctamente." });
    } catch (error) {
        return res.status(500).json({ message: "Error activando servicio", error });
    }
};

//para crear un nuevo servicio tanto por el admin o un profesional
const createService = async (req, res) => {
    try {
        const user = req.user;
        const data = req.body;

        if (!["admin", "profesional"].includes(user.userType)) {
            return res.status(403).json({ message: "No autorizado para crear servicios" });
        }
        if (!data.professional) {
            return res.status(400).json({ message: "Falta el campo 'professional'" });
        }

        const response = await ServiceModel.createService(data);

        if (!response.isOK) {
            return res.status(409).json({ message: response.message });
        }

        return res.status(201).json({ message: "Servicio creado exitosamente" });

    } catch (error) {
        console.error("Error creando servicio:", error);
        return res.status(500).json({ message: "Error al crear el servicio", error });
    }
};

module.exports = {
    getService,
    getProfService,
    updateService,
    deleteService,
    activeService,
    createService
};