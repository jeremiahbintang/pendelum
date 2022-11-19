from datetime import datetime, timedelta
import math
from icalendar import Calendar, Event, vCalAddress, vText
from pathlib import Path
import os
import pytz

class Activity:
    def __init__(self, name=None, start_time=None, end_time=None, duration=None, location=None, priority=None):
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

class EmptySlot:
    def __init__(self, start_time, end_time, prev_activity, next_activity):
        self.start_time = start_time
        self.end_time = end_time
        self.prev_activity = prev_activity
        self.next_activity = next_activity

class Schedule:
    def __init__(self):
        self.activities = []
    
    def add_activity(self, activity):
        self.activities.append(activity)
        self._sort_based_on_start_time()

    def _sort_based_on_start_time(self):
        self.activities.sort(key=lambda x: x.start_time)
    
    def find_empty_slots(self):  
        empty_slots = []
        for i in range(len(self.activities)-1):
            prev_act = self.activities[i]
            next_act = self.activities[i+1]
            duration = (next_act.start_time - prev_act.end_time).seconds
            if duration > 0:
                empty_slots.append(EmptySlot(start_time=prev_act.end_time, end_time=next_act.start_time, prev_activity=prev_act, next_activity=next_act))
        return empty_slots
    
    def print_schedule(self):
        for act in self.activities:
            print(act.start_time, "-", act.end_time, ":", act.name)
    
    def convert_to_json(self):
        return [{"name": act.name, "start_time": act.start_time, "end_time": act.end_time, "duration": act.duration, "location": act.location} for act in self.activities]

def make_activity_objects(activities):
    return [Activity(name=act["name"], start_time=act["start_time"], end_time=act["end_time"], duration=act["duration"], location=act["location"]) for act in activities]

def extract_uni_activities(calendar_file):
    file = open(calendar_file, 'rb')
    ecal = Calendar.from_ical(file.read())
    uni_activities = []
    for component in ecal.walk():
        if component.name == 'VEVENT':
            if component.decoded("dtstart").strftime("%Y-%m-%d") == datetime.strptime('2022-11-30', "%Y-%m-%d").strftime("%Y-%m-%d"):
                name = str(component.get('summary'))
                start_time = component.decoded("dtstart").replace(tzinfo=None)
                end_time = component.decoded("dtend").replace(tzinfo=None)
                uni_activities.append(Activity(name=name, start_time=start_time, end_time=end_time))
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

def get_route_duration(loc1, loc2):
    return 0

def create_schedule(remaining_activities, uni_activities=None, travel_activities=None):
    schedule = Schedule()
    
    # Insert uni activities to schedule
    if uni_activities != None:
        for act in uni_activities:
            schedule.add_activity(act)
        
    # Insert travel activities to schedule
    if travel_activities != None:
        for act in travel_activities:
            schedule.add_activity(act)
        
    # Assign priority to remaining activities
    assign_activity_priorities(remaining_activities)
    
    # Schedule remaining activities based on priority
    for act in remaining_activities:
        print(act.name, act.priority)
        empty_slots = schedule.find_empty_slots()
        
        if act.priority == 1:
            schedule.add_activity(act)
            
        elif act.priority == 2:
            min_total_duration = math.inf
            min_activity = None
            for slot in empty_slots:
                travel_time1 = get_route_duration(slot.prev_activity.location, act.location)
                travel_time2 = get_route_duration(act.location, slot.next_activity.location)
                total_duration = travel_time1 + act.duration + travel_time2
                if total_duration < min_total_duration:
                    total_duration = min_total_duration
                    min_activity = Activity(name=act.name, start_time=slot.prev_activity.end_time, duration=act.duration, location=act.duration)
            schedule.add_activity(min_activity)
        
        elif act.priority == 3:
            for slot in empty_slots:
                slot_duration = slot.end_time - slot.start_time
                if act.duration < slot_duration:
                    schedule.add_activity(Activity(name=act.name, start_time=slot.start_time, duration=act.duration))
                    break
    
    return schedule