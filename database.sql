-- Crear base de datos
CREATE DATABASE IF NOT EXISTS desapariciones;
USE desapariciones;

-- Tabla de usuarios
CREATE TABLE usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  foto_perfil VARCHAR(500),
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de personas desaparecidas
CREATE TABLE personas_desaparecidas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  edad INT,
  descripcion LONGTEXT,
  foto TEXT,
  fecha_desaparicion DATE NOT NULL,
  ubicacion VARCHAR(255),
  estado ENUM('activa', 'encontrada', 'cerrada') DEFAULT 'activa',
  sexo VARCHAR(50) DEFAULT NULL,
  senas_particulares TEXT DEFAULT NULL,
  telefono VARCHAR(20) DEFAULT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla de comentarios (opcional para futuras mejoras)
CREATE TABLE comentarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  persona_id INT NOT NULL,
  usuario_id INT NOT NULL,
  contenido TEXT NOT NULL,
  parent_id INT DEFAULT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (persona_id) REFERENCES personas_desaparecidas(id) ON DELETE CASCADE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_id) REFERENCES comentarios(id) ON DELETE CASCADE
);

-- Índices para mejorar búsquedas
CREATE INDEX idx_nombre ON personas_desaparecidas(nombre);
CREATE INDEX idx_apellido ON personas_desaparecidas(apellido);
CREATE INDEX idx_estado ON personas_desaparecidas(estado);
CREATE INDEX idx_email ON usuarios(email);
