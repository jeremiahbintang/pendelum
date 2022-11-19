import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "./src/HomeScreen";
import Signup from "./src/Signup";

import { getPhoneNumber, deletePhoneNumber } from "./storage";

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
    <NavigationContainer>
      <Stack.Navigator>
        {true ? (
          <>
          <Stack.Screen
            name="Signup"
            component={Signup}
          />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
          />
          </>
        ) : (
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: "Home" }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
