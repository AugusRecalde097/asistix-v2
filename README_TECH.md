README Técnico — Asistix v2

1. Objetivo técnico
   Asistix v2 es una app móvil construida con React Native + Expo para gestión escolar offline (alumnos, cursos, escuelas, localidades y asistencia), con persistencia local usando AsyncStorage.

2. Stack y dependencias clave
   Runtime: react, react-native, expo

Navegación: @react-navigation/native, @react-navigation/bottom-tabs, @react-navigation/native-stack

Persistencia: @react-native-async-storage/async-storage

UI/UX: @expo/vector-icons, react-native-safe-area-context

Scripts principales:

npm install
npx expo start
También:

npm run android

npm run ios

3. Estructura del proyecto
   src/
   ├── navigation/ # Tabs + stacks
   ├── screens/ # Pantallas de dominio
   ├── components/ # Componentes reutilizables UI
   ├── storage/ # Capa de acceso a datos local
   └── theme/ # Tokens visuales
   Referencia de estructura funcional en README de producto.

4. Ciclo de arranque de la app
   index.js registra el root component.

App.js configura Safe Area + NavigationContainer + StatusBar + TabNavigator.

En el montaje se ejecuta seedDemoData() para poblar datos iniciales si está vacío.

5. Navegación
   5.1 Arquitectura
   Navegación principal por tabs:

Alumnos

Cursos

Escuelas

Localidades

Reportes

5.2 Stacks anidados
Alumnos:

Lista

Detalle

Formulario

Cursos:

Lista

Toma de asistencia

Historial de asistencia

6. Modelo de datos (persistencia local)
   La capa de datos está centralizada en src/storage/db.js y usa claves de AsyncStorage por entidad.

6.1 Entidades
Localidades

Escuelas

Cursos

Alumnos

Patrón CRUD por entidad:

getX()

saveX()

deleteX()

saveX hace upsert por id y agrega createdAt cuando corresponde.

6.2 Asistencia
Registro por combinación (cursoId, fecha) con estructura:

{
id,
cursoId,
fecha: "YYYY-MM-DD",
registros: [{ alumnoId, estado }]
}
Estados soportados:

presente

ausente

tardanza

justificado

7. Patrones en pantallas
   Carga de datos al foco con useFocusEffect y Promise.all.

Resolución de relaciones en memoria por IDs (curso → escuela → localidad).

Filtrado/sorting local en listas.

Ejemplo: Alumnos
Búsqueda por nombre/apellido/DNI.

Filtro por año de curso.

Navegación a detalle/formulario.

Ejemplo: Cursos
CRUD en modal.

Acceso directo a toma de asistencia.

Ejemplo: Asistencia
Gestión por fecha.

Carga de asistencia existente o default “presente”.

Guardado por lote para todos los alumnos del curso.

8. UI System (tema y componentes)
   Tokens visuales: colors, spacing, radius, shadow en theme/colors.js.

Componente reusable típico de listas: ListCard.

9. Observaciones técnicas / deuda
   Hay dos fuentes de theme (theme/colors.js y theme/index.js) con naming diferente; conviene unificar.

hooks/useData.js parece legado/desalineado: usa AlumnosDB/CursosDB/..., pero la capa actual exporta funciones directas (getAlumnos, etc.).

Existe combinación de imports de componentes por archivo y vía components/index, potencialmente duplicando criterios de UI.

10. Guía de onboarding (orden sugerido)
    src/storage/db.js (modelo y operaciones).

src/navigation/TabNavigator.js (rutas y flujos).

src/screens/AlumnosScreen.js + src/screens/AsistenciaScreen.js (casos simples/avanzados).

src/theme/ y src/components/ (estándares de UI).
