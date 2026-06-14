# Guía de Branding - Found Me

## Identidad Visual

### Logo
- **Nombre**: Found Me
- **Concepto**: Símbolo de esperanza mediante un corazón con ubicación (pin)
- **Uso**: Logo.svg en `/public/logo.svg`
- **Variaciones**: El logo se adapta automáticamente en el navbar

### Paleta de Colores

#### Colores Primarios
- **Azul principal**: #2b7d9e
  - RGB: (43, 125, 158)
  - Uso: Fondo principal, botones primarios, enlaces
  - Significado: Confianza, seguridad, esperanza

- **Verde agua (Acento)**: #1e9b8f
  - RGB: (30, 155, 143)
  - Uso: Gradientes, hover states, énfasis
  - Significado: Sanación, renovación, vida

#### Gradiente Principal
```
linear-gradient(135deg, #2b7d9e 0%, #1e9b8f 100%)
```
Utilizado en: Navbar, fondos de login/registro, botones principales

#### Colores Secundarios
- **Blanco**: #FFFFFF (fondo)
- **Gris claro**: #f5f5f5 (fondos alternativos)
- **Gris oscuro**: #333333 (texto principal)
- **Gris medio**: #666666 (texto secundario)

### Componentes Coloreados

**Navbar**
- Fondo: Gradiente azul → verde agua
- Texto: Blanco
- Sombra: rgba(43, 125, 158, 0.2)

**Botones Primarios**
- Fondo normal: #2b7d9e
- Fondo hover: #1e9b8f
- Transición suave: 0.3s

**Campos de Entrada**
- Border focus: #2b7d9e
- Sombra focus: rgba(43, 125, 158, 0.1)

**Tarjetas**
- Sombra: rgba(0, 0, 0, 0.1)
- Hover: Elevar 5px con sombra aumentada

## Tipografía

- **Familia**: System fonts (seguro, rápido y accesible)
- **Tamaños**:
  - H1: 24px (títulos principales)
  - H2: 18px (subtítulos)
  - Body: 14px (texto normal)
  - Small: 12px (texto secundario)

## Tono de Voz

- Empático y esperanzador
- Profesional pero accesible
- Urgente sin ser alarmante
- Inclusivo y respetuoso

## Aplicaciones en Interfaz

### Páginas Implementadas

1. **HomePage** (/): Búsqueda y listado de personas
   - Colores: Verde agua en ubicación
   - Énfasis: Edad y ubicación en azul

2. **LoginPage** (/login): Entrada al sistema
   - Fondo: Gradiente azul-verde agua
   - Botones: Azul primario

3. **RegisterPage** (/register): Registro de usuarios
   - Fondo: Gradiente azul-verde agua
   - Botones: Azul primario

4. **CreatePostPage** (/create): Publicar caso
   - Fondo: Blanco con sombra sutil
   - Botones: Azul primario

## Directrices de Uso

✅ **Haz**:
- Mantén consistencia en los colores
- Usa el gradiente para elementos de importancia
- Crea suficiente contraste para accesibilidad
- Aplica transiciones suaves en interacciones

❌ **No hagas**:
- Cambiar los colores primarios sin consenso
- Mezclar colores del branding con otros
- Usar menos de 4.5:1 de contraste en textos

## Accesibilidad

- Todos los colores cumplen WCAG AA para contraste
- Las interacciones tienen suficiente espacio
- Los iconos van acompañados de etiquetas de texto
- Las animaciones son reducidas y opcionales

---

**Última actualización**: Junio 2026
**Versión**: 1.0
