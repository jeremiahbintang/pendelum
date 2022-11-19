import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { StyleSheet, Text, View, TextInput, Button } from "react-native";

export default function Signup({ navigation }) {
  const [value, onChangeText] = React.useState("Useless Multiline Placeholder");
  return (
    <View style={styles.container}>
      <Text>Register by signing up through with your phone number!</Text>
      <TextInput
        onChangeText={(text) => onChangeText(text)}
        value={value}
        editable
        maxLength={40}
      />
      <Button
        onPress={() => navigation.navigate('Home')}
        title="Go to Home"
        color="#841584"
        accessibilityLabel="Learn more about this purple button"
      />

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
