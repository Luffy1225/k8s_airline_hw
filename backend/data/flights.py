import math
import time
from datetime import datetime, timedelta
from .airports import AIRPORTS

SCHEDULES = [
    {
        "flight_no": "BR12",
        "origin": "TPE",
        "destination": "LAX",
        "dep_time": "19:20",
        "arr_time": "15:50",
        "duration_mins": 750,
        "days": [1, 2, 3, 4, 5, 6, 7],
        "aircraft": "B77W",
        "aircraft_name": "Boeing 777-300ER",
        "base_price": 28500,
        "on_time_rate": 96.2,
        "tail_no": "B-16722"
    },
    {
        "flight_no": "BR11",
        "origin": "LAX",
        "destination": "TPE",
        "dep_time": "23:55",
        "arr_time": "05:40",
        "duration_mins": 825,
        "days": [1, 2, 3, 4, 5, 6, 7],
        "aircraft": "B77W",
        "aircraft_name": "Boeing 777-300ER",
        "base_price": 29800,
        "on_time_rate": 94.8,
        "tail_no": "B-16723"
    },
    {
        "flight_no": "BR28",
        "origin": "TPE",
        "destination": "SFO",
        "dep_time": "23:30",
        "arr_time": "19:25",
        "duration_mins": 715,
        "days": [1, 2, 3, 4, 5, 6, 7],
        "aircraft": "B77W",
        "aircraft_name": "Boeing 777-300ER",
        "base_price": 27200,
        "on_time_rate": 97.5,
        "tail_no": "B-16718"
    },
    {
        "flight_no": "BR32",
        "origin": "TPE",
        "destination": "JFK",
        "dep_time": "19:10",
        "arr_time": "21:05",
        "duration_mins": 895,
        "days": [1, 2, 4, 5, 6, 7],
        "aircraft": "B789",
        "aircraft_name": "Boeing 787-9 Dreamliner",
        "base_price": 36000,
        "on_time_rate": 95.1,
        "tail_no": "B-17882"
    },
    {
        "flight_no": "BR26",
        "origin": "TPE",
        "destination": "SEA",
        "dep_time": "23:40",
        "arr_time": "19:00",
        "duration_mins": 680,
        "days": [1, 3, 5, 6, 7],
        "aircraft": "B789",
        "aircraft_name": "Boeing 787-9 Dreamliner",
        "base_price": 26800,
        "on_time_rate": 98.0,
        "tail_no": "B-17885"
    },
    {
        "flight_no": "BR198",
        "origin": "TPE",
        "destination": "NRT",
        "dep_time": "08:50",
        "arr_time": "13:15",
        "duration_mins": 205,
        "days": [1, 2, 3, 4, 5, 6, 7],
        "aircraft": "B789",
        "aircraft_name": "Boeing 787-9 Dreamliner",
        "base_price": 14200,
        "on_time_rate": 98.4,
        "tail_no": "B-17883"
    },
    {
        "flight_no": "BR197",
        "origin": "NRT",
        "destination": "TPE",
        "dep_time": "14:30",
        "arr_time": "17:45",
        "duration_mins": 255,
        "days": [1, 2, 3, 4, 5, 6, 7],
        "aircraft": "B789",
        "aircraft_name": "Boeing 787-9 Dreamliner",
        "base_price": 14500,
        "on_time_rate": 97.9,
        "tail_no": "B-17883"
    },
    {
        "flight_no": "BR192",
        "origin": "TSA",
        "destination": "HND",
        "dep_time": "07:20",
        "arr_time": "11:15",
        "duration_mins": 175,
        "days": [1, 2, 3, 4, 5, 6, 7],
        "aircraft": "A359",
        "aircraft_name": "Airbus A350-900",
        "base_price": 15800,
        "on_time_rate": 99.1,
        "tail_no": "B-18903"
    },
    {
        "flight_no": "BR132",
        "origin": "TPE",
        "destination": "KIX",
        "dep_time": "08:30",
        "arr_time": "12:10",
        "duration_mins": 160,
        "days": [1, 2, 3, 4, 5, 6, 7],
        "aircraft": "B789",
        "aircraft_name": "Boeing 787-9 Dreamliner",
        "base_price": 13900,
        "on_time_rate": 96.8,
        "tail_no": "B-17886"
    },
    {
        "flight_no": "BR160",
        "origin": "TPE",
        "destination": "ICN",
        "dep_time": "15:15",
        "arr_time": "18:45",
        "duration_mins": 150,
        "days": [1, 2, 3, 4, 5, 6, 7],
        "aircraft": "A21N",
        "aircraft_name": "Airbus A321neo",
        "base_price": 11500,
        "on_time_rate": 97.2,
        "tail_no": "B-16212"
    },
    {
        "flight_no": "BR225",
        "origin": "TPE",
        "destination": "SIN",
        "dep_time": "07:40",
        "arr_time": "12:05",
        "duration_mins": 265,
        "days": [1, 2, 3, 4, 5, 6, 7],
        "aircraft": "B77W",
        "aircraft_name": "Boeing 777-300ER",
        "base_price": 16800,
        "on_time_rate": 98.7,
        "tail_no": "B-16715"
    },
    {
        "flight_no": "BR211",
        "origin": "TPE",
        "destination": "BKK",
        "dep_time": "07:50",
        "arr_time": "10:40",
        "duration_mins": 230,
        "days": [1, 2, 3, 4, 5, 6, 7],
        "aircraft": "B77W",
        "aircraft_name": "Boeing 777-300ER",
        "base_price": 12800,
        "on_time_rate": 95.3,
        "tail_no": "B-16719"
    },
    {
        "flight_no": "BR871",
        "origin": "TPE",
        "destination": "HKG",
        "dep_time": "16:40",
        "arr_time": "18:35",
        "duration_mins": 115,
        "days": [1, 2, 3, 4, 5, 6, 7],
        "aircraft": "B789",
        "aircraft_name": "Boeing 787-9 Dreamliner",
        "base_price": 7800,
        "on_time_rate": 96.5,
        "tail_no": "B-17884"
    },
    {
        "flight_no": "BR67",
        "origin": "TPE",
        "destination": "LHR",
        "dep_time": "09:00",
        "arr_time": "19:25",
        "duration_mins": 865,
        "days": [1, 2, 4, 6],
        "aircraft": "B77W",
        "aircraft_name": "Boeing 777-300ER",
        "base_price": 38900,
        "on_time_rate": 93.6,
        "tail_no": "B-16725"
    },
    {
        "flight_no": "BR87",
        "origin": "TPE",
        "destination": "CDG",
        "dep_time": "23:50",
        "arr_time": "07:55",
        "duration_mins": 845,
        "days": [2, 4, 6, 7],
        "aircraft": "B789",
        "aircraft_name": "Boeing 787-9 Dreamliner",
        "base_price": 37500,
        "on_time_rate": 94.2,
        "tail_no": "B-17887"
    },
    {
        "flight_no": "BR95",
        "origin": "TPE",
        "destination": "MXP",
        "dep_time": "23:15",
        "arr_time": "07:15",
        "duration_mins": 840,
        "days": [1, 3, 5],
        "aircraft": "B789",
        "aircraft_name": "Boeing 787-9 Dreamliner",
        "base_price": 36800,
        "on_time_rate": 95.8,
        "tail_no": "B-17888"
    },
    {
        "flight_no": "BR61",
        "origin": "TPE",
        "destination": "VIE",
        "dep_time": "23:40",
        "arr_time": "06:30",
        "duration_mins": 830,
        "days": [1, 3, 5, 7],
        "aircraft": "B789",
        "aircraft_name": "Boeing 787-9 Dreamliner",
        "base_price": 35200,
        "on_time_rate": 96.0,
        "tail_no": "B-17881"
    },
    {
        "flight_no": "BR315",
        "origin": "TPE",
        "destination": "BNE",
        "dep_time": "09:10",
        "arr_time": "20:00",
        "duration_mins": 530,
        "days": [2, 4, 6, 7],
        "aircraft": "B789",
        "aircraft_name": "Boeing 787-9 Dreamliner",
        "base_price": 28900,
        "on_time_rate": 97.4,
        "tail_no": "B-17882"
    }
]

