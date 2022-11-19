import React, { useState, useEffect } from "react";
import { Formik } from "formik";
import { StyleSheet, View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  getCalendarList,
  getTodayActivities,
  saveCalendarList,
  saveTodayActivity,
  updateTodayActivity,
  saveChosenCalendar,
} from "../storage";
import { Input, Button, Text, ListItem, Icon } from "@rneui/themed";
import { generateSchedule } from "../api";
import { listCalendarsFromGoogle } from "../google-calendar";
import { Badge } from "@rneui/base";

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
  const [calendars, setCalendars] = useState([]);
  const [isPublishClicked, setIsPublishedClicked] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const calendars = await getCalendarList();
      setCalendars(calendars || []);
    };
    fetch();
  }, []);

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
          <Text h4>Add your activity for today!</Text>
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
                  <View style={styles.row}>
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
                  <View style={styles.row}>
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
          <View style={styles.row}>
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
                setExpanded({
                  ...expanded,
                  [newKey - 1]: false,
                  [newKey]: true,
                });
              }}
            >
              <Icon name="add" color="white" />
            </Button>
            <Button
              containerStyle={{
                marginLeft: 5,
              }}
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
            <Button
              containerStyle={{
                marginLeft: 5,
              }}
              type="solid"
              onPress={async () => {
                const calendars = await listCalendarsFromGoogle();
                await saveCalendarList(calendars);
                setCalendars(calendars);
                setIsPublishedClicked(true)
              }}
            >
              Publish!
            </Button>
          </View>
          <View style={styles.calendars}>
            {isPublishClicked && calendars.length > 0 && (
              <Text>Choose which calendar to update</Text>
            )}
            {isPublishClicked &&
              calendars.map((cal) => (
                <View key={cal.id} style={styles.row}>
                  <Button
                    containerStyle={{
                      marginBottom: 10,
                    }}
                    type="solid"
                    onPress={async () => await saveChosenCalendar(cal)}
                  >
                    {cal.summary}
                    {cal.primary && <Badge value="primary" status="primary" />}
                  </Button>
                </View>
              ))}
          </View>
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
  calendars: {
    flex: 1,
    width: "100%",
    marginTop: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  row: {
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
