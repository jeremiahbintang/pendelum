import React, { useState, useEffect } from "react";
import { Formik } from "formik";
import { StyleSheet, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  getTodayActivities,
  saveTodayActivity,
  updateTodayActivity,
} from "../storage";
import { Input, Button, Text, ListItem, Icon } from "@rneui/themed";
import { generateSchedule } from "../api";

export default function ActivityCards({ navigation }) {
  const [expanded, setExpanded] = useState({ 0: false });
  const [showStartTimeDatePicker, setShowStartTimeDatePicker] = useState({
    0: false,
  });
  const [showEndTimeDatePicker, setShowEndTimeDatePicker] = useState({
    0: false,
  });
  const [runFetch, setRunFetch] = useState(0);
  const [activities, setActivities] = useState({
    0: {
      start_time: new Date(),
      end_time: new Date(),
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
      {({ handleChange, setValues, setFieldValue, values }) => (
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
                    placeholder="Input location"
                    onChangeText={handleChange(`${key}.location`)}
                    value={value.location}
                  />
                  <View style={styles.timePicker}>
                    <Input
                      placeholder="Input start time"
                      editable={false}
                      value={value.start_time.toLocaleTimeString()}
                    />
                    <Button
                      onPress={() =>
                        setShowStartTimeDatePicker({
                          ...showStartTimeDatePicker,
                          [key]: !showStartTimeDatePicker[key],
                        })
                      }
                    >
                      Input
                    </Button>
                  </View>

                  {showStartTimeDatePicker[key] && (
                    <DateTimePicker
                      mode="time"
                      value={value.start_time}
                      onChange={(event, time) => {
                        setShowStartTimeDatePicker({
                          ...showStartTimeDatePicker,
                          [key]: !showStartTimeDatePicker[key],
                        });
                        setFieldValue(`${key}.start_time`, time);
                        console.info(time);
                      }}
                    />
                  )}
                  <View style={styles.timePicker}>
                    <Input
                      placeholder="Input end time"
                      editable={false}
                      value={value.end_time.toLocaleTimeString()}
                    />
                    <Button
                      onPress={() =>
                        setShowEndTimeDatePicker({
                          ...showEndTimeDatePicker,
                          [key]: !showEndTimeDatePicker[key],
                        })
                      }
                    >
                      Input
                    </Button>
                  </View>
                  {showEndTimeDatePicker[key] && (
                    <DateTimePicker
                      mode="time"
                      value={value.end_time}
                      onChange={(event, time) => {
                        setShowEndTimeDatePicker({
                          ...showEndTimeDatePicker,
                          [key]: !showEndTimeDatePicker[key],
                        });
                        setFieldValue(`${key}.end_time`, time);
                        console.info(value.end_time);
                      }}
                    />
                  )}
                  <Input
                    keyboardType="numeric"
                    placeholder="Input duration (minutes)"
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
                      setRunFetch(runFetch + 1);
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
              setValues({
                ...values,
                [newKey]: {
                  start_time: new Date(),
                  end_time: new Date(),
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
          <Button
            type="solid"
            onPress={async () => {
              const generatedSchedule = await generateSchedule({
                data: Object.values(values),
              });
              console.log(generatedSchedule);
            }}
          >
            Schedule it for me!
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
  timePicker: {
    flexDirection: "row",
    // width:"100%",
    // alignItems: "center",
    // justifyContent: "center",
  },
  button: {
    width: "50px",
    height: "50px",
    fontSize: "10px",
  },
});
