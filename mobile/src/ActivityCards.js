import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TextInput, Button } from "react-native";
import { getTodayActivities } from "../storage"

export default function ActivityCards({ navigation }) {
  const [activities, setActivities] = useState([]);
  useEffect(() => {
    const fetchActivities = async () => await getTodayActivities()
    const activities = fetchActivities()
    if (Array.isArray(activities)){
        setActivities(activities)
    }
  }, [])
  return (
    <View style={styles.container}>
      <Text>Your schedule for today!</Text>
      {activities.map((activity)=> <Text>{activity.name}</Text>)}
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
