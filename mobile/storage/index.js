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


const getPublishStatus = async () => {
  try {
    await getData("is_published")
  } catch (e) {
    console.error(e)
  }
}

const publishTodayActivities = async () => {
  try {
    await storeData("is_published", true)
  } catch (e) {
    console.error(e)
  }
}

const editTodayActivities = async () => {
  try {
    await storeData("is_published", false)
  } catch (e) {
    console.error(e)
  }
}


const saveTodayActivities = async (activities) => {
  try {
    const activitiesString = JSON.stringify(activities);
    await storeData("today_activities", activitiesString);
  } catch (e) {
    // saving error
    console.error(e);
  }
};

const getTodayActivity = async (_id) => {
  try {
    const activities = await getData("today_activities");
    const activitiesJSON = JSON.parse(activities);
    const res = activitiesJSON?.find((val) => val._id === _id)
    
    if (res) {
      return res
    }
    return null;
  } catch (e) {
    // saving error
    console.error(e);
  }
};


const updateTodayActivity = async (_id, activity) => {
  try {
    const activities = await getData("today_activities");
    const activitiesJSON = JSON.parse(activities);
    const index = activitiesJSON?.findIndex((val) => val._id === _id)
    
    if (index) {
      activitiesJSON[index] = activity;
      await saveTodayActivities(activitiesJSON)
    }
    return null;
  } catch (e) {
    // saving error
    console.error(e);
  }
};


const getTodayActivities = async () => {
  try {
    // await AsyncStorage.clear();
    const activities = await getData("today_activities");
    console.log(activities)
    return JSON.parse(activities);
  } catch (e) {
    // saving error
    console.error(e);
  }
};

const saveTodayActivity = async (activity) => {
  try {
    const activities = await getTodayActivities();

    activity._id = uuid.v4();

    if (activities) {
      activities.push(activity);
    } else {
      activities = [activity];
    }
    const activitiesString = await JSON.stringify(activities)
    console.info(`Storing today activity data ${activity.name}`)
    await storeData("today_activities", activitiesString);
    return activity;
  } catch (e) {
    // saving error
    console.error(e);
  }
};

const deleteTodayActivity = async (_id) => {
  try {
    const activities = await getTodayActivities();
    let activitiesJSON = JSON.parse(activities);
    const index = activitiesJSON.findIndex((activity) => activity._id === _id);
    if (index > -1) {
      // only splice array when item is found
      activitiesJSON.splice(index, 1); // 2nd parameter means remove one item only
    }
    await removeData("today_activities");
  } catch (e) {
    // saving error
    console.error(e);
  }
};

export {
  savePhoneNumber,
  getPhoneNumber,
  deletePhoneNumber,
  getTodayActivities,
  updateTodayActivity,
  saveTodayActivity,
  deleteTodayActivity,
  publishTodayActivities,
  editTodayActivities,
  getPublishStatus
};
