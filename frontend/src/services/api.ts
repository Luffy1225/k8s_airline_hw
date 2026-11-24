import { Airport, FlightSchedule, LiveFlight, Booking, FleetItem } from '../types';

const API_BASE = '/api';

export const api = {
  async getAirports(): Promise<Airport[]> {
    const res = await fetch(`${API_BASE}/airports`);
    if (!res.ok) throw new Error('Failed to fetch airports');
    return res.json();
  },

  async getFleet(): Promise<FleetItem[]> {
    const res = await fetch(`${API_BASE}/fleet`);
    if (!res.ok) throw new Error('Failed to fetch fleet');
    return res.json();
  },

  async getSeatMap(params?: { flightNo?: string; aircraft?: string }): Promise<FleetItem> {
    const q = new URLSearchParams();
    if (params?.flightNo) q.append('flight_no', params.flightNo);
    if (params?.aircraft) q.append('aircraft', params.aircraft);
    const res = await fetch(`${API_BASE}/aircraft/seatmap?${q.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch seatmap');
    return res.json();
  },

  async getLiveFlights(): Promise<{ total_active_aircraft: number; flights: LiveFlight[] }> {
    const res = await fetch(`${API_BASE}/flights/live`);
    if (!res.ok) throw new Error('Failed to fetch live flights');
    return res.json();
  },

  async getSchedules(origin?: string, destination?: string): Promise<FlightSchedule[]> {
    const params = new URLSearchParams();
    if (origin) params.append('origin', origin);
    if (destination) params.append('destination', destination);
    const res = await fetch(`${API_BASE}/flights/schedules?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch schedules');
    return res.json();
  },

  async searchFlights(params: {
    origin?: string;
    destination?: string;
    date?: string;
    cabin?: string;
  }): Promise<FlightSchedule[]> {
    const q = new URLSearchParams();
    if (params.origin) q.append('origin', params.origin);
    if (params.destination) q.append('destination', params.destination);
    if (params.date) q.append('date', params.date);
    if (params.cabin) q.append('cabin', params.cabin);
    const res = await fetch(`${API_BASE}/flights/search?${q.toString()}`);
    if (!res.ok) throw new Error('Failed to search flights');
    return res.json();
  },

  async createBooking(data: Partial<Booking>): Promise<{ success: boolean; booking: Booking }> {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Booking creation failed');
    }
    return res.json();
  },

  async searchBooking(pnr: string, lastName: string): Promise<Booking> {
    const res = await fetch(`${API_BASE}/bookings/search?pnr=${encodeURIComponent(pnr)}&lastName=${encodeURIComponent(lastName)}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Reservation not found');
    }
    return res.json();
  },

  async getFlightStatus(flightNo: string): Promise<any> {
    const res = await fetch(`${API_BASE}/flights/status/${encodeURIComponent(flightNo.toUpperCase().trim())}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || '查無此航班狀態');
    }
    return res.json();
  },

  async getCacheStats(): Promise<any> {
    const res = await fetch(`${API_BASE}/cache/stats`);
    if (!res.ok) throw new Error('Failed to fetch cache stats');
    return res.json();
  },

  async clearCache(): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/cache/clear`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to clear cache');
    return res.json();
  },
};
