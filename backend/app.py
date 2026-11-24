import os
import json
from datetime import datetime
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

from data.airports import AIRPORTS
from data.fleet import FLEET
from data.flights import SCHEDULES, get_live_flights
from db import init_db, create_booking, get_booking, search_bookings
from cache import cache, cached

app = Flask(__name__, static_folder="../frontend/dist", static_url_path="")
CORS(app)

# Initialize SQLite database
init_db()

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "service": "EVA Airlines Virtual Booking System", "time": datetime.now().isoformat()})

@app.route("/api/airports", methods=["GET"])
@cached(ttl=3600)
def get_airports():
    return jsonify(list(AIRPORTS.values()))

@app.route("/api/fleet", methods=["GET"])
@cached(ttl=3600)
def get_fleet():
    return jsonify(FLEET)

@app.route("/api/flights/live", methods=["GET"])
def live_flights():
    """Real-time live map telemetry for all airline aircraft in air (supports ?flight_no=BR12)"""
    flight_no = request.args.get("flight_no", "").upper().strip()
    flights = get_live_flights()
    if flight_no:
        flights = [f for f in flights if f["flight_no"] == flight_no]
    return jsonify({
        "timestamp": datetime.now().isoformat(),
        "total_active_aircraft": len(flights),
        "flights": flights
    })

@app.route("/api/flights/status/<flight_no>", methods=["GET"])
def flight_status(flight_no):
    """Query comprehensive real-time flight status and telemetry by flight number (e.g. BR12)"""
    fn = flight_no.upper().strip()
    live_list = get_live_flights()
    live_match = next((f for f in live_list if f["flight_no"] == fn), None)
    schedule_match = next((s for s in SCHEDULES if s["flight_no"] == fn), None)
    
    if not schedule_match and not live_match:
        return jsonify({
            "error": f"查無航班編號 {fn}，請輸入長榮航班代碼（如 BR12, BR198, BR28, BR871 等）"
        }), 404
        
    sched = schedule_match or {}
    orig_code = sched.get("origin") or (live_match["origin"]["iata"] if live_match else "TPE")
    dest_code = sched.get("destination") or (live_match["destination"]["iata"] if live_match else "LAX")
    
    orig_airport = AIRPORTS.get(orig_code)
    dest_airport = AIRPORTS.get(dest_code)
    
    hash_val = sum(ord(c) for c in fn)
    terminals = ["T2", "T1", "T2"]
    gates = ["A3", "A7", "B4", "B8", "C2", "C6", "C9", "D1", "D5"]
    carousels = ["6A", "8B", "3", "7", "5C", "2"]
    
    terminal = terminals[hash_val % len(terminals)]
    gate = gates[hash_val % len(gates)]
    carousel = carousels[hash_val % len(carousels)]
    
    if live_match:
        operational_status = "IN_FLIGHT"
        status_label = "飛行中 (In Flight)"
        status_desc = f"客機目前正以 {live_match['ground_speed_kts']} 節於 {live_match['altitude_ft']:,} 呎巡航"
    else:
        operational_status = "SCHEDULED"
        status_label = "準時 (On Time)"
        status_desc = "航班依據時刻表正常執飛"
        
    return jsonify({
        "flight_no": fn,
        "tail_no": sched.get("tail_no") or (live_match.get("tail_no") if live_match else "B-16722"),
        "aircraft": sched.get("aircraft") or (live_match.get("aircraft") if live_match else "B77W"),
        "aircraft_name": sched.get("aircraft_name") or (live_match.get("aircraft_name") if live_match else "Boeing 777-300ER"),
        "origin": orig_airport,
        "destination": dest_airport,
        "scheduled_dep_time": sched.get("dep_time", "19:20"),
        "scheduled_arr_time": sched.get("arr_time", "15:50"),
        "estimated_dep_time": sched.get("dep_time", "19:20"),
        "estimated_arr_time": live_match.get("eta") if live_match else sched.get("arr_time", "15:50"),
        "terminal": terminal,
        "gate": gate,
        "baggage_carousel": carousel,
        "operational_status": operational_status,
        "status_label": status_label,
        "status_desc": status_desc,
        "is_airborne": bool(live_match),
        "telemetry": live_match,
        "base_price": sched.get("base_price", 25000),
        "on_time_rate": sched.get("on_time_rate", 96.5),
        "days": sched.get("days", [1, 2, 3, 4, 5, 6, 7]),
        "schedule": sched
    })

