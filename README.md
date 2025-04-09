**Proyecto SPA Sentirse Bien (AppWeb)**
**TUP 2025 - UTN FRRe**

***Descripcion***
Este proyecto es una API desarrollada en Node.js que utiliza Firebase-Firestore como BD.

***Tecnologías***
* Node.js
* Express.js
* Firebase Firestore
* dotenv (para gestión de variables de entorno)
* nodemon (para desarrollo de recarga automática)
* JsonWebToken (para gestionar la autorización/autenticación de usuarios)
* BCryptJS (para cifrar las contraseñas antes del guardado en la BD)
* Swagger (para documentar y probar endopoints desde una interfaz web)

***Requisitos***
* Node.js
* Una cuenta de  Firebase y un proyecto configurado

***Instalación***
1. Clonar el repositorio:

'git clone https://github.com/LuqueFlorencia/spa-sentirsebien-api.git
cd tu-repo'*

2. Instalar las dependencias dentro del proyecto:

'npm install'

3. Instalar nodemon como dependencia de desarrollo (opcional pero recomendado):

'npm install --save-dev nodemon'

4. Configurar las variables de entorno: Crear un archivo .env dentro de ./src/ del proyecto con el siguiente contenido:

PORT = 3000
JWT_SECRET=miClaveJWTsuperSegura2025!
FIREBASE_PROJECT_ID = spa-sentirsebien-api
FIREBASE_PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL = "firebase-adminsdk-fbsvc@spa-sentirsebien-api.iam.gserviceaccount.com"

5. Con nodemon instalado: Iniciar el servidor desde el directorio del proyecto:
'nodemon .\server.js' o 'npm run dev'
Sin nodemon: 
'node .\server.js' o 'npm run start' # Requiere detener y reiniciar el server ante cualquier cambio en el codigo

***Estructura del Proyecto***

📁 spa-sertirsebien-api/
 ├── 📁 src/
 │   ├── 📁 config/
 │   │   ├── firebase.js
 │   ├── 📁 controllers/
 │   │   ├── *.js
 │   ├── 📁 middlewares/
 │   │   ├── *.js
 │   ├── 📁 models/
 │   │   ├── *.js
 │   ├── 📁 routes/
 │   │   ├── *.js
 │   ├── server.js
 │   ├── swagger.js
 │   ├── .env   # Si corres el servidor con el comando *nodemon .\server.js* el .env debe estar aca
 ├── .env       # Si corres el servidor con el comando *npm run dev* el .env debe estar aca
 ├── .gitignore
 ├── package.json
 ├── README.md
