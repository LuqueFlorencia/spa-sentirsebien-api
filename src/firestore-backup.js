const fs = require("fs");
const path = require("path");
const db = require("./firebase");

const BACKUP_DIR = "./backups";

// 🔄 Backup de todas las colecciones
async function backupAll() {
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR);

  const collections = await db.listCollections();

  for (const col of collections) {
    const snapshot = await col.get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const filePath = path.join(BACKUP_DIR, `${col.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`✅ Backup de colección '${col.id}' guardado en ${filePath}`);
  }
}

// 🔁 Restore de todas las colecciones desde archivos JSON
async function restoreAll() {
  if (!fs.existsSync(BACKUP_DIR)) {
    console.error("❌ No existe la carpeta 'backups'. Hacé un backup primero.");
    return;
  }

  const files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith(".json"));

  for (const file of files) {
    const collectionName = file.replace(".json", "");
    const rawData = fs.readFileSync(path.join(BACKUP_DIR, file));
    const documents = JSON.parse(rawData);

    for (const doc of documents) {
      const { id, ...data } = doc;
      await db.collection(collectionName).doc(id).set(data);
      console.log(`⬆️  Restaurado documento ${id} en colección '${collectionName}'`);
    }

    console.log(`✅ Restauración completa de '${collectionName}'`);
  }
}

// 🚀 Ejecutar según argumento
const action = process.argv[2];

if (action === "backup") {
  backupAll();
} else if (action === "restore") {
  restoreAll();
} else {
  console.log("ℹ️  Usá uno de estos comandos:");
  console.log("   node firestore-backup.js backup   # para hacer backup");
  console.log("   node firestore-backup.js restore  # para restaurar datos");
}