@app.route("/api/flights/schedules", methods=["GET"])
@cached(ttl=300)
def get_schedules():
    origin = request.args.get("origin")
    destination = request.args.get("destination")
    page_param = request.args.get("page")
    limit_param = request.args.get("limit", "5")
    
    results = SCHEDULES
    if origin:
        results = [f for f in results if f["origin"] == origin.upper()]
    if destination:
        results = [f for f in results if f["destination"] == destination.upper()]
        
    # Enrich with airport names
    enriched = []
    for f in results:
        f_copy = dict(f)
        f_copy["origin_airport"] = AIRPORTS.get(f["origin"])
        f_copy["destination_airport"] = AIRPORTS.get(f["destination"])
        enriched.append(f_copy)
        
    # If page parameter is explicitly provided, return paginated metadata envelope
    if page_param:
        try:
            page = max(1, int(page_param))
            limit = max(1, min(50, int(limit_param)))
        except ValueError:
            page = 1
            limit = 5
            
        total = len(enriched)
        total_pages = max(1, (total + limit - 1) // limit)
        start = (page - 1) * limit
        end = start + limit
        paged_items = enriched[start:end]
        
        return jsonify({
            "page": page,
            "limit": limit,
            "total": total,
            "total_pages": total_pages,
            "schedules": paged_items
        })
        
    return jsonify(enriched)

@app.route("/api/flights/search", methods=["GET"])
@cached(ttl=120)
def search_flights():
    origin = request.args.get("origin", "").upper()
    destination = request.args.get("destination", "").upper()
    date_str = request.args.get("date", "")
    cabin_class = request.args.get("cabin", "economy").lower()
    
    # Filter matching schedules
    matching = []
    for f in SCHEDULES:
        match_orig = (not origin) or (f["origin"] == origin)
        match_dest = (not destination) or (f["destination"] == destination)
        
        # Check day of week if date provided
        if date_str:
            try:
                dt = datetime.strptime(date_str, "%Y-%m-%d")
                weekday = dt.isoweekday() # 1=Mon, 7=Sun
                if weekday not in f["days"]:
                    continue
            except ValueError:
                pass
                
        if match_orig and match_dest:
            item = dict(f)
            item["origin_airport"] = AIRPORTS.get(f["origin"])
            item["destination_airport"] = AIRPORTS.get(f["destination"])
            item["flight_date"] = date_str or datetime.now().strftime("%Y-%m-%d")
            
            # Fare families calculation
            base = f["base_price"]
            
            # Multiplier for cabin classes
            if "business" in cabin_class:
                class_base = int(base * 2.8)
                item["cabin_class"] = "Royal Laurel (Business)"
            elif "premium" in cabin_class:
                class_base = int(base * 1.6)
                item["cabin_class"] = "Premium Economy"
            else:
                class_base = base
                item["cabin_class"] = "Economy"
                
            item["fares"] = {
                "basic": {
                    "tier": "Basic",
                    "price": class_base,
                    "baggage": "1 x 23kg",
                    "change_fee": "NT$ 3,000",
                    "seat_selection": "Standard (Paid)",
                    "miles_accrual": "50%"
                },
                "standard": {
                    "tier": "Standard",
                    "price": int(class_base * 1.15),
                    "baggage": "2 x 23kg",
                    "change_fee": "Free within 7 days",
                    "seat_selection": "Complimentary",
                    "miles_accrual": "100%"
                },
                "flex": {
                    "tier": "Flex",
                    "price": int(class_base * 1.35),
                    "baggage": "2 x 32kg",
                    "change_fee": "Complimentary",
                    "seat_selection": "Priority Seating",
                    "miles_accrual": "125%"
                }
            }
            matching.append(item)
            
    return jsonify(matching)

@app.route("/api/aircraft/seatmap", methods=["GET"])
@cached(ttl=1800)
def get_seatmap():
    flight_no = request.args.get("flight_no", "")
    aircraft_code = request.args.get("aircraft", "")
    
    # Find aircraft model
    target_aircraft = None
    if flight_no:
        for s in SCHEDULES:
            if s["flight_no"] == flight_no.upper():
                aircraft_code = s["aircraft"]
                break
                
    for fleet_item in FLEET:
        if fleet_item["code"] == aircraft_code:
            target_aircraft = fleet_item
            break
            
    if not target_aircraft:
        target_aircraft = FLEET[0]
        
    return jsonify(target_aircraft)

@app.route("/api/bookings", methods=["POST"])
def post_booking():
    data = request.json
    if not data:
        return jsonify({"error": "No data provided"}), 400
        
    required_fields = ["flight_no", "flight_date", "origin", "destination"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
            
    created = create_booking(data)
    return jsonify({
        "success": True,
        "message": "Booking confirmed successfully",
        "booking": created
    }), 201

@app.route("/api/bookings/<pnr>", methods=["GET"])
def retrieve_booking(pnr):
    booking = get_booking(pnr)
    if not booking:
        return jsonify({"error": "Booking not found"}), 404
        
    # Enrich with airport names
    booking["origin_airport"] = AIRPORTS.get(booking["origin"])
    booking["destination_airport"] = AIRPORTS.get(booking["destination"])
    return jsonify(booking)

@app.route("/api/bookings/search", methods=["GET"])
def search_booking():
    pnr = request.args.get("pnr", "")
    last_name = request.args.get("lastName", "")
    
    if not pnr or not last_name:
        return jsonify({"error": "PNR and Last Name are required"}), 400
        
    booking = search_bookings(pnr, last_name)
    if not booking:
        return jsonify({"error": "No matching reservation found. Please check your Booking Reference and Passenger Last Name."}), 404
        
    booking["origin_airport"] = AIRPORTS.get(booking["origin"])
    booking["destination_airport"] = AIRPORTS.get(booking["destination"])
    return jsonify(booking)

@app.route("/api/cache/stats", methods=["GET"])
def get_cache_stats():
    """Cache observability endpoint: returns hit/miss rates, cached entries, and remaining TTL"""
    return jsonify(cache.stats())

@app.route("/api/cache/clear", methods=["POST"])
def clear_cache():
    """Manually invalidate and purge backend memory cache"""
    cache.clear()
    return jsonify({"success": True, "message": "Memory cache cleared successfully"})

# Serve Reveal.js Presentation Slides
@app.route("/slides", methods=["GET"])
@app.route("/slides/<path:path>", methods=["GET"])
def serve_slides(path="index.html"):
    slides_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../presentation"))
    if not path or path == "":
        path = "index.html"
    return send_from_directory(slides_dir, path)

# Serve Frontend static assets in production
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    if os.path.exists(os.path.join(app.static_folder, "index.html")):
        return send_from_directory(app.static_folder, "index.html")
    return jsonify({"message": "Flask API is running. Build frontend to view the UI."})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
