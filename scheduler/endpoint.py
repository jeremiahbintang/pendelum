from flask import Flask
from scheduler import Activity, make_activity_objects, create_schedule, extract_uni_activities
from generate_route import generate_route

app = Flask(__name__)

@app.route('/schedule/generate', methods=['POST'])
def get_schedule(request):
     # Get to-do list
    remaining_activities = make_activity_objects(request["data"])

    # Get uni activities
    uni_activities = extract_uni_activities('personal_20221119_172719.ics')

    # Get travel activities
    departure_time = request["departure_time"]
    departure_place = request["departure_place"]
    arrival_time = request["arrival_time"]
    arrival_place = request["arrival_place"]
    departure_route = generate_route(start=departure_place, dest=uni_activities[0].location, time=departure_time, arrival_time=False)
    departure_activity = Activity(name="Departure", start_time=departure_route["start_time"], end_time=departure_route["end_time"])
    arrival_route = generate_route(start=uni_activities[-1].location, dest=arrival_place, time=arrival_time, arrival_time=True)
    arrival_activity = Activity(name="Arrival", start_time=arrival_route["start_time"], end_time=arrival_route["end_time"])
    travel_activities = [departure_activity, arrival_activity]

    # Create schedule
    schedule = create_schedule(remaining_activities, uni_activities, travel_activities)

    return schedule.convert_to_json()
