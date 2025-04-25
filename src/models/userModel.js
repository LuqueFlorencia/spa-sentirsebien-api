const db = require("../firebase");

const getUsers = async (userType, state) => {
    let query = db.collection("users");

    if (userType) query = query.where("userType", "==", userType);

    if (state !== undefined) query = query.where("state", "==", state);

    const snapshot = await query.get();

    const response = await Promise.all(snapshot.docs.map(async (doc) => {
        const data = doc.data();

        const user = { 
            userType: data.userType,
            id: doc.id, 
            name: data.name,
            lastname: data.lastname,
            email: data.email,
            state: data.state,
        };

        if (data.telephone) user.telephone = data.telephone;
        if (data.certification) user.certification = data.certification;
        if (data.bio) user.bio = data.bio;
        if (data.specialties && Array.isArray(data.specialties)) user.specialties = data.specialties;
        if (data.image) user.image = data.image;

        if (data.services && typeof data.services.get === "function") {
            const serviceSnap = await data.services.get();
            const serviceData = serviceSnap.data();
            user.services = {
                id: data.services.id,
                name: serviceData?.name || null
            };
        }

        return user;
    }));

    return response;
};

const getClients = async (professionalId) => {  
    const snapshot = await db.collection("appointments")
                            .where("professionalId", "==", db.doc(`/users/${professionalId}`))
                            .get();
    
    if (snapshot.empty) return [];  

    const clientsMap = {};

    for (const doc of snapshot.docs) {
        const data = doc.data();

        if (!data.clientId || typeof data.clientId.get !== "function") continue;

        const clientSnap = await data.clientId.get();
        const clientData = clientSnap.data();

        if (!clientData) continue;
        if (!clientData || clientData.state === false) continue;
    
        const clientId = clientSnap.id;

        if (!clientsMap[clientId]) {
            clientsMap[clientId] = {
                id: clientId,
                lastname: clientData.lastname,
                name: clientData.name,
                email: clientData.email,
                telephone: clientData.telephone,
                appointments: []
            };
        }

        let serviceName = "";
         if (data.serviceId && typeof data.serviceId.get === "function") {            
            const serviceSnap = await data.serviceId.get();
            const serviceData = serviceSnap.data();
            serviceName = serviceData?.name || "";
        }

        clientsMap[clientId].appointments.push({
            service: serviceName,
            date: data.date,
            hour: data.hour,
            notes: data.notes || ""
        });
    }

    const response = Object.values(clientsMap).map(client => {
        client.appointments.sort((a, b) => new Date(b.date) - new Date(a.date));
        const last = client.appointments[0];

        return {
            ...client,
            lastVisit: last?.date || null,
            lastService: last?.service || null
        };
    });

    return response;
};

const updateUser = async (id, userData) => {
    console.log("1" + JSON.stringify(id));
    
    const snapshot = await db.collection("users").doc(id).get();    
    console.log("2");
    if (!snapshot.exists) return { "isOK": false, "message": "No se encontro el usuario" };    
    console.log("3");

    const response = await db.collection("users").doc(snapshot.id).update(userData);    
    console.log("4");
    if (!response) return { "isOK": false, "message":"Error al actualizar los datos" };
    console.log("5");

    return { "isOK": true };
};

const setDailyDates = async (id, availability) => {
    await db.collection("users").doc(id).update({ availability: availability });
};

const deleteUser = async (id) => {
    const snapshot = await db.collection("users").doc(id).get();
    if (!snapshot.exists) return { "isOK": false, "message": "No se encontro el usuario" };

    const newState = { state: false };  

    const updateState = await db.collection("users").doc(snapshot.id).update(newState);
    if (!updateState) return { "isOK": false, "message": "Error al eliminar al usuario" };

    return { "isOK": true };
};

const realDeleteUser = async (id) => {
    const snapshot = await db.collection("users").doc(id).get();
    if (!snapshot.exists) return { "isOK": false, "message": "No se encontro el usuario" };

    const response = await db.collection("users").doc(snapshot.id).delete();
    if (!response) return { "isOK": false, "message":"Error al eliminar el usuario" };

    return { "isOK": true };
};

const approveUser = async (id) => {  
    const snapshot = await db.collection("users").doc(id).get();
    if (!snapshot.exists) return { "isOK": false, "message": "No se encontro el usuario a activar" };    
    
    const newState = { state: true };  

    const updateState = await db.collection("users").doc(snapshot.id).update(newState);
    if (!updateState) return { "isOK": false, "message": "Error al activar al profesional" };

    return { "isOK": true };
};

module.exports = { 
    getUsers,  
    getClients,
    updateUser, 
    setDailyDates, 
    deleteUser, 
    realDeleteUser, 
    approveUser 
};
