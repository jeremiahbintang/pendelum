import React, {useEffect} from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TextInput, Button } from "react-native";
import { getPhoneNumber, savePhoneNumber } from "../storage";

export default function Signup({ navigation }) {
  const [value, onChangeText] = React.useState("123456");

  useEffect(() => {
    const checkPhoneNumber = async () => {
      // await deletePhoneNumber()
      const phone_number = await getPhoneNumber();
      setPhoneNumber(phone_number);
    };
    checkPhoneNumber();
  }, []);

  const submit = async () => {
    await savePhoneNumber(value);
    navigation.navigate("Home");
  };
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
        onPress={submit}
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
