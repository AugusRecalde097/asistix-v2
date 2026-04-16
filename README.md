# Asistix

App móvil en React Native (Expo) para gestión de alumnos de escuelas rurales.

## Características

- **Alumnos**: registro completo con DNI, fecha de nacimiento, dirección, teléfono/contacto familiar, asignado a un curso
- **Cursos**: cada curso pertenece a una escuela, con año y división
- **Escuelas**: cada escuela pertenece a una localidad
- **Localidades**: pueblos o localidades que agrupan escuelas
- **Reportes**: estadísticas de alumnos por localidad y por curso
- Datos 100% locales con AsyncStorage (sin internet)
- Compatible con celulares y tablets
- Safe Area para notch (iPhone X en adelante)
- Tab bar con íconos en la parte inferior

## Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar el proyecto
npx expo start

# 3. Escaneá el QR con la app Expo Go (iOS/Android)
```

## Estructura del proyecto

```
src/
├── navigation/
│   └── TabNavigator.js       ← Navegación principal (tabs + stacks)
├── screens/
│   ├── AlumnosScreen.js      ← Lista de alumnos con búsqueda y filtros
│   ├── AlumnoDetalleScreen.js← Perfil completo del alumno
│   ├── AlumnoFormScreen.js   ← Formulario alta/edición de alumno
│   ├── CursosScreen.js       ← CRUD de cursos
│   ├── EscuelasScreen.js     ← CRUD de escuelas
│   ├── LocalidadesScreen.js  ← CRUD de localidades
│   └── ReportesScreen.js     ← Estadísticas y gráficos
├── components/
│   ├── Avatar.js             ← Círculo con iniciales
│   ├── SearchBar.js          ← Barra de búsqueda
│   ├── FormField.js          ← Input reutilizable con label y error
│   ├── ListCard.js           ← Tarjeta de lista genérica
│   ├── FAB.js                ← Botón flotante +
│   ├── EmptyState.js         ← Estado vacío
│   └── SectionHeader.js      ← Título de sección con contador
├── storage/
│   └── db.js                 ← AsyncStorage: CRUD + seed de demo
└── theme/
    └── colors.js             ← Paleta, espaciados, radios, sombras
```

## Datos de ejemplo

Al iniciar por primera vez se cargan datos de demo:
- 3 localidades: San Javier, Alejandra, Romang
- 3 escuelas: E.P. N°5, E.P. N°2, E.P. N°7
- 4 cursos: 3°A, 4°B, 5°A, 3°B
- 6 alumnos de ejemplo

## Notas técnicas

- Los datos se persisten localmente con `@react-native-async-storage/async-storage`
- No requiere conexión a internet
- La navegación de Alumnos usa un Stack dentro del Tab (lista → detalle → form)
- Los formularios de Cursos, Escuelas y Localidades usan Modales bottom-sheet
- Los pickers de selección usan Modales con FlatList
