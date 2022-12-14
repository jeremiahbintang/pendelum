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
import { Platform } from "react-native";
if (Platform.OS === "ios") {
  const platform_os = "ios";
  // do something for ios
} else if (Platform.OS === "android") {
  const platform_os = "droid";
  // other thing for android
} else if (Platform.OS === "web") {
  const platform_os = "web";
} else {
  // you probably won't end up here unless you support another platform!
}

export default function ActivityCards({ navigation, homeAddress }) {
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
  const [generatedSchedule, setGeneratedSchedule] = useState(null);

  const publishEventsToGoogleCalendar = async (calendarId) => {
    if (generatedSchedule.length > 0) {
      console.log(generatedSchedule)
      const google_event_objects = generatedSchedule.map((activity) => {
        return {
          start: { dateTime: moment(activity.start_time, "YYYY-M-D H:mm:s").toDate() },
          end: { dateTime: moment(activity.end_time, "YYYY-M-D H:mm:s").toDate() },
          endTimeUnspecified: !activity.end_time,
          summary: activity.name,
          location: Array.isArray(activity.location) ? `${activity.location[0] || activity.location[1]} - ${activity.location[activity.location.length -1] || activity.location[activity.location.length -2]}` : activity.location,
        };
      });

      for (let i = 0; i < Math.ceil(google_event_objects.length / 3); i++) {
        console.log("helloo...", google_event_objects.slice(i * 3,(i+1)*3))
        await Promise.all(
            google_event_objects.slice(i * 3,(i+1)*3).map((event) =>
              insertEventToGoogleCalendar(calendarId, event)
            )
          );
          await new Promise(r => setTimeout(r, 1000));
      }
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
      console.log(activities);
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
                buttonStyle={{
                  backgroundColor: "black",
                  borderWidth: 2,
                  borderColor: "black",
                  borderRadius: 30,
                  marginVertical: 5,
                }}
                onPress={async () => {
                  const payload = Object.values(values).map((value) => ({
                    ...value,
                    start_time: moment(value.start_time).format(
                      "YYYY-M-D H:mm:s"
                    ),
                    end_time: moment(value.end_time).format("YYYY-M-D H:mm:s"),
                  }));
                  const generatedSchedule = await generateSchedule(payload, homeAddress);
                  setGeneratedSchedule(generatedSchedule);
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
            {isPublishClicked && (
              <View style={styles.calendars}>
                {calendars?.length > 0 && (
                  <Text>Choose which calendar to update</Text>
                )}

                {calendars?.map((cal) => (
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
            )}
            {generatedSchedule?.map(
              ({ name, start_time, end_time, location, travel_plan }, i) => (
                <React.Fragment key={i}>
                  <Text h3>
                    {i + 1}. {name}
                  </Text>
                  <View style={styles.row}>
                    <Text>{start_time} - {end_time}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text>{Array.isArray(location) ? `${location[0] || location[1]} - ${location[location.length -1] || location[location.length -2]}` : location}</Text>
                  </View>
                  {travel_plan?.plan.map((track, i) =>
                  <View key={i}>
                    
                    <Text>{track.model} {track.station_line && `- ${track.station_line}`} {track.platform && `- Gleis ${track.platform}`}</Text>
                    <Text>{track.start_station && `- ${track.start_station} -`} {track.end_station}</Text>
                    <Text>{track.departure} - {track.arrival}</Text>
                    <Text>--------------------------------------------------------------------------</Text>
                    </View>)}
                </React.Fragment>
              )
            )}
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
                      <View
                        style={{
                          position: "absolute",
                          right: 10,
                          bottom: 30,
                          alignSelf: "flex-end",
                        }}
                      >
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
                      <View
                        style={{
                          position: "absolute",
                          right: 10,
                          bottom: 30,
                          alignSelf: "flex-end",
                        }}
                      >
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
                        console.info(value);
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
