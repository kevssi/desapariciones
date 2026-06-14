# Found Me - Red Social de Personas Desaparecidas

Una aplicación web completa para crear y compartir información sobre personas desaparecidas. Incluye autenticación de usuarios, publicación de casos y búsqueda de personas.

## 🎨 Branding

- **Logo**: Found Me - Símbolo de esperanza con corazón y ubicación
- **Colores Primarios**: 
  - Azul: #2b7d9e (confianza y seguridad)
  - Verde agua: #1e9b8f (esperanza y sanación)
- **Tipografía**: Sistema moderno y accesible

## 🚀 Características

- ✅ Autenticación y registro de usuarios
- ✅ Publicar casos de personas desaparecidas
- ✅ Búsqueda y filtrado de casos
- ✅ Sistema de perfiles de usuario
- ✅ Interfaz moderna y responsiva
- ✅ Base de datos MySQL segura

## 📋 Requisitos Previos

- Node.js (v14 o superior)
- MySQL (v5.7 o superior)
- npm

## 🛠️ Instalación

### 1. Configurar Base de Datos

```bash
# Abrir MySQL
mysql -u root -p

# Ejecutar el script SQL
source database.sql
```

O simplemente copia el contenido de `database.sql` y ejecutalo en tu cliente MySQL.

### 2. Configurar Backend

```bash
cd backend

# Copiar archivo de ejemplo
cp .env.example .env

# Instalar dependencias
npm install

# Iniciar servidor (development)
npm run dev

# O para producción
npm start
```

El servidor estará disponible en `http://localhost:5000`

### 3. Configurar Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar desarrollo
npm start
```

La aplicación estará disponible en `http://localhost:3000`

## 📝 Variables de Entorno (.env)

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contraseña
DB_NAME=desapariciones
JWT_SECRET=tu_clave_secreta_aqui
PORT=5000
NODE_ENV=development
```

## 🔐 Autenticación

La aplicación utiliza JWT (JSON Web Tokens) para la autenticación segura:

- **Registro**: POST `/api/auth/register`
- **Login**: POST `/api/auth/login`
- **Perfil**: GET `/api/auth/profile` (requiere token)

## 📌 API Endpoints

### Personas Desaparecidas

- **GET** `/api/missing-persons` - Obtener todas las personas
- **GET** `/api/missing-persons/:id` - Obtener persona por ID
- **GET** `/api/missing-persons/search?q=query` - Buscar personas
- **POST** `/api/missing-persons` - Crear publicación (requiere autenticación)
- **PUT** `/api/missing-persons/:id` - Actualizar publicación (requiere autenticación)
- **DELETE** `/api/missing-persons/:id` - Eliminar publicación (requiere autenticación)

## 📂 Estructura del Proyecto

```
desapariciones/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   └── MissingPerson.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── missingPersons.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js
│   │   │   └── Navbar.css
│   │   ├── pages/
│   │   │   ├── Home.js
│   │   │   ├── AuthPages.js
│   │   │   ├── CreatePost.js
│   │   │   └── *.css
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
└── database.sql
```

## 🎯 Primeros Pasos

1. **Crea una cuenta** en la página de registro
2. **Inicia sesión** con tus credenciales
3. **Publica un caso** haciendo clic en "Publicar"
4. **Busca casos** usando la barra de búsqueda
5. **Comparte** la información para ayudar a encontrar personas

## 🔧 Desarrollo

### Backend
- Express.js para el servidor
- MySQL para la base de datos
- JWT para autenticación
- bcryptjs para contraseñas

### Frontend
- React para la interfaz
- React Router para navegación
- Axios para peticiones HTTP
- CSS3 para estilos

## 🐛 Troubleshooting

### "Cannot find module 'mysql2'"
```bash
cd backend && npm install
```

### "Connection refused"
- Verifica que MySQL esté corriendo
- Verifica las credenciales en `.env`

### "CORS error"
- El backend debe estar en `http://localhost:5000`
- El frontend debe estar en `http://localhost:3000`

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

## 👥 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📧 Contacto

Para preguntas o sugerencias, contacta al equipo de desarrollo.

---

**Nota**: Esta aplicación está diseñada para ayudar a encontrar personas desaparecidas. Úsala responsablemente y respeta la privacidad de las personas.
