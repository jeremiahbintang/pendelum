import moment from "moment";
const generateSchedule = async (activities,homeAddress) => {
  const departure_time = moment().set('hour', 8).set('minute', 0).set('second', 0).format('YYYY-M-D H:mm:s')
  const arrival_time = moment().set('hour', 21).set('minute', 0).set('second', 0).format('YYYY-M-D H:mm:s')
  console.log(departure_time, arrival_time)
  return fetch(`https://e56c-2a09-80c0-192-0-b0e-6672-a275-7b01.eu.ngrok.io/schedule/generate`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      activities,
      departure_time,
      departure_place: homeAddress,
      arrival_time: arrival_time,
      arrival_place: homeAddress
    }),
  })
    .then((response) => {
      console.log(response)
      return response.json()})
    .then((json) => {
      console.log(json)
      return json;
    })
    .catch((error) => {
      console.log(error);
      console.error(error);
    });
};

export { generateSchedule };
