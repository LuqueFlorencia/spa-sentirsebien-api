const db = require("../config/firebase");

const getUsers = async (userType) => {
    let query = db.collection("users");

    if (userType) {
        query = query.where("userType", "==", userType);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};


const updateUser = async (email, userData) => {
    const snapshot = await db.collection("users")
                                 .where("email", "==", email)
                                 .limit(1)
                                 .get();
    
    if (snapshot.empty) return false;    

    const doc = snapshot.docs[0];                             
    await db.collection("users").doc(doc.id).update(userData);    
    return true;
};


const deleteUser = async (email) => {
    const snapshot = await db.collection("users")
                            .where("email", "==", email)
                            .limit(1)
                            .get();

    if (snapshot.empty) return false;

    const doc = snapshot.docs[0];
    await db.collection("users").doc(doc.id).delete();
    return true;
};

module.exports = { getUsers, updateUser, deleteUser };
