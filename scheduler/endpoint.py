from flask import Flask
from scheduler.scheduler import Activity, make_activity_objects, create_schedule, extract_uni_activities
from scheduler.generate_route import generate_route

app = Flask(__name__)

@app.route('/schedule/generate', methods=['POST'])
def get_schedule(request):
     # Get to-do list
    todo_activities = make_activity_objects(request["data"])

    # Get uni activities
    uni_activities = extract_uni_activities('personal_20221119_172719.ics')

    # Get travel activities
    departure_place = request["departure_place"]
    arrival_time = request["arrival_time"]
    arrival_place = request["arrival_place"]

    # Create schedule
    schedule = create_schedule(todo_activities, uni_activities, start_station=departure_place, end_station=arrival_place, arrival_time=arrival_time)
    schedule.print_schedule()

    return schedule.convert_to_json()
