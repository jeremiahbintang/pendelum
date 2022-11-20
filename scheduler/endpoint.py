from flask import Flask, request
import json
from flask_cors import CORS
from datetime import datetime
from scheduler.scheduler import Activity, make_activity_objects, create_schedule, extract_uni_activities
from scheduler.generate_route import generate_route

app = Flask(__name__)
CORS(app)

@app.route('/schedule/generate', methods=['POST'])
def get_schedule():
    json_data = request.get_json()
    activities = json_data.get('activities')
    print(json_data)
     # Get to-do list
    todo_activities = make_activity_objects(activities)

    # Get uni activities
    uni_activities = extract_uni_activities('personal_20221119_172719.ics')

    # Get travel activities
    departure_time = json_data["departure_time"]
    if departure_time:
        departure_time = datetime.strptime(departure_time, "%Y-%m-%d %H:%M:%S")

    departure_place = json_data["departure_place"]
    arrival_time = json_data["arrival_time"]
    if arrival_time:
        arrival_time = datetime.strptime(arrival_time, "%Y-%m-%d %H:%M:%S")
    arrival_place = json_data["arrival_place"]

    # Create schedule
    schedule = create_schedule(todo_activities, uni_activities, start_station=departure_place, end_station=arrival_place, arrival_time=arrival_time)
    schedule.print_schedule()
    print(json.dumps(schedule.convert_to_json()))
    return json.dumps(schedule.convert_to_json())

if __name__ == "__main__":
    app.run(debug=True)