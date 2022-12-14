from datetime import datetime, timedelta
import math
from icalendar import Calendar, Event, vCalAddress, vText
from scheduler.generate_route import generate_route
from pathlib import Path
import os
import pytz

class TravelPlan:
    def __init__(self, model, station_line, platform, start_station, end_station, departures, arrivals):
        self.model = model
        self.station_line = station_line
        self.platform = platform
        self.start_station = start_station
        self.end_station = end_station
        self.departures = departures
        self.arrivals = arrivals
    
    def print_plan(self):
        print("Start station:", self.start_station)
        for i in range(len(self.model)):
            print('('+self.model[i]+')', self.station_line[i], "-", self.platform[i], "(", self.departures[i], "-", self.arrivals[i], ")")
        print("End station:", self.end_station)
    
    def convert_to_json(self):
        travel_plan = {"plan": []}
        for i in range(len(self.model)):
            travel_plan["plan"].append({"model": self.model[i], "station_line": self.station_line[i],
                                        "platform": self.platform[i],
                                       "start_station": self.start_station[i],
                                        "end_station": self.end_station[i],
                                        "departure": self.departures[i].strftime("%Y-%m-%d %H:%M:%S"),
                                       "arrival": self.arrivals[i].strftime("%Y-%m-%d %H:%M:%S")})
        return travel_plan

class Activity:
    def __init__(self, name=None, start_time=None, end_time=None, duration=None, location=None, priority=None, travel_plan=None):
        self.name = name
        if (start_time == None) and (end_time != None):
            self.start_time = end_time - duration
        else:
            self.start_time = start_time
        if (end_time == None) and (start_time != None):
            self.end_time = start_time + duration
        else:
            self.end_time = end_time
        if (duration == None) and (start_time != None) and (end_time != None):
            self.duration = end_time - start_time
        else:
            self.duration = duration
        self.location = location
        self.priority = priority
        self.travel_plan = travel_plan

class EmptySlot:
    def __init__(self, start_time, end_time, prev_activity, next_activity):
        self.start_time = start_time
        self.end_time = end_time
        self.prev_activity = prev_activity
        self.next_activity = next_activity

