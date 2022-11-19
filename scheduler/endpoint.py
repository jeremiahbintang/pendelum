from flask import Flask
from scheduler import make_activity_objects, create_schedule

app = Flask(__name__)

@app.route('/schedule/generate', methods=['POST'])
def get_schedule(request):
    activities = make_activity_objects(request["data"]) # Get to-do list
    activities.sort(key=lambda x: x.start_time)
    departure_time = request["departure_time"]
    departure_place = request["departure_place"]
    arrival_time = request["arrival_time"]
    arrival_place = request["arrival_place"]
    departure_route = get_route(departure_place, activities, time=departure_time, arrival_time=False)
    arrival_route = get_route(..., arrival_place, time=arrival_time, arrival_time=True)

    return create_schedule(activities).convert_to_json
