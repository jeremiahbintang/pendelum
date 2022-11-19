import React, {useEffect, useState} from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TextInput, Button } from "react-native";
import { savePhoneNumber } from "../storage";
import { Input, Icon } from '@rneui/themed';

export default function Signup({ navigation }) {
  const [value, onChangeText] = useState("123456");

  const submit = async () => {
    await savePhoneNumber(value);
    navigation.navigate("Home");
  };

  const input = React.createRef();

  useEffect(() => {
    input.current.focus()
  }, [])
  return (
    <View style={styles.container}>
      <Text>Register by signing up through with your phone number!</Text>
      <TextInput
        onChangeText={(text) => onChangeText(text)}
        value={value}
        editable
        maxLength={40}
      />
      <Input
        ref={input}
        placeholder="Phone Number" secureTextEntry={false}
      />
      <Button
        onPress={submit}
        title="Signup"
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

function focusTextInput() {
  // Explicitly focus the text input using the raw DOM API
  // Note: we're accessing "current" to get the DOM node
  this.textInput.current.focus();
}
