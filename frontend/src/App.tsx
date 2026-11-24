import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSearch } from './components/HeroSearch';
import { LiveMap } from './components/LiveMap';
import { ScheduleView } from './components/ScheduleView';
import { FlightStatusView } from './components/FlightStatusView';
import { BookingFlow } from './components/BookingFlow';
import { ManageBooking } from './components/ManageBooking';
import { Footer } from './components/Footer';
import { api } from './services/api';
import { Airport, FlightSchedule, LiveFlight, FleetItem } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('search');
  const [airports, setAirports] = useState<Airport[]>([]);
  const [liveFlights, setLiveFlights] = useState<LiveFlight[]>([]);
  const [schedules, setSchedules] = useState<FlightSchedule[]>([]);
  const [fleet, setFleet] = useState<FleetItem[]>([]);
  
  const [bookingFlight, setBookingFlight] = useState<FlightSchedule | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initial load: Only load cold/static catalog data (airports, fleet, schedules)
  useEffect(() => {
    async function initData() {
      try {
        const [airportsData, fleetData, schedulesData] = await Promise.all([
          api.getAirports(),
          api.getFleet(),
          api.getSchedules(),
        ]);
        setAirports(airportsData);
        setFleet(fleetData);
        setSchedules(schedulesData);
      } catch (err) {
        console.error('Failed to initialize app data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    initData();
  }, []);

  // Poll live flights ONLY when user is actively on the 'map' (Radar) tab
  useEffect(() => {
    if (activeTab !== 'map') return;

    // Fetch immediately upon opening the radar map
    const fetchLiveData = async () => {
      try {
        const liveData = await api.getLiveFlights();
        setLiveFlights(liveData.flights);
      } catch (err) {
        // Silently retry on next tick
      }
    };

    fetchLiveData();

    // Start 4-second polling timer strictly while staying on the map tab
    const timer = setInterval(fetchLiveData, 4000);

    // Stop polling as soon as user navigates away from radar
    return () => clearInterval(timer);
  }, [activeTab]);

  // User actions
  const handleSelectFlightFromSearch = (flight: FlightSchedule) => {
    setBookingFlight(flight);
    setActiveTab('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectFlightFromMap = async (origIata: string, destIata: string) => {
    try {
      const results = await api.searchFlights({ origin: origIata, destination: destIata });
      if (results.length > 0) {
        setBookingFlight(results[0]);
        setActiveTab('booking');
      } else {
        setActiveTab('search');
      }
    } catch {
      setActiveTab('search');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookFromSchedule = (schedule: FlightSchedule) => {
    // Enrich with fares if missing
    const enriched: FlightSchedule = {
      ...schedule,
      flight_date: new Date().toISOString().split('T')[0],
      cabin_class: 'Economy',
      fares: schedule.fares || {
        basic: {
          tier: 'Basic',
          price: schedule.base_price,
          baggage: '1 x 23kg',
          change_fee: 'NT$ 3,000',
          seat_selection: 'Standard (Paid)',
          miles_accrual: '50%',
        },
        standard: {
          tier: 'Standard',
          price: Math.round(schedule.base_price * 1.15),
          baggage: '2 x 23kg',
          change_fee: 'Free within 7 days',
          seat_selection: 'Complimentary',
          miles_accrual: '100%',
        },
        flex: {
          tier: 'Flex',
          price: Math.round(schedule.base_price * 1.35),
          baggage: '2 x 32kg',
          change_fee: 'Complimentary',
          seat_selection: 'Priority Seating',
          miles_accrual: '125%',
        },
      },
    };
    setBookingFlight(enriched);
    setActiveTab('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5edf0] text-[#3d2c2e] selection:bg-[#886f68]/20">
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        airborneCount={liveFlights.length > 0 ? liveFlights.length : 18}
      />

      <main className="flex-1">
        {/* Tab 1: Flight Search / Home */}
        {activeTab === 'search' && (
          <HeroSearch
            airports={airports}
            onSelectFlight={handleSelectFlightFromSearch}
            airborneCount={liveFlights.length > 0 ? liveFlights.length : 18}
            onNavigateToMap={() => {
              setActiveTab('map');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* Tab 2: Live Flight Radar Map */}
        {activeTab === 'map' && (
          <LiveMap
            flights={liveFlights}
            onSelectFlightToBook={handleSelectFlightFromMap}
            onRefresh={async () => {
              const liveData = await api.getLiveFlights();
              setLiveFlights(liveData.flights);
            }}
          />
        )}

        {/* Tab 3: Flight Schedules */}
        {activeTab === 'schedules' && (
          <ScheduleView
            schedules={schedules}
            airports={airports}
            onBookFlight={handleBookFromSchedule}
          />
        )}

        {/* Tab: Flight Status by Flight Number */}
        {activeTab === 'status' && (
          <FlightStatusView
            onNavigateToRadar={(_flightNo) => {
              setActiveTab('map');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBookFlight={handleBookFromSchedule}
          />
        )}

        {/* Tab 4: Manage Booking */}
        {activeTab === 'manage' && (
          <ManageBooking />
        )}

        {/* Tab 6: Complete Booking Flow */}
        {activeTab === 'booking' && (
          <BookingFlow
            initialFlight={bookingFlight}
            airports={airports}
            onFinish={() => {
              setBookingFlight(null);
              setActiveTab('search');
            }}
          />
        )}
      </main>

      {activeTab !== 'map' && <Footer />}
    </div>
  );
}

export default App;
