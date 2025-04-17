const db = require("../config/firebase");
const { FieldValue } = require("firebase-admin").firestore;

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
        };

        if (data.telephone) user.telephone = data.telephone;
        if (data.certification) user.certification = data.certification;
        if (data.bio) user.bio = data.bio;
        if (data.specialties && Array.isArray(data.specialties)) user.specialties = data.specialties;

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

const getUserByEmail = async (email) => {
    const snapshot = await db.collection("users").where("email", "==", email).limit(1).get();                 
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    const data = doc.data();

    const user = { 
        userType: data.userType,
        id: doc.id, 
        name: data.name,
        lastname: data.lastname,
        email: data.email,
    };

    if (data.telephone) user.telephone = data.telephone;
    if (data.certification) user.certification = data.certification;
    if (data.bio) user.bio = data.bio;
    if (data.specialties && Array.isArray(data.specialties)) user.specialties = data.specialties;

    if (data.services && typeof data.services.get === "function") {
        const serviceSnap = await data.services.get();
        const serviceData = serviceSnap.data();
        user.services = {
            id: data.services.id,
            name: serviceData?.name || null
        };
    }

    return user;
};

const updateUser = async (email, userData) => {
    const snapshot = await db.collection("users").where("email", "==", email).limit(1).get();    
    if (snapshot.empty) return { "isOK": false, "message": "No se encontro el usuario" };    

    const doc = snapshot.docs[0]; 

    const response = await db.collection("users").doc(doc.id).update(userData);    
    if (!response) return { "isOK": false, "message":"Error al actualizar los datos" };

    return { "isOK": true };
};

const setDailyDates = async (id, availability) => {
    await db.collection("users").doc(id).update({ availability: availability });
};

const deleteUser = async (id) => {
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

module.exports = { getUsers, getUserByEmail, updateUser, setDailyDates, deleteUser, approveUser };