def adjust_longitudes_for_pacific(lon1, lon2):
    """Adjust longitude so flights across the date line stay continuous in Pacific view"""
    lon1_adj = lon1
    lon2_adj = lon2
    # Eastward Pacific crossing: lon1 in Asia (>0), lon2 in Americas (<0)
    if lon1 > 0 and lon2 < 0 and (lon1 - lon2) > 180:
        lon2_adj = lon2 + 360
    # Westward Pacific crossing: lon1 in Americas (<0), lon2 in Asia (>0)
    elif lon1 < 0 and lon2 > 0 and (lon2 - lon1) > 180:
        lon1_adj = lon1 + 360
    return lon1_adj, lon2_adj

def generate_great_circle_path(lat1, lon1, lat2, lon2, num_pts=24):
    """Generate list of [lat, lng] points along the great circle arc"""
    lon1_adj, lon2_adj = adjust_longitudes_for_pacific(lon1, lon2)
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    lam1, lam2 = math.radians(lon1_adj), math.radians(lon2_adj)

    d = 2 * math.asin(math.sqrt(math.sin((phi2 - phi1) / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin((lam2 - lam1) / 2)**2))
    
    pts = []
    for i in range(num_pts + 1):
        f = i / num_pts
        if d == 0:
            lat = lat1
            lon = lon1_adj
        else:
            A = math.sin((1 - f) * d) / math.sin(d)
            B = math.sin(f * d) / math.sin(d)
            x = A * math.cos(phi1) * math.cos(lam1) + B * math.cos(phi2) * math.cos(lam2)
            y = A * math.cos(phi1) * math.sin(lam1) + B * math.cos(phi2) * math.sin(lam2)
            z = A * math.sin(phi1) + B * math.sin(phi2)
            lat = math.degrees(math.atan2(z, math.sqrt(x**2 + y**2)))
            lon = lon1_adj + f * (lon2_adj - lon1_adj)
        pts.append([round(lat, 4), round(lon, 4)])
    return pts, lon1_adj, lon2_adj

def get_live_flights():
    """Returns dynamic, realistically simulated live flights across the world"""
    current_time = time.time()
    live_list = []

    for idx, flight in enumerate(SCHEDULES):
        orig = AIRPORTS.get(flight["origin"])
        dest = AIRPORTS.get(flight["destination"])
        if not orig or not dest:
            continue

        # Cycle offset
        cycle_period = 300  # 5 minutes full simulation cycle
        offset = idx * 37
        f = ((current_time + offset) % cycle_period) / cycle_period

        # Determine flight phase
        if f < 0.08:
            status = "Climbing"
            altitude = int(f / 0.08 * 34000)
            ground_speed = int(250 + (f / 0.08) * 230)
        elif f > 0.90:
            status = "Descending"
            rem = (1.0 - f) / 0.10
            altitude = int(rem * 36000)
            ground_speed = int(220 + rem * 260)
        else:
            status = "Cruising"
            altitude = 36000 + (idx % 5) * 1000
            ground_speed = 485 + (idx % 7) * 7

        full_pts, orig_lng_adj, dest_lng_adj = generate_great_circle_path(
            orig["lat"], orig["lng"], dest["lat"], dest["lng"], num_pts=24
        )

        # Current interpolated position
        cur_idx_f = f * (len(full_pts) - 1)
        base_idx = int(cur_idx_f)
        sub_f = cur_idx_f - base_idx
        
        p1 = full_pts[min(base_idx, len(full_pts) - 1)]
        p2 = full_pts[min(base_idx + 1, len(full_pts) - 1)]
        
        cur_lat = p1[0] + (p2[0] - p1[0]) * sub_f
        cur_lng = p1[1] + (p2[1] - p1[1]) * sub_f

        # Calculate bearing / heading towards next point
        d_lat = p2[0] - p1[0]
        d_lng = p2[1] - p1[1]
        heading = (math.degrees(math.atan2(d_lng, d_lat)) + 360) % 360

        remaining_mins = int((1.0 - f) * flight["duration_mins"])
        eta_time = (datetime.now() + timedelta(minutes=remaining_mins)).strftime("%H:%M")

        # Split path into completed and remaining
        split_idx = base_idx + 1
        completed_pts = full_pts[:split_idx] + [[round(cur_lat, 4), round(cur_lng, 4)]]
        remaining_pts = [[round(cur_lat, 4), round(cur_lng, 4)]] + full_pts[split_idx:]

        live_list.append({
            "flight_no": flight["flight_no"],
            "tail_no": flight["tail_no"],
            "aircraft": flight["aircraft"],
            "aircraft_name": flight["aircraft_name"],
            "origin": {**orig, "lng_adj": orig_lng_adj},
            "destination": {**dest, "lng_adj": dest_lng_adj},
            "dep_time": flight["dep_time"],
            "arr_time": flight["arr_time"],
            "status": status,
            "progress_percent": round(f * 100, 1),
            "current_lat": round(cur_lat, 4),
            "current_lng": round(cur_lng, 4),
            "heading": round(heading, 1),
            "altitude_ft": altitude,
            "ground_speed_kts": ground_speed,
            "eta": eta_time,
            "remaining_mins": remaining_mins,
            "full_path": full_pts,
            "completed_path": completed_pts,
            "remaining_path": remaining_pts
        })

    return live_list