class Schedule:
    def __init__(self, start_station, end_station, latest_arrival):
        self.activities = []
        self.start_station = start_station
        self.end_station = end_station
        self.latest_arrival = latest_arrival
    
    def add_activity(self, activity):
        self.activities.append(activity)
        self._sort_based_on_start_time()

    def _sort_based_on_start_time(self):
        self.activities.sort(key=lambda x: x.start_time)
    
    def find_empty_slots(self):  
        empty_slots = []
        self._sort_based_on_start_time()
        
        for i in range(len(self.activities)-1):
            prev_act = self.activities[i]
            next_act = self.activities[i+1]
            a = None
            b = None
            if prev_act.travel_plan == None:
                a = prev_act.end_time
            else:
                a = prev_act.travel_plan.arrivals[-1]

            b = next_act.start_time
            
            if b < a:
                b = a
                
            duration = (b - a).seconds
            if duration < 0:
                duration = 0
                
            if duration > 0:
                empty_slots.append(EmptySlot(start_time=a, end_time=b, prev_activity=prev_act, next_activity=next_act))
        
        empty_slots.append(EmptySlot(start_time=self.activities[-1].end_time, end_time=self.latest_arrival, prev_activity=self.activities[-1], next_activity=Activity(location=self.end_station, start_time=self.latest_arrival, end_time=self.latest_arrival.replace(hour=23,minute=59,second=59,microsecond=0))))
        return empty_slots
    
    def print_schedule(self):
        for act in self.activities:
            print(act.start_time, "-", act.end_time, ":", act.name)
            if act.travel_plan != None:
                print("--- Travel plan ---")
                act.travel_plan.print_plan()
            print("")
    
    def convert_to_json(self):
        output = []
        for act in self.activities:
            act_json = {"name": act.name, "start_time": act.start_time.strftime("%Y-%m-%d %H:%M:%S")
, "end_time": act.end_time.strftime("%Y-%m-%d %H:%M:%S"),
                           "duration": act.duration.seconds // 60, "location": act.location}
            if act.travel_plan != None:
                act_json["travel_plan"] = act.travel_plan.convert_to_json()
            output.append(act_json)
        return output

def make_activity_objects(activities):
    processed_activities = []
    for act in activities:
        name = None
        print(act.get("name"))
        if act.get("name") != None:
            name = act["name"]
        location = None
        if act["location"] != None:
            location = act["location"]
        start_time = None
        if act["start_time"] != None:
            start_time = datetime.strptime(act["start_time"], "%Y-%m-%d %H:%M:%S")
        end_time = None
        if act["end_time"] != None:
            end_time = datetime.strptime(act["end_time"], "%Y-%m-%d %H:%M:%S")
        duration = None
        if act["duration"] != None and act["duration"] != '':
            duration = timedelta(minutes=int(act["duration"]))
        processed_act = Activity(name=name, start_time=start_time, end_time=end_time, duration=duration, location=location)
        processed_activities.append(processed_act)
    return processed_activities

def extract_uni_activities(calendar_file):
    file = open(calendar_file, 'rb')
    ecal = Calendar.from_ical(file.read())
    uni_activities = []
    for component in ecal.walk():
        if component.name == 'VEVENT':
            if component.decoded("dtstart").strftime("%Y-%m-%d") == datetime.strptime('2022-11-20', "%Y-%m-%d").strftime("%Y-%m-%d"):
                name = str(component.get('summary'))
                start_time = component.decoded("dtstart").replace(tzinfo=None)
                end_time = component.decoded("dtend").replace(tzinfo=None)
                uni_activities.append(Activity(name=name, start_time=start_time, end_time=end_time, location="Garching Forschungszentrum"))
    return uni_activities

def assign_activity_priorities(activities):
    for activity in activities:
        if (((activity.start_time != None) and (activity.end_time != None)) or
        ((activity.duration != None) and (activity.end_time != None)) or
        ((activity.duration != None) and (activity.start_time != None)) or
        ((activity.duration != None) and (activity.start_time != None) and (activity.end_time != None))):
            activity.priority = 1
        elif (activity.start_time == None) and (activity.end_time == None) and (activity.duration != None) and (activity.location != None):
            activity.priority = 2
        elif (activity.start_time == None) and (activity.end_time == None) and (activity.duration != None) and (activity.location == None):
            activity.priority = 3
        else:
            activity.priority = 4
    activities.sort(key=lambda x: x.priority)

def create_schedule(todo_activities, uni_activities, start_station, end_station, arrival_time):
    schedule = Schedule(start_station=start_station, end_station=end_station, latest_arrival=arrival_time)
    
    # Insert uni activities to schedule
    print("uni", uni_activities)
    if uni_activities != None:
        for act in uni_activities:
            schedule.add_activity(act)
        
    # Assign priority to todo activities
    assign_activity_priorities(todo_activities)
    
    # Schedule todo activities based on priority
    for act in todo_activities:
        empty_slots = schedule.find_empty_slots()
        
        if act.priority == 1:
            schedule.add_activity(act)
            
        elif act.priority == 2:
            min_total_duration = math.inf
            min_activity = None
            for slot in empty_slots:
                route1 = None
                route2 = None

                travel_time1 = timedelta(seconds=0)
                if slot.prev_activity.location != act.location:
                    route = generate_route(start=slot.prev_activity.location, dest=act.location, time=slot.start_time, arrival_time=False)
                    travel_time1 = route["duration"]
                    route1 = TravelPlan(model=route["model"], station_line=route["station_line"], platform=route["platform"], start_station=route["start_station"], end_station=route["end_station"], departures=route["departures"], arrivals=route["arrivals"])

                travel_time2 = timedelta(seconds=0)
                if act.location != slot.next_activity.location:
                    if route1 != None:
                        prev_time = route1.arrivals[-1]
                    else:
                        prev_time = slot.prev_activity.end_time
                    
                    route = generate_route(start=act.location, dest=slot.next_activity.location, time=prev_time+act.duration, arrival_time=False)
                    travel_time2 = route["duration"]
                    route2 = TravelPlan(model=route["model"], station_line=route["station_line"], platform=route["platform"], start_station=route["start_station"], end_station=route["end_station"], departures=route["departures"], arrivals=route["arrivals"])

                total_duration = (travel_time1 + act.duration + travel_time2).seconds

#                 if total_duration < min_total_duration and (slot.end_time-slot.start_time).seconds > total_duration:
                if (slot.end_time-slot.start_time).seconds > total_duration:
                    min_total_duration = total_duration
                    slot.prev_activity.travel_plan = route1
                    min_activity = Activity(name=act.name, start_time=slot.prev_activity.end_time+travel_time1, duration=act.duration, location=act.location, travel_plan=route2)
            
            if min_activity != None:
                schedule.add_activity(min_activity)
        
        elif act.priority == 3:
            for slot in empty_slots:
                if slot.end_time < slot.start_time:
                    slot.end_time = slot.start_time
                slot_duration = (slot.end_time - slot.start_time).seconds
                if act.duration.seconds < slot_duration:
                    schedule.add_activity(Activity(name=act.name, start_time=slot.start_time, duration=act.duration))
                    break
    
    # Insert travel activities to schedule
    if start_station != schedule.activities[0].location:
        departure_route = generate_route(start=start_station, dest=schedule.activities[0].location, time=schedule.activities[0].start_time, arrival_time=True)
        departure_travel_plan = TravelPlan(model=departure_route["model"], station_line=departure_route["station_line"], platform=departure_route["platform"], start_station=departure_route["start_station"], end_station=departure_route["end_station"], departures=departure_route["departures"], arrivals=departure_route["arrivals"])
        departure_activity = Activity(name="Departure", start_time=departure_route["start_time"], end_time=departure_route["end_time"], location=departure_route["end_station"], travel_plan=departure_travel_plan)
        schedule.add_activity(departure_activity)
    
    if end_station != schedule.activities[-1].location:
        arrival_route = generate_route(start=schedule.activities[-1].location, dest=end_station, time=arrival_time, arrival_time=True)
        arrival_travel_plan = TravelPlan(model=arrival_route["model"], station_line=arrival_route["station_line"], platform=arrival_route["platform"], start_station=arrival_route["start_station"], end_station=arrival_route["end_station"], departures=arrival_route["departures"], arrivals=arrival_route["arrivals"])
        arrival_activity = Activity(name="Arrival", start_time=arrival_route["start_time"], end_time=arrival_route["end_time"], location=arrival_route["start_station"], travel_plan=arrival_travel_plan)
        schedule.add_activity(arrival_activity)
    
    return schedule