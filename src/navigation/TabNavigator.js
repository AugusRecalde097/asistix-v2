import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";

import AlumnosScreen from "../screens/AlumnosScreen";
import AlumnoDetalleScreen from "../screens/AlumnoDetalleScreen";
import AlumnoFormScreen from "../screens/AlumnoFormScreen";
import CursosScreen from "../screens/CursosScreen";
import EscuelasScreen from "../screens/EscuelasScreen";
import LocalidadesScreen from "../screens/LocalidadesScreen";
import ReportesScreen from "../screens/ReportesScreen";
import AsistenciaScreen from "../screens/AsistenciaScreen";
import AsistenciaHistorialScreen from "../screens/AsistenciaHistorialScreen";

const Tab = createBottomTabNavigator();
const AlumnosStack = createNativeStackNavigator();
const CursosStack = createNativeStackNavigator();

function CursosStackNavigator() {
  return (
    <CursosStack.Navigator screenOptions={{ headerShown: false }}>
      <CursosStack.Screen name="CursosList" component={CursosScreen} />
      <CursosStack.Screen name="AsistenciaTomar" component={AsistenciaScreen} />
      <CursosStack.Screen
        name="AsistenciaHistorial"
        component={AsistenciaHistorialScreen}
      />
    </CursosStack.Navigator>
  );
}

function AlumnosStackNavigator() {
  return (
    <AlumnosStack.Navigator screenOptions={{ headerShown: false }}>
      <AlumnosStack.Screen name="AlumnosList" component={AlumnosScreen} />
      <AlumnosStack.Screen
        name="AlumnoDetalle"
        component={AlumnoDetalleScreen}
      />
      <AlumnosStack.Screen name="AlumnoForm" component={AlumnoFormScreen} />
    </AlumnosStack.Navigator>
  );
}

const TAB_ICONS = {
  Alumnos: "people",
  Cursos: "document-text",
  Escuelas: "business",
  Localidades: "location",
  Reportes: "bar-chart",
  Inicio: "home",
};

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopWidth: 0.5,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarIcon: ({ focused, color, size }) => {
          const name = TAB_ICONS[route.name];
          return (
            <Ionicons
              name={focused ? name : `${name}-outline`}
              size={24}
              color={color}
            />
          );
        },
      })}>
      <Tab.Screen name="Inicio" component={ReportesScreen} />
      <Tab.Screen name="Alumnos" component={AlumnosStackNavigator} />
      <Tab.Screen name="Cursos" component={CursosStackNavigator} />
      <Tab.Screen name="Escuelas" component={EscuelasScreen} />
      <Tab.Screen name="Localidades" component={LocalidadesScreen} />
    </Tab.Navigator>
  );
}
