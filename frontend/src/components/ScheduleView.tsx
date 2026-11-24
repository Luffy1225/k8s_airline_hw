import React, { useState, useMemo, useEffect } from 'react';
import { FlightSchedule, Airport } from '../types';
import { 
  Calendar, 
  Clock, 
  Plane, 
  ArrowRight, 
  Search, 
  ShieldCheck, 
  Radio, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Sparkles,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface ScheduleViewProps {
  schedules: FlightSchedule[];
  airports: Airport[];
  onBookFlight: (schedule: FlightSchedule) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ schedules, airports, onBookFlight }) => {
  // Main view toggle: 'timetable' | 'fids'
  const [viewMode, setViewMode] = useState<'timetable' | 'fids'>('timetable');

  // Timetable filter states
  const [originFilter, setOriginFilter] = useState<string>('');
  const [destinationFilter, setDestinationFilter] = useState<string>('');
  const [aircraftFilter, setAircraftFilter] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // FIDS board states
  const [fidsAirport, setFidsAirport] = useState<string>('TPE');
  const [fidsDirection, setFidsDirection] = useState<'departures' | 'arrivals'>('departures');
  const [fidsSearch, setFidsSearch] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  const dayLabels = ['週一', '週二', '週三', '週四', '週五', '週六', '週日'];

  // Live ticking clock for airport FIDS board
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const filteredSchedules = useMemo(() => {
    return schedules.filter((s) => {
      if (originFilter && s.origin !== originFilter) return false;
      if (destinationFilter && s.destination !== destinationFilter) return false;
      if (aircraftFilter && s.aircraft !== aircraftFilter) return false;
      if (selectedDay !== null && !s.days.includes(selectedDay)) return false;
      return true;
    });
  }, [schedules, originFilter, destinationFilter, aircraftFilter, selectedDay]);

  // Dynamic pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [originFilter, destinationFilter, aircraftFilter, selectedDay]);

  const totalFiltered = filteredSchedules.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  
  const paginatedSchedules = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredSchedules.slice(start, start + pageSize);
  }, [filteredSchedules, safePage, pageSize]);

  const startRecord = totalFiltered === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endRecord = Math.min(safePage * pageSize, totalFiltered);

  // Generate realistic FIDS entries from schedules
  const fidsEntries = useMemo(() => {
    const list = schedules.filter((s) => {
      if (fidsDirection === 'departures') {
        return s.origin === fidsAirport;
      } else {
        return s.destination === fidsAirport;
      }
    });

    // If hub has no direct return in simple mock, fallback to showing flights involving the airport
    const activeList = list.length > 0 ? list : schedules.slice(0, 8);

    return activeList.map((s, idx) => {
      // Deterministic gate and terminal based on index
      const gates = ['A3', 'A7', 'B4', 'B8', 'C2', 'C6', 'C9', 'D1', 'D5', 'D8'];
      const gate = gates[idx % gates.length];
      const terminal = idx % 2 === 0 ? 'T2' : 'T1';
      const carousels = ['6A', '8B', '3', '7', '5C', '2', '9A'];
      const carousel = carousels[idx % carousels.length];

      // Simulated statuses
      let status = 'ON TIME';
      let statusZh = '準時';
      let statusColor = 'text-emerald-400';
      let estTime = fidsDirection === 'departures' ? s.dep_time : s.arr_time;

      if (idx === 0) {
        status = 'BOARDING';
        statusZh = '登機中';
        statusColor = 'text-emerald-400 animate-pulse';
      } else if (idx === 1) {
        status = 'FINAL CALL';
        statusZh = '最後召集';
        statusColor = 'text-amber-400 animate-pulse';
      } else if (idx === 2) {
        status = 'GATE OPEN';
        statusZh = '候機中';
        statusColor = 'text-[#d1ccdc]';
      } else if (idx === 3) {
        status = 'DEPARTED';
        statusZh = '已起飛';
        statusColor = 'text-sky-300';
      } else if (idx === 4 && fidsDirection === 'arrivals') {
        status = 'LANDED';
        statusZh = '已抵達';
        statusColor = 'text-emerald-400';
      } else if (idx === 5 && fidsDirection === 'arrivals') {
        status = 'APPROACHING';
        statusZh = '進場中';
        statusColor = 'text-amber-300';
      }

      return {
        schedule: s,
        flight_no: s.flight_no,
        city: fidsDirection === 'departures' ? (s.destination_airport?.city || s.destination) : (s.origin_airport?.city || s.origin),
        iata: fidsDirection === 'departures' ? s.destination : s.origin,
        schedTime: fidsDirection === 'departures' ? s.dep_time : s.arr_time,
        estTime,
        terminal,
        gate,
        carousel,
        aircraft: s.aircraft_name,
        status,
        statusZh,
        statusColor,
      };
    }).filter((item) => {
      if (!fidsSearch) return true;
      const q = fidsSearch.toLowerCase();
      return (
        item.flight_no.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        item.iata.toLowerCase().includes(q)
      );
    });
  }, [schedules, fidsAirport, fidsDirection, fidsSearch]);

  const activeAirportObj = airports.find((a) => a.iata === fidsAirport) || airports[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 select-none">
      {/* Top Header with Dual View Switcher */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#d1ccdc]/60 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#886f68]/15 text-[#886f68] text-xs font-semibold mb-2 tracking-wide uppercase">
            <Calendar className="w-3.5 h-3.5" />
            Global Flight Operations
          </div>
          <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#3d2c2e]">
            {viewMode === 'timetable' ? '定期航班時刻表' : '航廈實時起降看板 (FIDS)'}
          </h1>
          <p className="text-sm text-[#424c55] mt-1 max-w-2xl">
            {viewMode === 'timetable'
              ? '長榮航空提供綿密精準的全球越洋與區域航網，依據當季時刻表查詢直飛班次、執電機型與票價。'
              : '連線全球主要樞紐機場即時航廈電子儀表板，即時掌握登機門、行李轉盤與起降狀態。'}
          </p>
        </div>

        {/* View Mode Toggle Pill Bar */}
        <div className="flex items-center gap-1 bg-[#d1ccdc]/40 p-1.5 rounded-2xl border border-[#d1ccdc] shadow-2xs shrink-0">
          <button
            onClick={() => setViewMode('timetable')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'timetable'
                ? 'bg-[#3d2c2e] text-[#f5edf0] shadow-sm'
                : 'text-[#424c55] hover:text-[#3d2c2e] hover:bg-white/50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>定期航班時刻</span>
          </button>
          <button
            onClick={() => setViewMode('fids')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              viewMode === 'fids'
                ? 'bg-[#3d2c2e] text-[#f5edf0] shadow-sm'
                : 'text-[#424c55] hover:text-[#3d2c2e] hover:bg-white/50'
            }`}
          >
            <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span>航廈即時看板</span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-100 text-emerald-800 font-mono">LIVE</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODE 1: TIMETABLE VIEW */}
      {/* ============================================================ */}
      {viewMode === 'timetable' && (
        <div className="space-y-6">
          {/* Filter Toolbar */}
          <div className="bg-white/70 backdrop-blur-md rounded-2xl border border-[#d1ccdc] p-5 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Origin Airport Filter */}
              <div>
                <label className="block text-xs font-semibold text-[#424c55] uppercase tracking-wider mb-1.5">
                  出發機場 (Origin)
                </label>
                <select
                  value={originFilter}
                  onChange={(e) => setOriginFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-[#f5edf0]/60 border border-[#d1ccdc] text-[#3d2c2e] focus:outline-none focus:ring-1 focus:ring-[#886f68]"
                >
                  <option value="">全部出發地</option>
                  {airports.map((a) => (
                    <option key={a.iata} value={a.iata}>
                      {a.iata} - {a.city} ({a.name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination Airport Filter */}
              <div>
                <label className="block text-xs font-semibold text-[#424c55] uppercase tracking-wider mb-1.5">
                  抵達機場 (Destination)
                </label>
                <select
                  value={destinationFilter}
                  onChange={(e) => setDestinationFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-[#f5edf0]/60 border border-[#d1ccdc] text-[#3d2c2e] focus:outline-none focus:ring-1 focus:ring-[#886f68]"
                >
                  <option value="">全部目的地</option>
                  {airports.map((a) => (
                    <option key={a.iata} value={a.iata}>
                      {a.iata} - {a.city} ({a.name})
                    </option>
                  ))}
                </select>
              </div>

              {/* Aircraft Model Filter */}
              <div>
                <label className="block text-xs font-semibold text-[#424c55] uppercase tracking-wider mb-1.5">
                  執電機型 (Aircraft)
                </label>
                <select
                  value={aircraftFilter}
                  onChange={(e) => setAircraftFilter(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl bg-[#f5edf0]/60 border border-[#d1ccdc] text-[#3d2c2e] focus:outline-none focus:ring-1 focus:ring-[#886f68]"
                >
                  <option value="">全部機型</option>
                  <option value="B789">Boeing 787-9 Dreamliner</option>
                  <option value="B77W">Boeing 777-300ER</option>
                  <option value="A359">Airbus A350-900</option>
                  <option value="A21N">Airbus A321neo</option>
                </select>
              </div>

              {/* Day of Week Filter */}
              <div>
                <label className="block text-xs font-semibold text-[#424c55] uppercase tracking-wider mb-1.5">
                  每週執飛日 (Operating Day)
                </label>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSelectedDay(null)}
                    className={`flex-1 py-2 text-xs rounded-lg font-medium transition-colors ${
                      selectedDay === null
                        ? 'bg-[#3d2c2e] text-[#f5edf0]'
                        : 'bg-[#f5edf0]/60 border border-[#d1ccdc] text-[#424c55] hover:bg-[#d1ccdc]/40'
                    }`}
                  >
                    每日
                  </button>
                  {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                    <button
                      key={d}
                      onClick={() => setSelectedDay(selectedDay === d ? null : d)}
                      className={`w-7 py-2 text-xs rounded-lg font-mono font-medium transition-colors ${
                        selectedDay === d
                          ? 'bg-[#886f68] text-white'
                          : 'bg-[#f5edf0]/60 border border-[#d1ccdc] text-[#424c55] hover:bg-[#d1ccdc]/40'
                      }`}
                      title={dayLabels[d - 1]}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Schedules Result List */}
          <div className="space-y-4">
            {totalFiltered === 0 ? (
              <div className="text-center py-16 bg-white/40 rounded-2xl border border-dashed border-[#d1ccdc]">
                <Plane className="w-10 h-10 text-[#886f68] mx-auto mb-3 opacity-60" />
                <p className="text-base font-medium text-[#3d2c2e]">查無符合篩選條件的定期航班</p>
                <p className="text-xs text-[#424c55] mt-1">請嘗試調整您的出發地、目的地或執飛日期</p>
              </div>
            ) : (
              paginatedSchedules.map((schedule) => {
                const origAirport = airports.find((a) => a.iata === schedule.origin);
                const destAirport = airports.find((a) => a.iata === schedule.destination);
                const hours = Math.floor(schedule.duration_mins / 60);
                const mins = schedule.duration_mins % 60;

                return (
                  <div
                    key={schedule.flight_no}
                    className="bg-white/80 hover:bg-white rounded-2xl border border-[#d1ccdc]/70 hover:border-[#886f68]/70 p-5 sm:p-6 transition-all duration-200 shadow-sm hover:shadow-md group"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      {/* Flight Info & Times */}
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 items-center gap-4">
                        {/* Departure */}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-serif font-bold text-2xl text-[#3d2c2e]">
                              {schedule.dep_time}
                            </span>
                            <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-[#886f68]/15 text-[#886f68]">
                              {origAirport?.timezone || 'UTC+8'}
                            </span>
                          </div>
                          <p className="font-serif font-semibold text-lg text-[#3d2c2e] mt-1">
                            {schedule.origin} <span className="text-xs font-sans text-[#424c55] font-normal">({origAirport?.city})</span>
                          </p>
                          <p className="text-xs text-[#424c55]/80 truncate">{origAirport?.name}</p>
                        </div>

                        {/* Flight Path / Duration */}
                        <div className="flex flex-col items-center justify-center text-center px-2">
                          <div className="flex items-center gap-2 text-xs font-mono text-[#886f68]">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{hours}小時 {mins > 0 ? `${mins}分` : ''}</span>
                          </div>
                          <div className="relative w-full my-2 flex items-center justify-center">
                            <div className="w-full h-[1px] bg-[#d1ccdc]" />
                            <div className="absolute px-2 bg-white">
                              <Plane className="w-4 h-4 text-[#3d2c2e] transform rotate-90 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </div>
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            直飛 Direct
                          </span>
                        </div>

                        {/* Arrival */}
                        <div className="text-left sm:text-right">
                          <div className="flex items-center sm:justify-end gap-2">
                            <span className="font-serif font-bold text-2xl text-[#3d2c2e]">
                              {schedule.arr_time}
                            </span>
                            <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-[#886f68]/15 text-[#886f68]">
                              {destAirport?.timezone || 'UTC'}
                            </span>
                          </div>
                          <p className="font-serif font-semibold text-lg text-[#3d2c2e] mt-1">
                            {schedule.destination} <span className="text-xs font-sans text-[#424c55] font-normal">({destAirport?.city})</span>
                          </p>
                          <p className="text-xs text-[#424c55]/80 truncate">{destAirport?.name}</p>
                        </div>
                      </div>

                      {/* Flight Details & Booking CTA */}
                      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between lg:justify-end gap-4 border-t lg:border-t-0 lg:border-l border-[#d1ccdc]/60 pt-4 lg:pt-0 lg:pl-6">
                        <div className="flex flex-col text-left lg:text-right">
                          <div className="flex items-center gap-2 lg:justify-end">
                            <span className="font-serif font-bold text-base text-[#3d2c2e]">
                              {schedule.flight_no}
                            </span>
                            <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#424c55]/10 text-[#424c55]">
                              {schedule.aircraft_name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-[#424c55] mt-1 lg:justify-end">
                            <span>執飛週期:</span>
                            <div className="flex gap-0.5 font-mono text-[11px]">
                              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                                <span
                                  key={d}
                                  className={`w-4 h-4 rounded text-center leading-4 text-[10px] ${
                                    schedule.days.includes(d)
                                      ? 'bg-[#3d2c2e] text-[#f5edf0] font-bold'
                                      : 'text-[#d1ccdc] font-light'
                                  }`}
                                >
                                  {d}
                                </span>
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-[#886f68] mt-1 font-mono">
                            準點率 {schedule.on_time_rate}%
                          </span>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <div className="text-right hidden sm:block">
                            <p className="text-[11px] text-[#424c55]">單程預估</p>
                            <p className="text-sm font-bold font-mono text-[#3d2c2e]">
                              NT$ {schedule.base_price.toLocaleString()} <span className="text-[10px] font-normal text-[#424c55]">起</span>
                            </p>
                          </div>

                          <button
                            onClick={() => onBookFlight(schedule)}
                            className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-[#3d2c2e] hover:bg-[#3d2c2e]/90 text-[#f5edf0] text-xs font-semibold tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 border border-[#886f68]/40"
                          >
                            <span>預訂此班次</span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#886f68]" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Dynamic Pagination Controls Bar */}
          {totalFiltered > 0 && (
            <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-[#d1ccdc] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm mt-6">
              {/* Left: Summary Count */}
              <div className="text-xs text-[#424c55] font-medium">
                顯示第 <strong className="text-[#3d2c2e] font-mono">{startRecord}</strong> 至 <strong className="text-[#3d2c2e] font-mono">{endRecord}</strong> 筆，共 <strong className="text-[#3d2c2e] font-mono">{totalFiltered}</strong> 筆長榮定期航班
              </div>

              {/* Center: Page numbers */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 180, behavior: 'smooth' });
                  }}
                  disabled={safePage <= 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#f5edf0] border border-[#d1ccdc] text-[#424c55] hover:bg-[#d1ccdc]/40 disabled:opacity-30 disabled:hover:bg-[#f5edf0] transition-all"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>上一頁</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => {
                      setCurrentPage(pageNum);
                      window.scrollTo({ top: 180, behavior: 'smooth' });
                    }}
                    className={`w-8 h-8 rounded-xl text-xs font-mono font-bold transition-all ${
                      safePage === pageNum
                        ? 'bg-[#3d2c2e] text-[#f5edf0] shadow-sm ring-1 ring-[#886f68]/50'
                        : 'bg-white border border-[#d1ccdc] text-[#424c55] hover:bg-[#d1ccdc]/30'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 180, behavior: 'smooth' });
                  }}
                  disabled={safePage >= totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#f5edf0] border border-[#d1ccdc] text-[#424c55] hover:bg-[#d1ccdc]/40 disabled:opacity-30 disabled:hover:bg-[#f5edf0] transition-all"
                >
                  <span>下一頁</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Right: Page Size Selector */}
              <div className="flex items-center gap-2 text-xs text-[#424c55]">
                <span className="font-medium">每頁顯示：</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1 text-xs rounded-lg bg-[#f5edf0] border border-[#d1ccdc] text-[#3d2c2e] font-semibold focus:outline-none focus:ring-1 focus:ring-[#886f68]"
                >
                  <option value={5}>5 班次</option>
                  <option value={8}>8 班次</option>
                  <option value={12}>12 班次</option>
                  <option value={18}>全部 (18 班次)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* MODE 2: AIRPORT FIDS BOARD (航廈即時起降看板) */}
      {/* ============================================================ */}
      {viewMode === 'fids' && (
        <div className="space-y-6">
          {/* FIDS Hub Airport Selector & Live Ticking Clock */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#3d2c2e] text-[#f5edf0] p-5 rounded-3xl border border-[#886f68] shadow-lg">
            {/* Hub Selector */}
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase font-bold tracking-widest text-[#d1ccdc]">
                選擇樞紐機場:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { iata: 'TPE', city: '台北桃園' },
                  { iata: 'TSA', city: '台北松山' },
                  { iata: 'KHH', city: '高雄' },
                  { iata: 'LAX', city: '洛杉磯' },
                  { iata: 'NRT', city: '東京成田' },
                  { iata: 'LHR', city: '倫敦' },
                  { iata: 'SIN', city: '新加坡' },
                ].map((hub) => (
                  <button
                    key={hub.iata}
                    onClick={() => setFidsAirport(hub.iata)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      fidsAirport === hub.iata
                        ? 'bg-[#886f68] text-white shadow-xs ring-1 ring-white/40'
                        : 'bg-white/10 text-[#d1ccdc] hover:bg-white/20'
                    }`}
                  >
                    {hub.iata} {hub.city}
                  </button>
                ))}
              </div>
            </div>

            {/* Airport Local Live Clock */}
            <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-2xl border border-white/10">
              <Clock className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-[10px] text-[#d1ccdc] font-mono uppercase block">
                  {activeAirportObj.name} • 當地時間
                </span>
                <span className="font-mono font-bold text-sm sm:text-base text-amber-300 tracking-wider">
                  {currentTime.toLocaleDateString('zh-TW')} {currentTime.toLocaleTimeString('en-US', { hour12: false })}
                </span>
              </div>
            </div>
          </div>

          {/* FIDS Sub-tabs & Quick Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Departures vs Arrivals */}
            <div className="flex items-center gap-2 bg-white/80 p-1.5 rounded-2xl border border-[#d1ccdc] shadow-2xs">
              <button
                onClick={() => setFidsDirection('departures')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  fidsDirection === 'departures'
                    ? 'bg-[#3d2c2e] text-[#f5edf0] shadow-sm'
                    : 'text-[#424c55] hover:bg-[#d1ccdc]/30'
                }`}
              >
                <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                <span>出發航班 (DEPARTURES)</span>
              </button>
              <button
                onClick={() => setFidsDirection('arrivals')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  fidsDirection === 'arrivals'
                    ? 'bg-[#3d2c2e] text-[#f5edf0] shadow-sm'
                    : 'text-[#424c55] hover:bg-[#d1ccdc]/30'
                }`}
              >
                <ArrowDownLeft className="w-4 h-4 text-sky-400" />
                <span>抵達航班 (ARRIVALS)</span>
              </button>
            </div>

            {/* Search filter within FIDS */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-[#424c55] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜尋看板航班號或城市..."
                value={fidsSearch}
                onChange={(e) => setFidsSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs bg-white border border-[#d1ccdc] text-[#3d2c2e] focus:outline-none focus:ring-1 focus:ring-[#886f68] shadow-2xs"
              />
            </div>
          </div>

          {/* Authentic FIDS Split-Flap Dark Airport Display Board */}
          <div className="bg-[#1f262d] rounded-3xl border-2 border-[#424c55] shadow-2xl overflow-hidden text-white font-mono">
            {/* Board Header Bar */}
            <div className="bg-[#14191e] px-6 py-4 flex items-center justify-between border-b border-neutral-700/80">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-serif font-bold text-sm tracking-wider text-white">
                  {fidsAirport} AIRPORT FLIGHT INFORMATION DISPLAY SYSTEM
                </span>
                <span className="text-xs text-amber-400 font-bold hidden md:inline">
                  [{fidsDirection.toUpperCase()}]
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-neutral-400">
                <span className="hidden sm:inline">TERMINAL 1 & 2</span>
                <span className="text-emerald-400 font-bold">ALL SYSTEMS NORMAL</span>
              </div>
            </div>

            {/* FIDS Table Header */}
            <div className="grid grid-cols-12 gap-3 px-6 py-3 bg-[#242b32] text-[11px] font-bold text-neutral-400 uppercase tracking-wider border-b border-neutral-700">
              <div className="col-span-2">時間 (TIME)</div>
              <div className="col-span-2">航班 (FLIGHT)</div>
              <div className="col-span-3">
                {fidsDirection === 'departures' ? '目的地 (DESTINATION)' : '出發地 (ORIGIN)'}
              </div>
              <div className="col-span-1 text-center">航廈</div>
              <div className="col-span-1 text-center">
                {fidsDirection === 'departures' ? '登機門' : '轉盤'}
              </div>
              <div className="col-span-2 text-center">狀態 (STATUS)</div>
              <div className="col-span-1 text-right">預訂</div>
            </div>

            {/* FIDS Table Rows */}
            <div className="divide-y divide-neutral-800">
              {fidsEntries.length === 0 ? (
                <div className="py-12 text-center text-neutral-400 text-xs">
                  查無該樞紐目前符合條件之實時航班
                </div>
              ) : (
                fidsEntries.map((row) => (
                  <div
                    key={row.flight_no}
                    className="grid grid-cols-12 gap-3 px-6 py-3.5 items-center hover:bg-neutral-800/60 transition-colors text-xs"
                  >
                    {/* Time */}
                    <div className="col-span-2 flex items-center gap-2">
                      <span className="font-bold text-amber-300 text-sm tracking-wider">
                        {row.schedTime}
                      </span>
                    </div>

                    {/* Flight No */}
                    <div className="col-span-2 flex items-center gap-2">
                      <span className="font-bold text-white tracking-widest text-sm">
                        {row.flight_no}
                      </span>
                    </div>

                    {/* City / Destination / Origin */}
                    <div className="col-span-3">
                      <div className="font-bold text-white text-sm tracking-wide">
                        {row.city.toUpperCase()}
                      </div>
                      <span className="text-[10px] text-neutral-400">
                        {row.iata} • {row.aircraft}
                      </span>
                    </div>

                    {/* Terminal */}
                    <div className="col-span-1 text-center font-bold text-amber-200">
                      {row.terminal}
                    </div>

                    {/* Gate or Baggage Carousel */}
                    <div className="col-span-1 text-center">
                      <span className="px-2 py-0.5 rounded bg-neutral-700 text-amber-300 font-bold text-xs border border-neutral-600">
                        {fidsDirection === 'departures' ? row.gate : row.carousel}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="col-span-2 text-center">
                      <span className={`font-bold tracking-wider text-xs ${row.statusColor}`}>
                        {row.status} ({row.statusZh})
                      </span>
                    </div>

                    {/* Quick Book CTA */}
                    <div className="col-span-1 text-right">
                      <button
                        onClick={() => onBookFlight(row.schedule)}
                        className="px-2.5 py-1 rounded bg-[#886f68] hover:bg-[#886f68]/80 text-white text-[11px] font-bold transition-all shadow-xs active:scale-95"
                        title="立即預訂此班次"
                      >
                        訂票
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Status Ticker */}
            <div className="bg-[#14191e] px-6 py-3 border-t border-neutral-700 flex items-center justify-between text-[11px] text-neutral-400">
              <div className="flex items-center gap-2">
                <span className="text-amber-400">NOTICE:</span>
                <span>旅客請提前於起飛前 2.5 小時至長榮航空櫃檯辦理登機報到與行李託運手續</span>
              </div>
              <span className="text-neutral-500 font-mono">AUTOMATIC REFRESH • ACTIVE</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
