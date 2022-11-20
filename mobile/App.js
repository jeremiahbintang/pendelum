import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "./src/HomeScreen";
import Signup from "./src/Signup";

import { getPhoneNumber, deletePhoneNumber } from "./storage";

import { ThemeProvider, Button, createTheme } from '@rneui/themed';
const theme = createTheme({
  lightColors: {
    // primary: '#e7e7e8',
    primary:'#0000ff',

  },
  darkColors: {
    primary: '#000',
  },
  mode: 'light',
});

const Stack = createNativeStackNavigator();
export default function App() {
  const [phone_number, setPhoneNumber] = useState();
  useEffect(() => {
    const checkPhoneNumber = async () => {
      // await deletePhoneNumber()
      const phone_number = await getPhoneNumber();
      setPhoneNumber(phone_number);
    };
    checkPhoneNumber();
  }, []);

  return (
    <ThemeProvider theme={theme}>
    <NavigationContainer>
      <Stack.Navigator>
        {phone_number ? (
          <>
          <Stack.Screen
            name="Registration"
            component={Signup}
          />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
          />
          </>
        ) : (
          <Stack.Screen
            name="Pendelum"
            component={HomeScreen}
            options={{ title: "Home" }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
    </ThemeProvider>
  );
}
