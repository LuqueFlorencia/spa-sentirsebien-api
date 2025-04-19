const db = require("../config/firebase");

const getAppts = async(rol, userId, state) => {
    let query = db.collection("appointments");

    if (rol === "profesional")
        query = query.where("professionalId", "==", db.doc(`/users/${userId}`));
    if (rol === "cliente")
        query = query.where("clientId", "==", db.doc(`/users/${userId}`));

    if (state) 
        query = query.where("state", "==", state);
    
    const snapshot = await query.get();
    if (snapshot.empty) return [];

    const response = await Promise.all(snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const appointment = { 
            id: doc.id, 
            state: data.state,
            date: data.date,
            hour: data.hour,
            notes: data.notes
        };

        let clientData;

        if (data.clientId && typeof data.clientId.get === "function") {
            const clientSnap = await data.clientId.get();
            clientData = clientSnap.data();
        }

        if (data.serviceId && typeof data.serviceId.get === "function") {            
            const serviceSnap = await data.serviceId.get();
            const serviceData = serviceSnap.data();

            const professionalSnap = await serviceData.professional.get();
            const professionalData = professionalSnap.data();
            
            appointment.serviceId = {
                id: data.serviceId.id,
                name: serviceData?.name,
                professionalId: serviceData?.professional.id,
                professionalLastname: professionalData?.lastname + ", " + professionalData?.name,
                clientId: clientData?.id,
                clientLastname: clientData?.lastname + ", " + clientData?.name,
                clientEmail: clientData?.email,
                clientTelephone: clientData?.telephone,
                durationMin: serviceData?.durationMin,
                price: serviceData?.price,
                paymentStatus: data.paymentStatus
            };
        }
        return appointment;
    }));

    return response;
};

const getAvailableSlots = async (serviceId, date) => {
    const serviceSnap = await db.collection('services').doc(serviceId).get();
    if (!serviceSnap.exists) return { "isOK": false, "message": "No se encontro el servicio" };

    const serviceData = serviceSnap.data();
    const professionalRef = serviceData.professional;

    const profSnap = await professionalRef.get();
    if (!profSnap.exists) return { "isOK": false, "message": "Servicio sin profesional asignado para realizarlo" };

    const profData = profSnap.data();
    const availability = profData.availability;

    const dayName = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado","domingo"]; 
    const weekday = dayName[new Date(date).getDay()];

    const dayBlock = availability.find(d => d.day === weekday);
    if (!dayBlock) return { "isOK": true, "message": [] };

    const availableHours = dayBlock.schedule
        .filter(h => h.available)
        .map(h => h.hour);

    const appointment = {
        professionalId : professionalRef.id,
        weekday,
        availability,
        availableHours
    };

    return { "isOK": true, "data": appointment };
};

const createAppointment = async({ serviceId, clienteId, date, hour, notes }) => {
    return await db.runTransaction(async (transaction) => {
        const result = await getAvailableSlots(serviceId, date);
        if (!result.isOK) return { message: result.message };
            
        const { professionalId, availability, weekday, availableHours } = result.data;

        if (!availableHours.includes(hour)) return { "isOK": false, "message": "El turno seleccionado no esta disponible" };
        
        // Marcar el horario como no disponible
        const dayBlock = availability.find(d => d.day === weekday);
        const hourBlock = dayBlock.schedule.find(h => h.hour === hour);
        hourBlock.available = false;

        const response = await db.collection("users").doc(professionalId).update({ availability });
        if (!response) return { "isOK": false, "message": "Error al reservar el turno" };
        
        // Crear el turno
        const newApptRef = db.collection("appointments").doc();
        transaction.set(newApptRef, {
            clientId: db.doc(`users/${clienteId}`),
            professionalId: db.doc(`users/${professionalId}`),
            serviceId: db.doc(`services/${serviceId}`),
            date,
            hour,
            state: "pendiente",
            paymentStatus: "pending",
            notes: notes || null
        });

        return { "isOK": true, "id": newApptRef.id };
    });
};

const cancelAppt = async (id) => {  
    const snapshot = await db.collection("appointments").doc(id).get();
    if (!snapshot.exists) return { "isOK": false, "message": "No se encontro turno a cancelar" };    
    
    const updateState = { state: "cancelado" };  

    const professionalRef = snapshot.data().professionalId;
    const profSnap = await professionalRef.get();
    const profData = profSnap.data();
    const availability = profData.availability;

    const dayName = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
    const weekday = dayName[new Date(snapshot.data().date).getDay()];    

    const dayBlock = availability.find(d => d.day === weekday);
    const hourBlock = dayBlock.schedule.find(h => h.hour === snapshot.data().hour);
    hourBlock.available = true;

    const updateAppt = await db.collection("appointments").doc(snapshot.id).update(updateState);
    if (!updateAppt) return { "isOK": false, "message": "Error al cancelar el turno" };

    const updateUser = await db.collection("users").doc(professionalRef.id).update({ availability });
    if (!updateUser) return { "isOK": false, "message": "Error al actualizar disponibilidad del profesional" };

    return { "isOK": true };
};

const confirmAppt = async (id) => {    
    const snapshot = await db.collection("appointments").doc(id).get();
    if (!snapshot.exists) return { "isOK": false, "message": "No se encontro turno a confirmar" };    
    
    const updateState = { state: "confirmado" };     
    const updateAppt = await db.collection("appointments").doc(snapshot.id).update(updateState);   
    if (!updateAppt) return { "isOK": false, "message": "Error al confirmar el turno" };

    return { "isOK": true };
};

const updateAppt = async (id, apptData) => {
    const snapshot = await db.collection("appointments").doc(id).get();
    
    if (!snapshot.exists) return { "isOK": false, "message": "No se encontro el turno a actualizar" };    

    await db.collection("appointments").doc(snapshot.id).update(apptData);    
    return { "isOK": true };
};


module.exports = { getAppts, getAvailableSlots, createAppointment, cancelAppt, confirmAppt, updateAppt };