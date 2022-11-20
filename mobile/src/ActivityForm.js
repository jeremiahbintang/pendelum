import React, { useState, useEffect, useRef } from "react";
import moment from "moment";
import { Formik } from "formik";
import {
  StyleSheet,
  Dimensions,
  View,
  SafeAreaView,
  ScrollView,
  StatusBar,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import DateTimePicker from "@react-native-community/datetimepicker";
// import DatePicker from 'react-native-date-picker'
import {
  getCalendarList,
  getTodayActivities,
  saveCalendarList,
  saveTodayActivity,
  updateTodayActivity,
  saveChosenCalendar,
} from "../storage";
import { Input, Button, Text, ListItem, Icon, Card } from "@rneui/themed";
import { generateSchedule } from "../api";
import {
  insertEventToGoogleCalendar,
  listCalendarsFromGoogle,
} from "../google-calendar";
import { Badge } from "@rneui/base";

export default function ActivityCards({ navigation }) {
  // const [date, setDate] = useState(new Date())
  // const [open, setOpen] = useState(false)
  // const [date, setDate] = useState(new Date())
  // const [expanded, setExpanded] = useState({ 0: false });
  const mapRef = useRef();
  const [location, setLocation] = useState({
    latitude: 48.2627156,
    longitude: 11.6683011,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [errorMsg, setErrorMsg] = useState(null);
  const [expanded, setExpanded] = useState({ 0: true });
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
  const [mapMarker, setMapMarker] = useState(null);

  const publishEventsToGoogleCalendar = async (calendarId) => {
    if (Object.keys(activities).length > 0) {
      const google_event_objects = Object.values(activities).map((activity) => {
        return {
          start: { dateTime: activity.start_time },
          end: { dateTime: activity.end_time },
          endTimeUnspecified: !activity.end_time,
          summary: activity.name,
          location: activity.location,
        };
      });

      await Promise.all(
        google_event_objects.map((event) =>
          insertEventToGoogleCalendar(calendarId, event)
        )
      );
    }
  };

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
      if (activities) {
        const formValues = { ...activities };
        setActivities(formValues);
      }
    };
    fetch();
  }, [runFetch]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        ...location,
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    })();
  }, []);

  useEffect(() => {
    console.log(mapMarker);
  }, [mapMarker]);
  return (
    <ScrollView
      style={styles.scrollView}
      automaticallyAdjustContentInsets={true}
      automaticallyAdjustKeyboardInsets={true}
    >
      <Formik initialValues={activities} enableReinitialize>
        {({ handleChange, setValues, setFieldValue, values }) => (
          <View>
            <Text h4>Add your activity for today</Text>
            <View style={styles.row}>
              <Button
                type="solid"
                buttonStyle={{
                  backgroundColor: "black",
                  borderWidth: 2,
                  borderColor: "black",
                  borderRadius: 30,
                  marginVertical: 5,
                }}
                onPress={() => {
                  const newKey = Object.keys(values).length;
                  setValues({
                    ...values,
                    [newKey]: {
                      start_time: new Date(),
                      end_time: new Date(),
                      duration: null,
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
                buttonStyle={{
                  backgroundColor: "black",
                  borderWidth: 2,
                  borderColor: "black",
                  borderRadius: 30,
                  marginVertical: 5,
                }}
                onPress={() => {
                  const payload = Object.values(values).map((value) => ({
                    ...value,
                    start_time: moment(value.start_time).format(
                      "YYYY-M-D H:mm:s"
                    ),
                    end_time: moment(value.end_time).format("YYYY-M-D H:mm:s"),
                  }));
                  const generatedSchedule = generateSchedule(payload);
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
                buttonStyle={{
                  backgroundColor: "black",
                  borderWidth: 2,
                  borderColor: "black",
                  borderRadius: 30,
                  marginVertical: 5,
                }}
                onPress={async () => {
                  const calendars = await listCalendarsFromGoogle();
                  await saveCalendarList(calendars);
                  setCalendars(calendars);
                  setIsPublishedClicked(true);
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
                    <MapView
                      ref={mapRef}
                      style={styles.map}
                      showsUserLocation
                      followsUserLocation
                      onPoiClick={
                        ({
                          nativeEvent: {
                            coordinate: { latitude, longitude },
                            name,
                            placeId,
                          },
                        }) => {
                          setMapMarker({
                            latitude,
                            longitude,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                          });
                          setFieldValue(`${key}.location`, name);
                        }
                        // setFieldValue(`${key}.location`, {
                        //   name, latitude, longitude, placeId
                        // })}
                      }
                      onMarkerPress={(e) => {
                        console.log(e);
                      }}
                      onPress={
                        async ({
                          nativeEvent: {
                            coordinate: { latitude, longitude },
                          },
                        }) => {
                          setMapMarker({
                            latitude,
                            longitude,
                            latitudeDelta: 0.01,
                            longitudeDelta: 0.01,
                          });
                          const address =
                            await mapRef.current?.addressForCoordinate({
                              latitude,
                              longitude,
                            });
                          setFieldValue(
                            `${key}.location`,
                            address.subThoroughfare
                              ? address.thoroughfare +
                                  " " +
                                  address.subThoroughfare
                              : address.thoroughfare
                          );
                        }

                        // setFieldValue(`${key}.location`, {
                        //   name: address.subThoroughfare ? address.thoroughfare + " " + address.subThoroughfare : address.thoroughfare, latitude, longitude
                        // })}
                      }
                      initialRegion={location}
                    >
                      {mapMarker && <Marker coordinate={mapMarker} />}
                    </MapView>
                    <Input
                      placeholder="Pin your location on the map"
                      onChangeText={handleChange(`${key}.location`)}
                      value={value.location}
                      editable={false}
                      disabled={true}
                    />
                    <View style={styles.row}>
                      <Input
                        placeholder="Input start time"
                        editable={false}
                        value={new Date(value.start_time).toLocaleTimeString()}
                      />
                      <Button
                        onPress={() => {
                          setShowStartTimeDatePicker({
                            ...showStartTimeDatePicker,
                            [key]: !showStartTimeDatePicker[key],
                          });
                        }}
                      >
                        Input
                      </Button>
                    </View>
                    {showStartTimeDatePicker[key] && (
                      <DateTimePicker
                        mode="time"
                        value={new Date(value.start_time)}
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
                        value={new Date(value.end_time).toLocaleTimeString()}
                      />
                      <Button
                        onPress={() => {
                          setShowEndTimeDatePicker({
                            ...showEndTimeDatePicker,
                            [key]: !showEndTimeDatePicker[key],
                          });
                        }}
                      >
                        Input
                      </Button>
                    </View>
                    {showEndTimeDatePicker[key] && (
                      <DateTimePicker
                        mode="time"
                        value={new Date(value.end_time)}
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
                      /*style={styles.button}*/
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
            <View style={styles.calendars}>
              {isPublishClicked && calendars?.length > 0 && (
                <Text>Choose which calendar to update</Text>
              )}
              {isPublishClicked &&
                calendars?.map((cal) => (
                  <View key={cal.id} style={styles.row}>
                    <Button
                      containerStyle={{
                        marginBottom: 10,
                      }}
                      type="solid"
                      onPress={async () => {
                        await saveChosenCalendar(cal);
                        publishEventsToGoogleCalendar(cal.id);
                      }}
                    >
                      {cal.summary}
                      {cal.primary && (
                        <Badge value="primary" status="primary" />
                      )}
                    </Button>
                  </View>
                ))}
            </View>
          </View>
        )}
      </Formik>
    </ScrollView>
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
    width: 50,
    height: 50,
    fontSize: 10,
  },
  map: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height / 3,
  },
});
