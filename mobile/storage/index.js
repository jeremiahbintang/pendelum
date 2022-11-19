import AsyncStorage from "@react-native-async-storage/async-storage";
import uuid from "react-native-uuid";
const storeData = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (e) {
    // saving error
    console.error(e);
  }
};

const getData = async (key) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value;
  } catch (e) {
    // error reading value
    console.error(e);
  }
};

const removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (e) {
    // remove error
    console.error(e);
  }
};

const savePhoneNumber = async (phone_number) => {
  try {
    await storeData("phone_number", phone_number);
  } catch (e) {
    // saving error
    console.error(e);
  }
};

const getPhoneNumber = async () => {
  try {
    const phone_number = await getData("phone_number");
    return phone_number;
  } catch (e) {
    // saving error
    console.error(e);
  }
};

const deletePhoneNumber = async () => {
  try {
    await removeData("phone_number");
  } catch (e) {
    // saving error
    console.error(e);
  }
};

const getActivities = async () => {
  try {
    const activities = await getData("activities");
    
    return activities;
  } catch (e) {
    // saving error
    console.error(e);
  }
};

const saveActivity = async (activity) => {
  try {
    const activities = await getActivities();
    let activitiesJSON = JSON.parse(activities);

    let activityJSON = JSON.stringify(activity);
    activityJSON._id = uuid.v4();

    if (activitiesJSON) {
      activitiesJSON.push(activityJSON);
    } else {
      activityJSON = [activityJSON];
    }
    await storeData("activities", activitiesJSON);
  } catch (e) {
    // saving error
    console.error(e);
  }
};

const deleteActivity = async (_id) => {
  try {
    const activities = await getActivities();
    let activitiesJSON = JSON.parse(activities);
    const index = activitiesJSON.findIndex((activity) => activity._id === _id);
    if (index > -1) {
      // only splice array when item is found
      activitiesJSON.splice(index, 1); // 2nd parameter means remove one item only
    }
    await removeData("activities");
  } catch (e) {
    // saving error
    console.error(e);
  }
};

export {
  savePhoneNumber,
  getPhoneNumber,
  deletePhoneNumber,
  getActivities,
  saveActivity,
  deleteActivity,
};
