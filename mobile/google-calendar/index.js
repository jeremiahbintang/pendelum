import { getGoogleAuthorisation } from "../storage";

const listCalendarsFromGoogle = async () => {
  const auth = await getGoogleAuthorisation();
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/users/me/calendarList?access_token=${auth.authentication.accessToken}`,
    {
      method: "GET",
      headers: new Headers({
        Authorization: `Bearer ${auth.authentication.accessToken}`,
      }),
    }
  )
    .then(function (res) {
      return res.json();
    })
    .then(function (res) {
      return res.items;
    });
  return response;
};

const insertEventToGoogleCalendar = async (_id, data) => {
  const auth = await getGoogleAuthorisation();
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${_id}/events?access_token=${auth.authentication.accessToken}`,
    {
      method: "POST",
      headers: new Headers({
        Authorization: `Bearer ${auth.authentication.accessToken}`,
      }),
      body: JSON.stringify(data),
    }
  )
    .then((res) => res.json())
    .catch((err) => console.err(err));
  console.info("Insert event to cal... ", response);
  return response;
};

export { listCalendarsFromGoogle, insertEventToGoogleCalendar };
