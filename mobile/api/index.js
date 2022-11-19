const generateSchedule = async (activities) => {
    return fetch("localhost:3000/schedule/generate", {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(activities)
    })  
    .then((response) => response.json())
    .then((json) => {
      return json.data;
    })
    .catch((error) => {
      console.error(error);
    });
}

export {
    generateSchedule
}