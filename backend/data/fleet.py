FLEET = [
    {
        "model": "Boeing 787-9 Dreamliner",
        "code": "B789",
        "manufacturer": "Boeing",
        "capacity": 304,
        "cruising_speed": 490,
        "max_altitude": 43000,
        "range_km": 14140,
        "cabin_classes": ["Royal Laurel (Business)", "Premium Economy", "Economy"],
        "seat_configuration": {
            "business": {"rows": [1, 2, 5, 6, 7, 8], "layout": ["A", "D", "G", "K"], "price": 45000},
            "premium_economy": {"rows": [20, 21, 22, 23, 24], "layout": ["A", "C", "D", "E", "G", "H", "K"], "price": 28000},
            "economy": {"rows": [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40], "layout": ["A", "B", "C", "D", "E", "F", "G", "H", "K"], "price": 16000}
        }
    },
    {
        "model": "Boeing 777-300ER",
        "code": "B77W",
        "manufacturer": "Boeing",
        "capacity": 353,
        "cruising_speed": 510,
        "max_altitude": 43100,
        "range_km": 14594,
        "cabin_classes": ["Royal Laurel (Business)", "Premium Economy", "Economy"],
        "seat_configuration": {
            "business": {"rows": [1, 2, 3, 5, 6, 7, 8, 9, 10], "layout": ["A", "D", "G", "K"], "price": 48000},
            "premium_economy": {"rows": [20, 21, 22, 23, 24, 25, 26], "layout": ["A", "C", "D", "E", "G", "H", "K"], "price": 29500},
            "economy": {"rows": [38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50], "layout": ["A", "B", "C", "D", "E", "F", "G", "H", "K"], "price": 17500}
        }
    },
    {
        "model": "Airbus A350-900",
        "code": "A359",
        "manufacturer": "Airbus",
        "capacity": 306,
        "cruising_speed": 500,
        "max_altitude": 43000,
        "range_km": 15000,
        "cabin_classes": ["Royal Laurel (Business)", "Premium Economy", "Economy"],
        "seat_configuration": {
            "business": {"rows": [1, 2, 3, 5, 6, 7, 8], "layout": ["A", "D", "G", "K"], "price": 46000},
            "premium_economy": {"rows": [20, 21, 22, 23, 24], "layout": ["A", "C", "D", "E", "G", "H", "K"], "price": 27000},
            "economy": {"rows": [30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40], "layout": ["A", "B", "C", "D", "E", "F", "G", "H", "K"], "price": 15500}
        }
    },
    {
        "model": "Airbus A321neo",
        "code": "A21N",
        "manufacturer": "Airbus",
        "capacity": 184,
        "cruising_speed": 450,
        "max_altitude": 39000,
        "range_km": 7400,
        "cabin_classes": ["Business", "Economy"],
        "seat_configuration": {
            "business": {"rows": [1, 2], "layout": ["A", "C", "D", "F"], "price": 18000},
            "economy": {"rows": [10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25], "layout": ["A", "B", "C", "D", "E", "F"], "price": 8500}
        }
    }
]
