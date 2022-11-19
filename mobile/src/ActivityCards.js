import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TextInput, Button } from "react-native";
import { getActivities } from "../storage"

export default function ActivityCards({ navigation }) {
  const [activities, setActivities] = useState([]);
  useEffect(() => {
    const fetchActivities = async () => await getActivities()
    const activities = fetchActivities()
    if (Array.isArray(activities)){
        setActivities(activities)
    }
  }, [])
  return (
    <View style={styles.container}>
      <Text>Your schedule for today!</Text>
      <Text>Activity 1</Text>
      <Text>Activity 2</Text>
      <Text>Activity 3</Text>
      <Text>Activity 4</Text>
      <Text>Activity 5</Text>
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
