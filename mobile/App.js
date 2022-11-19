import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./src/HomeScreen";
import Signup from "./src/Signup";

const Stack = createNativeStackNavigator();
export default function App() {
  const [value, onChangeText] = React.useState("Useless Multiline Placeholder");
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: "Home" }}
        />
        <Stack.Screen
          name="Signup"
          component={Signup}
          options={{ title: "Signup" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
