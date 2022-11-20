import React, { useState, useEffect } from "react";
import { Formik } from "formik";
import { StyleSheet, View, SafeAreaView, ScrollView, StatusBar } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
// import DatePicker from 'react-native-date-picker'
import {
  getTodayActivities,
  saveTodayActivity,
  updateTodayActivity,
} from "../storage";
import { Input, Button, Text, ListItem, Icon, Card } from "@rneui/themed";
import { generateSchedule } from "../api";

export default function ActivityCards({ navigation }) {
  // const [date, setDate] = useState(new Date())
  // const [open, setOpen] = useState(false)
  const [date, setDate] = useState(new Date())
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
    // <SafeAreaView style={styles.container}>
    <ScrollView
      style={styles.scrollView}
      automaticallyAdjustContentInsets={true}
      automaticallyAdjustKeyboardInsets={true}
    >
      <Formik initialValues={activities} enableReinitialize>
        {({ handleChange, setValues, setFieldValue, values }) => (
          <View>
            
            <Text h4>
              Add your activity for today
            </Text>
            <View style={styles.row} marginVertical={5}>
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
                buttonStyle={{
                  backgroundColor: 'black',
                  borderWidth: 2,
                  borderColor: 'black',
                  borderRadius: 30,
                  marginVertical: 5,
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
                  // const generatedSchedule = await generateSchedule({
                  //   data: Object.values(values),
                  // });
                  // console.log(generatedSchedule);
                }}
                buttonStyle={{
                  backgroundColor: 'black',
                  borderWidth: 2,
                  borderColor: 'black',
                  borderRadius: 30,
                  marginVertical: 5,
                }}
              >
                Schedule it for me!
              </Button>
              <Button
                containerStyle={{
                  marginLeft: 5,
                }}
                type="solid"
                buttonStyle={{
                  backgroundColor: 'black',
                  borderWidth: 2,
                  borderColor: 'black',
                  borderRadius: 30,
                  marginVertical: 5,
                }}
              >
                Publish!
              </Button>
            </View>
            {Object.entries(values).map(([key, value]) => (
            <ListItem.Accordion
              key={key}
              content={<Text h3>{value.name || "Activity"}</Text>}
              isExpanded={expanded[key]}
              onPress={() => {
                setExpanded({ ...expanded, [key]: !expanded[key] });
              }}
              borderWidth={1}
              borderRadius={2}
            >
                <ListItem borderWidth={1} borderRadius={0}>
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
                      <Button onPress={() => setOpen(true)}>
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
                      <Button onPress={() => setOpen(true)}>
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
                      Save
                    </Button>
                  </ListItem.Content>
                </ListItem>
            </ListItem.Accordion>
          ))}
          </View>
        )}
      </Formik>
    </ScrollView>
    // </SafeAreaView>
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
