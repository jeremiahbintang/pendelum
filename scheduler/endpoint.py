from flask import Flask
from scheduler import make_activity_objects, create_schedule

app = Flask(__name__)

@app.route('/schedule/generate', methods=['POST'])
def get_schedule(request):
    activities = make_activity_objects(request["data"])
    return create_schedule(activities).convert_to_json
