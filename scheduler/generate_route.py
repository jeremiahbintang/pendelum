from mvg_api import *
import json
import pprint
from datetime import datetime

def generate_route(start, dest, time=None, arrival_time=False):
    
    # transfer the start and dest address to latitude, longitude coordinate
    start_coordinates = (get_locations(start)[0]['latitude'], get_locations(start)[0]['longitude'])
    dest_coordinates = (get_locations(dest)[0]['latitude'], get_locations(dest)[0]['longitude'])
    
    # get the routes
    routes = get_route(start_coordinates, dest_coordinates, time=time, arrival_time=arrival_time, 
    max_walk_time_to_start=None, max_walk_time_to_dest=None, change_limit=None, ubahn=True, bus=True, tram=True, sbahn=True)

    ## output variables
    route_choose = None

    # time = departure time
    if arrival_time == False:
        route_choose = 0

    # time = arrival time
    else:
        for j in range(len(routes)):
            end_time = routes[-1-j]["arrival_datetime"]
            if end_time < time:
                route_choose = -1-j
                break

    # 	start_time:
    start_time = routes[route_choose]["departure_datetime"]
    # 	end_time: 
    end_time = routes[route_choose]["arrival_datetime"]

    #   model: U-Bahn | S-Bahn | Bus | Tram | Walking "connectionPartType" "FOOTWAY" or "TRANSPORTATION"
    model = []
    station_line = []
    platform = []
    departures = []
    arrivals = []
    name_of_station_start = None
    lock1 = 0
    lock2 = 0
    name_of_station_dest = None
    
    for i in range(len(routes[route_choose]["connectionPartList"])):
        model.append(routes[route_choose]["connectionPartList"][i]["connectionPartType"])

        if "label" in routes[route_choose]["connectionPartList"][i]:
            station_line.append(routes[route_choose]["connectionPartList"][i]["label"])

        if "departurePlatform" in routes[route_choose]["connectionPartList"][i]:
            platform.append(routes[route_choose]["connectionPartList"][i]["departurePlatform"])
        
        if "departure" in routes[route_choose]["connectionPartList"][i]:
            departures.append(datetime.fromtimestamp(routes[route_choose]["connectionPartList"][i]["departure"] / 1000))
        
        if "arrival" in routes[route_choose]["connectionPartList"][i]:
            arrivals.append(datetime.fromtimestamp(routes[route_choose]["connectionPartList"][i]["arrival"] / 1000))

        if "name" in routes[route_choose]["connectionPartList"][i]["from"]:
            if lock1 == 0:
                name_of_station_start = routes[route_choose]["connectionPartList"][i]["from"]["name"]
                lock1 = 1

        if "name" in routes[route_choose]["connectionPartList"][-1-i]["to"]:
            if lock2 == 0:
                name_of_station_dest = routes[route_choose]["connectionPartList"][-1-i]["to"]["name"]
                lock2 = 1
	    
#     route_json = pprint.pformat(routes[-1]).replace("'", '"')
#     with open('route.json', 'w') as f:
#         f.write(route_json)

    return {"start_time": start_time,
            "end_time": end_time,
            "model": model,
            "station_line": station_line,
            "platform": platform,
            "start_station": name_of_station_start,
            "end_station": name_of_station_dest,
            "departures": departures,
            "arrivals": arrivals,
            "duration": end_time - start_time
    }




