import React, { useEffect, useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, TextInput, Touchable, TouchableWithoutFeedback } from "react-native";
import { savePhoneNumber } from "../storage";
import { Input, Icon, Text, Button, Card } from '@rneui/themed';
import PhoneInput from "react-native-phone-number-input";


export default function Signup({ navigation }) {
  const [value, onChangeText] = useState("");

  const submit = async () => {
    await savePhoneNumber(value);
    navigation.navigate("Home");
  };

  const input = React.createRef();
  const phoneInput = React.createRef();

  useEffect(() => {
    input.current.focus()
  }, [])
  return (
    <TouchableWithoutFeedback onPress={() => {input.current.blur()}} accessible={false}>
      <View style={styles.container}>
        <Card containerStyle={{
          marginTop: -200,
          borderColor: "black",
          borderRadius: 20
        }}>
          <Text h3 style={{ textAlign: "center" }}>
            Create Accout
          </Text>
          <Input
            ref={input}
            value={value}
            placeholder="Your Phone Number"
            secureTextEntry={false}
            onChangeText={(text) => onChangeText(text)}
            // value={value}
            editable
            maxLength={10}
            containerStyle={{
              width: 300,
              marginHorizontal: 0,
              marginVertical: 10,
            }}
          />
           {/* <PhoneInput
            ref={phoneInput}
            defaultValue={value}
            defaultCode="DE"
            layout="first"
            onChangeText={(text) => {
              setValue(text);
            }}
            onChangeFormattedText={(text) => {
              setFormattedValue(text);
            }}
            withDarkTheme="true"
            withShadow
            autoFocus
            marginVertical="20"
          /> */}
          <Button
            onPress={submit}
            title="Next"
            disabled={!value}
            
            buttonStyle={{
              backgroundColor: 'black',
              borderWidth: 2,
              borderColor: 'black',
              borderRadius: 30,
            }}
            containerStyle={{
              width: 100,
              marginHorizontal: 0,
              marginVertical: -10,
            }}
            // titleStyle={{ fontWeight: 'bold' }}
            accessibilityLabel="Learn more about this purple button"
          />
        </Card>

        <StatusBar style="auto" />
      </View>
    </TouchableWithoutFeedback>
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
