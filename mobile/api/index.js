import Constants from "expo-constants";
const { manifest } = Constants;

const apiURL =
  typeof manifest.packagerOpts === `object` && manifest.packagerOpts.dev
    ? manifest.debuggerHost.split(`:`).shift().concat(`:5000`)
    : `api.example.com`;
console.log(apiURL)
const generateSchedule = async (activities) => {
  return fetch(`${apiURL}/schedule/generate`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(activities),
  })
    .then((response) => response.json())
    .then((json) => {
      return json.data;
    })
    .catch((error) => {
      console.log(error);
      console.error(error);
    });
};

export { generateSchedule };
