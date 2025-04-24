const db = require("../config/firebase");

//creando servicio
//EJEMPLO
// {
//     "category": "Yoga",
//     "shortDescription: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
//     "description": "Sesiones grupales que combinan posturas, respiración y meditación para el bienestar físico y mental.",
//     "duration": 60,
//     "image": "https://i.pinimg.com/736x/bd/40/70/bd40706a5caf46f4139a021298f48ad4.jpg",
//     "isIndividual": false,
//      "benefits": ["xxxxxx","xxxxxxxxx","xxxxxxxxxx"],
//      "includes" : ["xxxxx,xxxx,xxxx"]
//     "name": "Yoga",
//     "price": 200100
//     "professional": /users/RL9UjLDxsVNkJ72ErDod (referencia real)
//   }

//traer todos los servicios
const getService = async (state, category, rol, userId) => {
    let query = db.collection("services");

    if (state !== undefined) query = query.where("state", "==", state);
    if (category) query = query.where("category", "==", category);
    if (rol === "profesional") query = query.where("professional", "==", db.doc(`/users/${userId}`));

    const snapshot = await query.get();

    const response = await Promise.all(snapshot.docs.map(async (doc) => {
        const data = doc.data();

        const service = { 
            category: data.category,
            id: doc.id, 
            shortDescription: data.shortDescription,
            description: data.description,
            duration: data.duration,
            image: data.image,
            isIndividual: data.isIndividual,
            name: data.name,
            price: data.price,
            professional: data.professional,
            benefits: data.benefits,
            includes: data.includes,
            state: data.state,
        };

        if (data.professional && typeof data.professional.get === "function") {
            const profSnap = await data.professional.get();
            const profData = profSnap.data();
            service.professional = {
                id: data.professional.id,
                name: profData?.lastname + " " + profData?.name  || null
            };
        }

        return service;
    }));

    return response;
};

//actualizar el servicio por id
const updateService = async (id, serviceData) => {
    try {
        const doc = db.collection("services").doc(id);

        if (serviceData.professional && typeof serviceData.professional === "string")
            serviceData.professional = db.doc(serviceData.professional);

        const snapshot = await doc.get();

        if (!snapshot.exists) {
            return { isOK: false, message: "No se encontro el servicio" };
        }

        await doc.update(serviceData);
        return { isOK: true };
    } catch (error) {
        console.error("Error en serviceModel.updateService:", error);
        return { isOK: false, message: "Error al actualizar el servicio", error };
    }
};


//borrado logico por id
const deleteService = async (id) => {
    const snapshot = await db.collection("services").doc(id).get();
    if (!snapshot.exists) return { isOK: false, message: "No se encontró el servicio" };

    const newState = { state: false };

    await db.collection("services").doc(id).update(newState);
    return { isOK: true };
};


//activado por id
const activeService = async (id) => {
    const snapshot = await db.collection("services").doc(id).get();
    if (!snapshot.exists) return { isOK: false, message: "No se encontró el servicio" };

    const newState = { state: true };

    await db.collection("services").doc(id).update(newState);
    return { isOK: true };
};

const createService = async (data) => {
    const { name, shortDescription, description, category, price, duration, benefits, includes, professional,image } = data;

    const professionalRef = db.doc(professional);

    const snapshot = await db.collection("services")
        .where("professional", "==", db.doc(professionalRef))
        .get();

    const duplicate = snapshot.docs.find(doc => {
        const s = doc.data();
        return s.name === name &&
            s.description === description &&
            s.shortDescription === shortDescription &&
            s.category === category &&
            s.price === price &&
            s.duration === duration &&
            JSON.stringify(s.benefits) === JSON.stringify(benefits) &&
            JSON.stringify(s.includes) === JSON.stringify(includes) &&
            (s.image || null) === image;
    });

    if (duplicate) {
        return { isOK: false, message: "El servicio ya existe" };
    }

    // Crear el nuevo servicio
    await db.collection("services").add({
        name,
        description,
        shortDescription,
        category,
        duration,
        price,
        image,
        benefits,
        includes,
        state: true,
        professional: professionalRef
    });

    return { isOK: true };
};

module.exports = {
    getService,
    updateService,
    deleteService,
    activeService,
    createService
};