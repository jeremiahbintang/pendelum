import React, { useState, useEffect } from "react";
import { Formik } from "formik";
import { StyleSheet, View } from "react-native";
import {
  getTodayActivities,
  saveTodayActivity,
  updateTodayActivity,
} from "../storage";
import { Input, Button, Text, ListItem, Icon } from "@rneui/themed";

export default function ActivityCards({ navigation }) {
  const [expanded, setExpanded] = useState({ 0: false });
  const [runFetch, setRunFetch] = useState(0);
  const [activities, setActivities] = useState({
    0: {
      start_time: "",
      end_time: "",
      duration: "",
      name: "",
      location: "",
    },
  });
  useEffect(() => {
    const fetch = async () => {
      const activities = await getTodayActivities();
      const formValues = { ...activities };
      setActivities(formValues);
    };
    fetch();
  }, [runFetch]);
  return (
    <Formik initialValues={activities} enableReinitialize>
      {({ handleChange, setValues, values }) => (
        <View>
          <Text h4>Add your schedule for today!</Text>
          {Object.entries(values).map(([key, value]) => (
            <ListItem.Accordion
              key={key}
              content={<Text h3>{value.name || "Activity"}</Text>}
              isExpanded={expanded[key]}
              onPress={() => {
                setExpanded({ ...expanded, [key]: !expanded[key] });
              }}
            >
              <ListItem>
                <ListItem.Content bottomDivider>
                  <Input
                    placeholder="Input name of activity"
                    onChangeText={handleChange(`${key}.name`)}
                    value={value.name}
                  />
                  <Input
                    placeholder="Input location of activity"
                    onChangeText={handleChange(`${key}.location`)}
                    value={value.location}
                  />
                  <Input
                    placeholder="Input start time of activity"
                    onChangeText={handleChange(`${key}.start_time`)}
                    value={value.start_time}
                  />
                  <Input
                    placeholder="Input end time of activity"
                    onChangeText={handleChange(`${key}.end_time`)}
                    value={value.end_time}
                  />
                  <Input
                    placeholder="Input duration of activity (minutes)"
                    onChangeText={handleChange(`${key}.duration`)}
                    value={value.duration}
                  />
                  <Button
                    style={styles.button}
                    onPress={async () => {
                      if (value._id) {
                        await updateTodayActivity(value._id, value);
                      } else {
                        await saveTodayActivity(value);
                      }
                      setRunFetch(runFetch+1)
                    }}
                  >
                    Add
                  </Button>
                </ListItem.Content>
              </ListItem>
            </ListItem.Accordion>
          ))}
          <Button
            type="solid"
            onPress={() => {
              const newKey = Object.keys(values).length;
              console.log(newKey);
              setValues({
                ...values,
                [newKey]: {
                  start_time: "",
                  end_time: "",
                  duration: "",
                  name: "",
                  location: "",
                },
              });
              setExpanded({ ...expanded, [newKey - 1]: false, [newKey]: true });
            }}
          >
            <Icon name="add" color="white" />
          </Button>
        </View>
      )}
    </Formik>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    width: "50px",
    height: "50px",
    fontSize: "10px",
  },
});
