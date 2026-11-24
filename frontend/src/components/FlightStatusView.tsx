import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FlightSchedule, Airport } from '../types';
import { 
  Search, 
  Plane, 
  Clock, 
  MapPin, 
  Compass, 
  Gauge, 
  ArrowUpRight, 
  ArrowRight, 
  Radio, 
  Wifi, 
  Tv, 
  Utensils, 
  ShieldCheck, 
  AlertCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

interface FlightStatusViewProps {
  onNavigateToRadar?: (flightNo?: string) => void;
  onBookFlight?: (flight: FlightSchedule) => void;
}

export const FlightStatusView: React.FC<FlightStatusViewProps> = ({ 
  onNavigateToRadar, 
  onBookFlight 
}) => {
  const [searchFlightNo, setSearchFlightNo] = useState<string>('BR12');
  const [flightData, setFlightData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const popularFlights = [
    { no: 'BR12', label: 'BR12 (台北 ➔ 洛杉磯)' },
    { no: 'BR198', label: 'BR198 (台北 ➔ 東京成田)' },
    { no: 'BR28', label: 'BR28 (台北 ➔ 舊金山)' },
    { no: 'BR871', label: 'BR871 (台北 ➔ 香港)' },
    { no: 'BR67', label: 'BR67 (台北 ➔ 倫敦希斯洛)' },
    { no: 'BR225', label: 'BR225 (台北 ➔ 新加坡)' },
  ];

  const handleSearch = async (targetFlightNo?: string) => {
    const queryNo = (targetFlightNo || searchFlightNo).toUpperCase().trim();
    if (!queryNo) {
      setErrorMsg('請輸入長榮航空航班編號（如 BR12）');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const data = await api.getFlightStatus(queryNo);
      setFlightData(data);
    } catch (err: any) {
      setErrorMsg(err.message || '查無此航班資料，請檢查航班編號');
      setFlightData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto query default flight BR12 on mount
  useEffect(() => {
    handleSearch('BR12');
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 select-none">
      {/* Top Banner Header */}
      <div className="mb-8 border-b border-[#d1ccdc]/60 pb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#886f68]/15 text-[#886f68] text-xs font-semibold mb-2 tracking-wide uppercase">
          <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          Real-Time Flight Status Tracking
        </div>
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#3d2c2e]">
          航班動態即時查詢
        </h1>
        <p className="text-sm text-[#424c55] mt-1 max-w-2xl">
          輸入長榮航空班號，即刻連線全球航管遙測系統，掌握起降時間、航廈登機門、行李轉盤與在空飛行軌跡。
        </p>
      </div>

      {/* Search Input Box Card */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-[#d1ccdc] p-6 shadow-md mb-8">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-[#886f68] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="輸入長榮班號（如 BR12, BR198, BR28, BR871）..."
              value={searchFlightNo}
              onChange={(e) => setSearchFlightNo(e.target.value.toUpperCase())}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#f5edf0]/60 border border-[#d1ccdc] text-[#3d2c2e] font-mono text-base font-bold placeholder:font-sans placeholder:font-normal placeholder:text-[#424c55]/60 focus:outline-none focus:ring-2 focus:ring-[#886f68] shadow-2xs"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-[#3d2c2e] hover:bg-[#3d2c2e]/90 text-[#f5edf0] text-sm font-bold tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 border border-[#886f68]/40 shrink-0"
          >
            <Search className="w-4 h-4 text-[#886f68]" />
            <span>{isLoading ? '查詢中...' : '查詢航班動態'}</span>
          </button>
        </form>

        {/* Popular Quick Select Chips */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-[#d1ccdc]/60">
          <span className="text-xs text-[#886f68] font-bold">熱門航班快選:</span>
          {popularFlights.map((f) => (
            <button
              key={f.no}
              type="button"
              onClick={() => {
                setSearchFlightNo(f.no);
                handleSearch(f.no);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-medium transition-all ${
                searchFlightNo === f.no
                  ? 'bg-[#3d2c2e] text-white shadow-xs'
                  : 'bg-[#f5edf0] border border-[#d1ccdc] text-[#424c55] hover:bg-[#d1ccdc]/40'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {errorMsg && (
        <div className="mb-8 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Flight Status Result Card */}
      {flightData && (
        <div className="bg-white rounded-3xl border-2 border-[#d1ccdc] shadow-xl overflow-hidden transition-all animate-in fade-in duration-300">
          {/* Card Top Banner */}
          <div className="bg-[#3d2c2e] text-[#f5edf0] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-[#886f68]">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-[#886f68]/60 shadow-inner">
                <Plane className="w-7 h-7 text-[#d1ccdc] transform -rotate-45" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-serif font-bold text-3xl sm:text-4xl tracking-tight">
                    {flightData.flight_no}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#886f68]/30 border border-[#886f68]/60 text-[#d1ccdc]">
                    {flightData.tail_no}
                  </span>
                </div>
                <p className="text-xs text-[#d1ccdc]/90 font-medium mt-1">
                  執電機型：{flightData.aircraft_name} ({flightData.aircraft})
                </p>
              </div>
            </div>

            {/* Status Pill */}
            <div className="flex flex-col sm:items-end">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 text-xs font-bold font-mono tracking-wider shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{flightData.status_label}</span>
              </div>
              <span className="text-[11px] text-[#d1ccdc]/70 mt-1.5 font-mono">
                {flightData.status_desc}
              </span>
            </div>
          </div>

          {/* Route Progression Banner */}
          <div className="p-6 sm:p-8 border-b border-[#d1ccdc]/60 bg-[#f5edf0]/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Departure Airport Box */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#886f68] uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>出發地 (ORIGIN)</span>
                </div>
                <p className="font-serif font-bold text-3xl sm:text-4xl text-[#3d2c2e]">
                  {flightData.origin?.iata}
                </p>
                <p className="text-sm font-semibold text-[#424c55]">
                  {flightData.origin?.city} ({flightData.origin?.name})
                </p>
                <div className="pt-2 text-xs font-mono space-y-0.5">
                  <p className="text-[#3d2c2e]">計畫起飛：<strong>{flightData.scheduled_dep_time}</strong> ({flightData.origin?.timezone || 'UTC+8'})</p>
                  <p className="text-emerald-700">預計起飛：<strong>{flightData.estimated_dep_time}</strong> (準時)</p>
                </div>
              </div>

              {/* Progress Mid-bar */}
              <div className="flex flex-col items-center justify-center text-center px-4">
                <div className="flex items-center gap-2 text-xs font-mono text-[#886f68] mb-1 font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>航程準點率 {flightData.on_time_rate}%</span>
                </div>

                <div className="relative w-full my-3 flex items-center justify-center">
                  <div className="w-full bg-[#d1ccdc] h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#3d2c2e] h-full rounded-full transition-all duration-700"
                      style={{ width: `${flightData.telemetry?.progress_percent || 65}%` }}
                    />
                  </div>
                  <div className="absolute px-2 bg-white rounded-full border border-[#d1ccdc] shadow-xs">
                    <Plane className="w-4 h-4 text-[#3d2c2e] transform rotate-90" />
                  </div>
                </div>

                <span className="text-[11px] font-mono text-[#424c55] font-semibold">
                  {flightData.is_airborne ? `航程已完成 ${flightData.telemetry?.progress_percent || 0}%` : '直飛 Direct Flight'}
                </span>
              </div>

              {/* Arrival Airport Box */}
              <div className="space-y-1 text-left md:text-right">
                <div className="flex items-center md:justify-end gap-2 text-xs font-bold text-[#886f68] uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>目的地 (DESTINATION)</span>
                </div>
                <p className="font-serif font-bold text-3xl sm:text-4xl text-[#3d2c2e]">
                  {flightData.destination?.iata}
                </p>
                <p className="text-sm font-semibold text-[#424c55]">
                  {flightData.destination?.city} ({flightData.destination?.name})
                </p>
                <div className="pt-2 text-xs font-mono space-y-0.5">
                  <p className="text-[#3d2c2e]">計畫抵達：<strong>{flightData.scheduled_arr_time}</strong> ({flightData.destination?.timezone || 'UTC'})</p>
                  <p className="text-emerald-700">預計抵達：<strong>{flightData.estimated_arr_time}</strong></p>
                </div>
              </div>
            </div>
          </div>

          {/* Terminal & Airport Gate Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#d1ccdc]/60 border-b border-[#d1ccdc]/60 bg-white">
            <div className="p-5 text-center">
              <span className="text-[10px] uppercase font-bold text-[#424c55] tracking-wider block">
                航廈 (TERMINAL)
              </span>
              <p className="font-serif font-bold text-2xl text-[#3d2c2e] mt-1">
                {flightData.terminal}
              </p>
              <span className="text-[10px] text-[#886f68]">長榮航空專屬報到專區</span>
            </div>

            <div className="p-5 text-center">
              <span className="text-[10px] uppercase font-bold text-[#424c55] tracking-wider block">
                登機門 (DEPARTURE GATE)
              </span>
              <p className="font-serif font-bold text-2xl text-[#3d2c2e] mt-1 text-emerald-800">
                {flightData.gate}
              </p>
              <span className="text-[10px] text-[#886f68]">起飛前 40 分鐘開始登機</span>
            </div>

            <div className="p-5 text-center">
              <span className="text-[10px] uppercase font-bold text-[#424c55] tracking-wider block">
                行李提領轉盤 (BAGGAGE BELT)
              </span>
              <p className="font-serif font-bold text-2xl text-[#3d2c2e] mt-1">
                {flightData.baggage_carousel}
              </p>
              <span className="text-[10px] text-[#886f68]">入境大廳行李提領專用</span>
            </div>
          </div>

          {/* Airborne Avionics Telemetry (If Flight is currently in the air) */}
          {flightData.is_airborne && flightData.telemetry && (
            <div className="p-6 bg-[#f5edf0]/60 border-b border-[#d1ccdc]/60">
              <div className="flex items-center gap-2 mb-3">
                <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span className="font-serif font-bold text-sm text-[#3d2c2e]">即時在空航電遙測數據 (Live Avionics Telemetry)</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-3.5 rounded-2xl border border-[#d1ccdc] shadow-2xs">
                  <div className="flex items-center gap-1.5 text-xs text-[#424c55] font-medium mb-1">
                    <ArrowUpRight className="w-3.5 h-3.5 text-[#886f68]" /> 巡航高度
                  </div>
                  <p className="font-mono font-bold text-lg text-[#3d2c2e]">
                    FL{Math.round(flightData.telemetry.altitude_ft / 100)}
                  </p>
                  <span className="text-[10px] text-[#886f68] font-mono">{flightData.telemetry.altitude_ft.toLocaleString()} FT</span>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-[#d1ccdc] shadow-2xs">
                  <div className="flex items-center gap-1.5 text-xs text-[#424c55] font-medium mb-1">
                    <Gauge className="w-3.5 h-3.5 text-[#886f68]" /> 即時地速
                  </div>
                  <p className="font-mono font-bold text-lg text-[#3d2c2e]">
                    {flightData.telemetry.ground_speed_kts} <span className="text-xs font-normal">KTS</span>
                  </p>
                  <span className="text-[10px] text-[#886f68] font-mono">Mach {(flightData.telemetry.ground_speed_kts / 574).toFixed(2)}</span>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-[#d1ccdc] shadow-2xs">
                  <div className="flex items-center gap-1.5 text-xs text-[#424c55] font-medium mb-1">
                    <Compass className="w-3.5 h-3.5 text-[#886f68]" /> 航向方位
                  </div>
                  <p className="font-mono font-bold text-lg text-[#3d2c2e]">
                    {Math.round(flightData.telemetry.heading)}°
                  </p>
                  <span className="text-[10px] text-emerald-700 font-semibold">TRUE HEADING</span>
                </div>

                <div className="bg-white p-3.5 rounded-2xl border border-[#d1ccdc] shadow-2xs">
                  <div className="flex items-center gap-1.5 text-xs text-[#424c55] font-medium mb-1">
                    <Clock className="w-3.5 h-3.5 text-[#886f68]" /> 預估剩餘航程
                  </div>
                  <p className="font-mono font-bold text-lg text-[#3d2c2e]">
                    {Math.floor(flightData.telemetry.remaining_mins / 60)}h {flightData.telemetry.remaining_mins % 60}m
                  </p>
                  <span className="text-[10px] text-[#886f68] font-mono">預計抵達 {flightData.telemetry.eta}</span>
                </div>
              </div>
            </div>
          )}

          {/* Cabin Amenities & Action Footer */}
          <div className="p-6 sm:p-8 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-[#424c55] mr-1">客艙服務配備:</span>
              <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-[#f5edf0] border border-[#d1ccdc] text-[#3d2c2e]">
                <Wifi className="w-3 h-3 text-[#886f68]" /> 全航程衛星Wi-Fi
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-[#f5edf0] border border-[#d1ccdc] text-[#3d2c2e]">
                <Tv className="w-3 h-3 text-[#886f68]" /> Panasonic 高解析影音
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-[#f5edf0] border border-[#d1ccdc] text-[#3d2c2e]">
                <Utensils className="w-3 h-3 text-[#886f68]" /> 主廚珍饌預選
              </span>
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-3">
              {onNavigateToRadar && (
                <button
                  onClick={() => onNavigateToRadar(flightData.flight_no)}
                  className="px-5 py-2.5 rounded-xl border border-[#886f68] bg-white hover:bg-[#d1ccdc]/30 text-[#3d2c2e] text-xs font-bold transition-all shadow-2xs flex items-center gap-2 active:scale-95"
                >
                  <Radio className="w-4 h-4 text-emerald-600" />
                  <span>全球雷達追蹤</span>
                </button>
              )}

              {onBookFlight && flightData.schedule && (
                <button
                  onClick={() => onBookFlight(flightData.schedule)}
                  className="px-6 py-2.5 rounded-xl bg-[#3d2c2e] hover:bg-[#3d2c2e]/90 text-[#f5edf0] text-xs font-bold tracking-wider flex items-center gap-2 shadow-md transition-all active:scale-95 border border-[#886f68]/50"
                >
                  <span>立即預訂此班次</span>
                  <ChevronRight className="w-4 h-4 text-[#886f68]" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
