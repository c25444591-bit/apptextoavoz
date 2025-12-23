# AudioLibro 🎧📖

Una aplicación web moderna para convertir libros PDF y texto en experiencias de audio accesibles, optimizada especialmente para personas con baja visión y maculopatía.

## ✨ Características Principales

### 🎯 Accesibilidad Avanzada
- **Modos de visualización**: Estándar, Alto Contraste, y Lentes Amarillos
- **Escalado de texto**: 100%, 125%, 150%, 200%, 250%
- **Fuentes optimizadas**: Inter y opciones de espaciado personalizado
- **Navegación por teclado**: Completa compatibilidad con lectores de pantalla
- **Alto contraste**: Optimizado para maculopatía

### 📚 Procesamiento de Libros
- **Formatos soportados**: PDF, TXT, MD
- **Limpieza automática**: Eliminación de referencias bibliográficas y metadatos
- **Procesamiento inteligente**: Optimización del contenido para audio
- **Biblioteca personal**: Organización y seguimiento de progreso

### 🎵 Síntesis de Voz
- **Web Speech API**: Sin dependencias externas, completamente open-source
- **Voces en español**: Preferencia por voces femeninas con acento argentino
- **Control de velocidad**: 0.5x a 2x
- **Personalización**: Rate, pitch y volumen ajustables

### 👤 Gestión de Usuario
- **Registro simple**: Sin validación de email compleja
- **Persistencia**: Todos los datos guardados localmente
- **Configuraciones**: Preferencias de accesibilidad y reproducción
- **Importación/Exportación**: Respaldo de biblioteca

## 🚀 Instalación y Uso

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Navegador moderno con soporte para Web Speech API

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd audiolibro-app
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

4. **Construir para producción**
   ```bash
   npm run build
   ```

5. **Vista previa de producción**
   ```bash
   npm run preview
   ```

## 🎯 Guía de Uso

### Primer Uso
1. **Registro**: Crea una cuenta o usa la cuenta demo
2. **Configuración**: Ajusta preferencias de accesibilidad
3. **Subir libro**: Arrastra o selecciona un archivo PDF/TXT
4. **Disfrutar**: Escucha tu libro con controles personalizados

### Características Especiales

#### Panel de Accesibilidad
- Accesible desde cualquier pantalla (botón en esquina superior derecha)
- Tres modos de color optimizados
- Control granular de tamaño de texto
- Configuración de fuente y espaciado

#### Limpieza Automática
La aplicación elimina automáticamente:
- Referencias bibliográficas
- Números de página
- Metadatos del PDF
- Enlaces y emails
- Texto de copyright
- Artefactos de OCR

#### Reproductor Avanzado
- **Marcadores**: Crear puntos de referencia
- **Velocidad variable**: Control preciso de reproducción
- **Navegación**: Saltar entre párrafos
- **Progreso**: Seguimiento detallado de lectura

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18** con TypeScript
- **Vite** para build y desarrollo
- **Lucide React** para iconos
- **CSS moderno** con variables y grid

### Procesamiento
- **PDF.js** para extracción de PDFs
- **Web Speech API** para síntesis de voz
- **FileReader API** para manejo de archivos

### Almacenamiento
- **localStorage** para persistencia de datos
- **JSON** para serialización de estados complejos

## 📊 Arquitectura

### Servicios Principales

#### `AuthService`
- Gestión de usuarios y autenticación
- Persistencia en localStorage
- Configuración de preferencias

#### `FileProcessorService`
- Procesamiento de PDFs con PDF.js
- Limpieza de texto automatizada
- Extracción de metadatos

#### `TextToSpeechService`
- Integración con Web Speech API
- Gestión de voces y configuraciones
- Control de reproducción

#### `BookService`
- CRUD de libros
- Seguimiento de progreso
- Organización de biblioteca

### Hooks Personalizados

#### `useAuth()`
- Manejo de estado de autenticación
- Operaciones de login/logout
- Sincronización con AuthService

#### `useBooks()`
- Gestión de biblioteca de libros
- Operaciones CRUD
- Búsqueda y filtrado

#### `useTextToSpeech()`
- Control de síntesis de voz
- Estado de reproducción
- Configuración de voces

### Componentes Principales

#### `AuthForm`
- Pantalla de login/registro
- Cuenta demo integrada
- Validación de formularios

#### `Dashboard`
- Biblioteca de libros
- Carga de archivos
- Gestión de biblioteca

#### `BookReader`
- Visualización de contenido
- Controles de reproducción
- Navegación de texto

#### `AccessibilityPanel`
- Configuración de accesibilidad
- Modos de color
- Escalado de texto

## 🎨 Sistema de Diseño

