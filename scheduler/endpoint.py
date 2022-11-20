from flask import Flask, request
from flask_cors import CORS
from datetime import datetime
from scheduler.scheduler import Activity, make_activity_objects, create_schedule, extract_uni_activities
from scheduler.generate_route import generate_route

app = Flask(__name__)
CORS(app)

@app.route('/schedule/generate', methods=['POST'])
def get_schedule():
    json = request.get_json()
    activities = json.get('activities')
    print(json)
     # Get to-do list
    todo_activities = make_activity_objects(activities)

    # Get uni activities
    uni_activities = extract_uni_activities('personal_20221119_172719.ics')

    # Get travel activities
    departure_time = json["departure_time"]
    if departure_time:
        departure_time = datetime.strptime(departure_time, "%Y-%m-%d %H:%M:%S")

    departure_place = json["departure_place"]
    arrival_time = json["arrival_time"]
    if arrival_time:
        arrival_time = datetime.strptime(arrival_time, "%Y-%m-%d %H:%M:%S")
    arrival_place = json["arrival_place"]

    # Create schedule
    schedule = create_schedule(todo_activities, uni_activities, start_station=departure_place, end_station=arrival_place, departure_time=departure_time, arrival_time=arrival_time)
    schedule.print_schedule()

    return schedule.convert_to_json()

if __name__ == "__main__":
    app.run(debug=True)