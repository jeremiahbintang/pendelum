from mvg_api import *
import json
import pprint

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
    for i in range(len(routes[route_choose]["connectionPartList"])):
        model.append(routes[route_choose]["connectionPartList"][i]["connectionPartType"])

	# 	station_line: number "label" Ex "U6"
    station_line = []
    for i in range(len(routes[route_choose]["connectionPartList"])):
        if "label" in routes[route_choose]["connectionPartList"][i]:
            station_line.append(routes[route_choose]["connectionPartList"][i]["label"])

    # 	platform: number, (gleis) "departurePlatform"
    platform = []
    for i in range(len(routes[route_choose]["connectionPartList"])):
        if "departurePlatform" in routes[route_choose]["connectionPartList"][i]:
            platform.append(routes[route_choose]["connectionPartList"][i]["departurePlatform"])

	# 	name_of_station: string, "connectionPartList" "from" "name" "to" "name"
    name_of_station_start = None
    for i in range(len(routes[route_choose]["connectionPartList"])):
        if "name" in routes[route_choose]["connectionPartList"][i]["from"]:
            name_of_station_start = routes[route_choose]["connectionPartList"][i]["from"]["name"]
            break
    name_of_station_dest = None
    for i in range(len(routes[route_choose]["connectionPartList"])):
        if "name" in routes[route_choose]["connectionPartList"][-1-i]["to"]:
            name_of_station_dest = routes[route_choose]["connectionPartList"][-1-i]["to"]["name"]
            break
	    
    route_json = pprint.pformat(routes[-1]).replace("'", '"')
    with open('route.json', 'w') as f:
        f.write(route_json)

    return {"start_time": start_time,
            "end_time": end_time,
            "model": model,
            "station_line": station_line,
            "platform": platform,
            "start_station": name_of_station_start,
            "end_station": name_of_station_dest
    }