### Colores
- **Fondo**: Gris oscuro (#1A1A1A) para reducir fatiga
- **Superficies**: Gris medio (#242424) para tarjetas
- **Texto**: Blanco roto (#E4E4E7) para alta legibilidad
- **Acentos**: Amarillo ámbar (#FFC700) para elementos activos

### Tipografía
- **Fuente**: Inter (optimizada para pantallas)
- **Escalado**: Sistema flexible hasta 2.5x
- **Altura de línea**: 1.8 por defecto (ajustable)

### Espaciado
- Sistema base de 8px
- Jerarquía clara de espaciado
- Áreas táctiles grandes (mínimo 44px)

## 🔧 Configuración

### Variables de Entorno
```env
# Opcional: Para monitoreo de errores
VITE_SENTRY_DSN=your-sentry-dsn

# Opcional: Para analytics
VITE_ANALYTICS_ID=your-analytics-id
```

### Configuración de Voz
La aplicación automáticamente:
1. Busca voces españolas disponibles
2. Prioriza voces femeninas
3. Configura acento argentino si está disponible
4. Permite selección manual si es necesario

### Optimizaciones de Rendimiento
- **Code splitting**: Vendedor, PDF, utils separados
- **Lazy loading**: Componentes cargados bajo demanda
- **Service Worker**: Cache para funcionamiento offline
- **Optimización de bundle**: Tree shaking automático

## 🧪 Testing

### Tests de Accesibilidad
```bash
# Linting de accesibilidad
npm run a11y-audit

# Validación de contraste
npm run contrast-check
```

### Tests de Funcionalidad
```bash
# Tests unitarios
npm run test

# Tests de integración
npm run test:integration

# Tests E2E
npm run test:e2e
```

## 📱 PWA (Progressive Web App)

### Características
- **Instalable**: Se puede instalar como app nativa
- **Offline**: Funciona sin conexión para libros ya procesados
- **Notificaciones**: Recordatorios de lectura
- **Responsive**: Optimizado para móvil y escritorio

### Configuración
La app incluye:
- `manifest.json` para instalación
- Service Worker para cache
- Configuración de iconos
- Meta tags para PWA

## ⚖️ Aviso Legal y Responsabilidad

### Disclaimers Importantes
- **⚠️ DERECHOS DE AUTOR**: El usuario es **únicamente responsable** de asegurar que tiene los derechos legales para convertir archivos a audio
- **⚖️ RESPONSABILIDAD LEGAL**: La aplicación NO se responsabiliza por infracciones de derechos de autor
- **📋 TÉRMINOS**: Al usar la aplicación, usted acepta nuestros términos completos

### Contenido Permitido
✅ **Permitido para uso:**
- Contenido de su autoría
- Obras en dominio público
- Material con licencia explícita para conversión a audio
- Contenido para uso educativo y de investigación autorizado
- Material para personas con discapacidades visuales (uso personal)

❌ **Prohibido:**
- Libros protegidos por derechos de autor sin autorización
- Contenido comercial sin permisos
- Material que viole propiedad intelectual de terceros
- Contenido ilegal o que promueva actividades ilícitas

### Modal de Aceptación
- Se muestra al subir el primer archivo
- Requiere aceptación explícita de términos
- Enlace a términos completos disponibles
- Recordatorio visual en área de carga

📄 **Términos completos**: Ver `public/TERMINOS_CONDICIONES.md`

## 🔒 Privacidad y Seguridad

### Datos Locales
- **Todo almacenado localmente**: No se envían datos a servidores externos
- **Sin tracking**: No recopila información personal
- **Control total**: El usuario puede eliminar todos sus datos

### Seguridad
- **Sin almacenamiento de contraseñas**: Solo nombres de usuario
- **Validación de archivos**: Verificación de tipos y tamaños
- **Sanitización**: Limpieza de contenido de archivos

## 🤝 Contribución

### Desarrollo
1. Fork el repositorio
2. Crea una rama para tu feature
3. Implementa con pruebas
4. Verifica accesibilidad
5. Envía pull request

### Guidelines de Código
- **TypeScript**: Tipado estricto
- **ESLint**: Configuración accesible
- **Prettier**: Formato consistente
- **Commits**: Conventional commits

### Testing Requirements
- Todos los componentes deben tener tests de accesibilidad
- Verificar contraste de colores
- Validar navegación por teclado
- Tests con lectores de pantalla

## 📝 Changelog

### v1.0.0 (Actual)
- ✅ Conversión de PDF/texto a audio
- ✅ Modos de accesibilidad completos
- ✅ Sistema de usuarios con localStorage
- ✅ Limpieza automática de contenido
- ✅ Reproductor de audio integrado
- ✅ Biblioteca personal
- ✅ PWA básica

### Próximas Versiones
- 🔄 Sincronización en la nube (opcional)
- 🔄 Más formatos de archivo (EPUB, DOCX)
- 🔄 Detección automática de idioma
- 🔄 Controles de reproducción avanzados
- 🔄 Exportación de audio a MP3

## 📞 Soporte

### Problemas Conocidos
- **Web Speech API**: Requiere Chrome/Firefox/Safari
- **Voces limitadas**: Dependiente del sistema operativo
- **Archivos grandes**: Límite de 50MB por archivo

### Solución de Problemas
1. **No se carga la página**: Verificar JavaScript habilitado
2. **No funciona audio**: Comprobar soporte de Web Speech API
3. **Problemas de acceso**: Verificar configuraciones de accesibilidad
4. **Archivos no se procesan**: Validar formato y tamaño

### FAQ

**¿Es gratuito?**
Sí, completamente gratuito y open-source.

**¿Qué navegadores soporta?**
Chrome, Firefox, Safari, Edge (últimas versiones).

**¿Los datos son seguros?**
Sí, todo se almacena localmente en tu dispositivo.

**¿Funciona sin internet?**
Sí, para libros ya procesados.

**¿Soporta otros idiomas?**
Actualmente optimizado para español, pero puede funcionar con otros idiomas.

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para detalles.

## 🙏 Agradecimientos

- **Deb Dana** por "La teoría polivagal en terapia"
- **Comunidad de accesibilidad web** por guías y mejores prácticas
- **React Team** por el framework
- **Vite Team** por la herramienta de build
- **Comunidad de desarrolladores** por las librerías utilizadas

---

**AudioLibro** - Convierte tus libros en experiencias de audio accesibles 🎧📖