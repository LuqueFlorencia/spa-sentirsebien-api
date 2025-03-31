const db = require("../config/firebase");

// Obtener todos los usuarios
const getUsers = async () => {
    const snapshot = await db.collection("users").get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Crear un usuario
const addUser = async (userData) => {
    const ref = await db.collection("users").add(userData);
    return { id: ref.id, ...userData };
};

// Obtener usuario por username
const getUser = async (id) => {
    const doc = await db.collection("users").where("username","==",id).get();
    if (doc.empty) return null;
    return doc.docs.map(doc => ({ ...doc.data()}));
};

// Eliminar usuario
const deleteUser = async (id) => {
    await db.collection("users").doc(id).delete();
    return { message: "Usuario eliminado" };
};

module.exports = { getUsers, addUser, getUser, deleteUser };
