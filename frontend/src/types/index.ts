export interface Airport {
  iata: string;
  icao: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
  timezone: string;
  is_hub: boolean;
}

export interface FareDetail {
  tier: string;
  price: number;
  baggage: string;
  change_fee: string;
  seat_selection: string;
  miles_accrual: string;
}

export interface FlightSchedule {
  flight_no: string;
  origin: string;
  destination: string;
  origin_airport?: Airport;
  destination_airport?: Airport;
  dep_time: string;
  arr_time: string;
  duration_mins: number;
  days: number[];
  aircraft: string;
  aircraft_name: string;
  base_price: number;
  on_time_rate: number;
  tail_no: string;
  flight_date?: string;
  cabin_class?: string;
  fares?: {
    basic: FareDetail;
    standard: FareDetail;
    flex: FareDetail;
  };
}

export interface LiveFlight {
  flight_no: string;
  tail_no: string;
  aircraft: string;
  aircraft_name: string;
  origin: Airport;
  destination: Airport;
  dep_time: string;
  arr_time: string;
  status: string;
  progress_percent: number;
  current_lat: number;
  current_lng: number;
  heading: number;
  altitude_ft: number;
  ground_speed_kts: number;
  eta: string;
  remaining_mins: number;
  full_path?: [number, number][];
  completed_path?: [number, number][];
  remaining_path?: [number, number][];
}

export interface Passenger {
  title: string;
  first_name: string;
  last_name: string;
  passport_no: string;
  seat: string;
  meal_preference: string;
}

export interface BookingAddon {
  id: string;
  name: string;
  nameEn: string;
  price: number;
  count: number;
  unit: string;
  icon?: string;
}

export interface Booking {
  pnr: string;
  flight_no: string;
  flight_date: string;
  origin: string;
  destination: string;
  origin_airport?: Airport;
  destination_airport?: Airport;
  cabin_class: string;
  fare_family: string;
  passengers: Passenger[];
  contact_email: string;
  contact_phone: string;
  total_price: number;
  status: string;
  gate: string;
  boarding_time: string;
  addons?: BookingAddon[];
  created_at?: string;
}

export interface FleetItem {
  model: string;
  code: string;
  manufacturer: string;
  capacity: number;
  cruising_speed: number;
  max_altitude: number;
  range_km: number;
  cabin_classes: string[];
  seat_configuration: {
    business?: { rows: number[]; layout: string[]; price: number };
    premium_economy?: { rows: number[]; layout: string[]; price: number };
    economy: { rows: number[]; layout: string[]; price: number };
  };
}
