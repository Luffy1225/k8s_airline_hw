import sqlite3
import json
import random
import string
from datetime import datetime, timedelta
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "airline.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS bookings (
            pnr TEXT PRIMARY KEY,
            flight_no TEXT NOT NULL,
            flight_date TEXT NOT NULL,
            origin TEXT NOT NULL,
            destination TEXT NOT NULL,
            cabin_class TEXT NOT NULL,
            fare_family TEXT NOT NULL,
            passengers_json TEXT NOT NULL,
            contact_email TEXT NOT NULL,
            contact_phone TEXT NOT NULL,
            total_price INTEGER NOT NULL,
            status TEXT NOT NULL DEFAULT 'CONFIRMED',
            gate TEXT NOT NULL,
            boarding_time TEXT NOT NULL,
            addons_json TEXT DEFAULT '[]',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)
    try:
        cursor.execute("ALTER TABLE bookings ADD COLUMN addons_json TEXT DEFAULT '[]'")
    except sqlite3.OperationalError:
        pass
    conn.commit()
    conn.close()

def generate_pnr():
    letters = "".join(random.choices(string.ascii_uppercase + "23456789", k=6))
    return f"BR{letters[:4]}"

def create_booking(data):
    conn = get_db()
    cursor = conn.cursor()
    pnr = data.get("pnr") or generate_pnr()
    gate = random.choice(["A3", "A7", "B4", "B9", "C2", "C6", "D1"])
    
    # Calculate boarding time (45 mins before flight dep time)
    dep_time = data.get("dep_time", "12:00")
    try:
        dt = datetime.strptime(dep_time, "%H:%M")
        boarding_time = (dt - timedelta(minutes=45)).strftime("%H:%M")
    except Exception:
        boarding_time = "40 mins before departure"

    cursor.execute("""
        INSERT INTO bookings (
            pnr, flight_no, flight_date, origin, destination,
            cabin_class, fare_family, passengers_json, contact_email,
            contact_phone, total_price, status, gate, boarding_time, addons_json
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        pnr,
        data["flight_no"],
        data["flight_date"],
        data["origin"],
        data["destination"],
        data.get("cabin_class", "Economy"),
        data.get("fare_family", "Standard"),
        json.dumps(data.get("passengers", [])),
        data.get("contact_email", ""),
        data.get("contact_phone", ""),
        data.get("total_price", 0),
        "CONFIRMED",
        gate,
        boarding_time,
        json.dumps(data.get("addons", []))
    ))
    conn.commit()
    conn.close()
    return get_booking(pnr)

def get_booking(pnr):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM bookings WHERE pnr = ?", (pnr.upper().strip(),))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    res = dict(row)
    res["passengers"] = json.loads(res.get("passengers_json") or "[]")
    res["addons"] = json.loads(res.get("addons_json") or "[]")
    return res

def search_bookings(pnr, last_name):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM bookings WHERE pnr = ?", (pnr.upper().strip(),))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    data = dict(row)
    passengers = json.loads(data["passengers_json"])
    # Check if last name matches any passenger
    match = any(p.get("last_name", "").strip().lower() == last_name.strip().lower() for p in passengers)
    if not match and last_name != "*":
        return None
    data["passengers"] = passengers
    data["addons"] = json.loads(data.get("addons_json") or "[]")
    return data
