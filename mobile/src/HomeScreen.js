import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TextInput, Button } from "react-native";
import ActivityCards from "./ActivityCards";
export default function HomeScreen({ navigation }) {
  const [homeAddress, setHomeAddress] = useState("Type you home address here");

  return (
    <View style={styles.container}>
      <Text>Welcome to home!</Text>
      <TextInput value={homeAddress} onChange={setHomeAddress} />
      <ActivityCards />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
