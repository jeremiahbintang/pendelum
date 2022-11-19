import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import ActivityCards from "./ActivityCards";
import ActivityForm from "./ActivityForm";
import { Input, Text } from "@rneui/themed";
import { getPublishStatus } from "../storage";

export default function HomeScreen({ navigation }) {
  const [homeAddress, setHomeAddress] = useState("");
  const [isPublished, setIsPublished] = useState(false);

  useEffect(() => {
    const fetchPublishStatus = async () => {
      const isPublished = await getPublishStatus();
      setIsPublished(isPublished);
    };
    fetchPublishStatus();
  });
  return (
    <View style={styles.container}>
      <Text h2>Welcome to home!</Text>
      <Input placeholder={"Type you home address here"} value={homeAddress} onChange={setHomeAddress} />
      {isPublished ? <ActivityCards /> : <ActivityForm />}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "flex-start",
  },
});
