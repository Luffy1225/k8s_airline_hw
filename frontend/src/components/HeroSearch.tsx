import React, { useState } from 'react';
import { Airport, FlightSchedule } from '../types';
import { api } from '../services/api';
import {
  Search,
  ArrowRightLeft,
  Plane,
  Clock,
  Sparkles,
  ShieldCheck,
  Globe2,
  ChevronRight,
  Award,
  Compass,
  ArrowRight,
  Luggage,
  Star
} from 'lucide-react';

interface HeroSearchProps {
  airports: Airport[];
  onSelectFlight: (flight: FlightSchedule) => void;
  airborneCount: number;
  onNavigateToMap?: () => void;
}

export const HeroSearch: React.FC<HeroSearchProps> = ({
  airports,
  onSelectFlight,
  airborneCount,
  onNavigateToMap,
}) => {
  const [tripType, setTripType] = useState<'round' | 'oneway'>('oneway');
  const [origin, setOrigin] = useState<string>('TPE');
  const [destination, setDestination] = useState<string>('LAX');
  const [departDate, setDepartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [cabinClass, setCabinClass] = useState<string>('economy');
  const [passengers, setPassengers] = useState<number>(1);

  const [searchResults, setSearchResults] = useState<FlightSchedule[] | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searched, setSearched] = useState<boolean>(false);

  const handleSwapAirports = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSearching(true);
    setSearched(true);
    try {
      const results = await api.searchFlights({
        origin,
        destination,
        date: departDate,
        cabin: cabinClass,
      });
      setSearchResults(results);
    } catch (err) {
      console.error(err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleQuickBook = (origIata: string, destIata: string) => {
    setOrigin(origIata);
    setDestination(destIata);
    setIsSearching(true);
    setSearched(true);
    api.searchFlights({ origin: origIata, destination: destIata, date: departDate, cabin: cabinClass })
      .then((results) => {
        setSearchResults(results);
        window.scrollTo({ top: 480, behavior: 'smooth' });
      })
      .finally(() => setIsSearching(false));
  };

  const featuredDestinations = [
    {
      city: '東京 (Tokyo)',
      airport: 'NRT / HND',
      country: '日本 Japan',
      price: 'NT$ 14,200',
      aircraft: 'B787-9 夢幻客機執飛',
      desc: '每日早午直飛東京成田與羽田機場，尊享最舒適精緻的日式高空款待。',
      orig: 'TPE',
      dest: 'NRT',
      tag: '東北亞熱門首選',
      image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=800&auto=format&fit=crop',
    },
    {
      city: '洛杉磯 (Los Angeles)',
      airport: 'LAX',
      country: '美國 USA',
      price: 'NT$ 28,500',
      aircraft: 'B777-300ER 旗艦直航',
      desc: '跨太平洋指標長程旗艦，配備全平躺 1-2-1 獨立反魚骨皇璽商務艙。',
      orig: 'TPE',
      dest: 'LAX',
      tag: '跨太平洋旗艦',
      image: 'https://images.unsplash.com/photo-1580655653885-65763b2597d0?q=80&w=800&auto=format&fit=crop',
    },
    {
      city: '倫敦 (London)',
      airport: 'LHR 希斯洛',
      country: '英國 UK',
      price: 'NT$ 38,900',
      aircraft: 'B777-300ER 直飛航班',
      desc: '台北直飛倫敦希斯洛第二航廈 Queen\'s Terminal，優雅抵達英倫大都會。',
      orig: 'TPE',
      dest: 'LHR',
      tag: '歐洲直飛推薦',
      image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=800&auto=format&fit=crop',
    },
    {
      city: '巴黎 (Paris)',
      airport: 'CDG 戴高樂',
      country: '法國 France',
      price: 'NT$ 37,500',
      aircraft: 'B787-9 夢幻客機',
      desc: '直達浪漫花都巴黎，全艙配備高科技星空舒緩情境燈光與星級機上美饌。',
      orig: 'TPE',
      dest: 'CDG',
      tag: '時尚花都首選',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop',
    },
    {
      city: '舊金山 (San Francisco)',
      airport: 'SFO',
      country: '美國 USA',
      price: 'NT$ 27,200',
      aircraft: 'B777-300ER 高速客機',
      desc: '每日飛往美國西岸高科技重鎮矽谷，全機高速衛星 Wi-Fi 保持商務無縫連接。',
      orig: 'TPE',
      dest: 'SFO',
      tag: '商務精英首選',
      image: 'https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?q=80&w=800&auto=format&fit=crop',
    },
    {
      city: '新加坡 (Singapore)',
      airport: 'SIN 樟宜機場',
      country: '新加坡 Singapore',
      price: 'NT$ 16,800',
      aircraft: 'A350-900 廣體客機',
      desc: '串聯東南亞主要交通樞紐，超靜音寬體客艙設計，輕鬆漫遊南向花園城市。',
      orig: 'TPE',
      dest: 'SIN',
      tag: '東南亞精品樞紐',
      image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=800&auto=format&fit=crop',
    },
  ];

  return (
    <div className="w-full bg-[#f5edf0]">
      {/* Hero Header Area with Atmospheric Gradient & Soft Lighting */}
      <div className="relative bg-gradient-to-b from-[#3d2c2e] via-[#424c55] to-[#f5edf0] text-white pt-20 pb-36 px-6 lg:px-8 overflow-hidden select-none">
        {/* Subtle geometric and atmospheric accents */}
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#d1ccdc_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute top-0 right-10 w-[500px] h-[500px] bg-[#886f68]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-[#d1ccdc]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-[#886f68]/70 text-xs font-semibold text-[#d1ccdc] tracking-widest uppercase">
            <Award className="w-4 h-4 text-[#886f68]" />
            SKYTRAX 五星級全球航空公司 • 頂級飛行美學
          </div>

          <h1 className="font-serif font-bold text-5xl lg:text-7xl tracking-tight text-white leading-tight drop-shadow-sm">
            以典雅，翱翔世界每一角落
          </h1>

          <p className="text-base lg:text-lg text-[#d1ccdc] max-w-3xl mx-auto font-light leading-relaxed">
            長榮航空提供頂級皇璽商務艙、豪華經濟艙與極致細膩的高空款待，連接全球各大樞紐，為您的每趟旅程譜寫尊榮體驗。
          </p>

          {/* Quick Metrics Bar */}
          <div className="flex justify-center items-center gap-8 pt-4 text-xs font-mono text-[#d1ccdc]">
            <div className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-sm border border-white/10">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-white">{airborneCount}</span>
              <span>架長榮客機即時在空執飛</span>
            </div>
            <div>•</div>
            <div>20 個國際樞紐航點</div>
            <div>•</div>
            <div>97.4% 全航線平均準點率</div>
          </div>
        </div>
      </div>

      {/* Floating Flight Search Widget - Desktop Luxury Layout */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 -mt-24 relative z-20">
        <div className="bg-white rounded-3xl border border-[#d1ccdc] shadow-2xl p-8">
          {/* Top Bar: Trip Type & Cabin Class Selector */}
          <div className="flex items-center justify-between border-b border-[#d1ccdc]/60 pb-6 mb-6">
            <div className="flex items-center gap-2 bg-[#f5edf0] p-1.5 rounded-2xl border border-[#d1ccdc]">
              <button
                type="button"
                onClick={() => setTripType('oneway')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  tripType === 'oneway'
                    ? 'bg-[#3d2c2e] text-[#f5edf0] shadow-xs'
                    : 'text-[#424c55] hover:text-[#3d2c2e]'
                }`}
              >
                單程 (One-way)
              </button>
              <button
                type="button"
                onClick={() => setTripType('round')}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                  tripType === 'round'
                    ? 'bg-[#3d2c2e] text-[#f5edf0] shadow-xs'
                    : 'text-[#424c55] hover:text-[#3d2c2e]'
                }`}
              >
                來回 (Round-trip)
              </button>
            </div>

            <div className="flex items-center gap-6 text-xs font-medium text-[#424c55]">
              {/* Cabin Class */}
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-[#886f68] uppercase tracking-wider text-[11px]">客艙等級:</span>
                <select
                  value={cabinClass}
                  onChange={(e) => setCabinClass(e.target.value)}
                  className="px-4 py-2 rounded-xl border border-[#d1ccdc] bg-[#f5edf0] text-[#3d2c2e] font-bold text-xs focus:outline-none focus:ring-1 focus:ring-[#886f68] cursor-pointer"
                >
                  <option value="economy">經濟艙 (Economy)</option>
                  <option value="premium">豪華經濟艙 (Premium Eco)</option>
                  <option value="business">皇璽商務艙 (Royal Laurel)</option>
                </select>
              </div>

              {/* Passengers */}
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-[#886f68] uppercase tracking-wider text-[11px]">旅客人數:</span>
                <select
                  value={passengers}
                  onChange={(e) => setPassengers(Number(e.target.value))}
                  className="px-4 py-2 rounded-xl border border-[#d1ccdc] bg-[#f5edf0] text-[#3d2c2e] font-bold text-xs focus:outline-none focus:ring-1 focus:ring-[#886f68] cursor-pointer"
                >
                  <option value={1}>1 位成人 (Adult)</option>
                  <option value={2}>2 位成人 (Adults)</option>
                  <option value={3}>3 位成人 (Adults)</option>
                  <option value={4}>4 位成人 (Adults)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Search Inputs Grid - High Precision Desktop Form */}
          <form onSubmit={handleSearch} className="grid grid-cols-12 gap-3.5 items-center">
            {/* Origin (From) */}
            <div className="col-span-3 bg-[#f5edf0]/80 border border-[#d1ccdc] rounded-2xl p-3.5 focus-within:ring-2 focus-within:ring-[#886f68]/40 focus-within:bg-white transition-all">
              <span className="text-[10px] font-bold text-[#886f68] uppercase tracking-wider block">
                出發地 (FROM)
              </span>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-transparent font-serif font-bold text-lg text-[#3d2c2e] focus:outline-none cursor-pointer mt-1"
              >
                {airports.map((a) => (
                  <option key={a.iata} value={a.iata}>
                    {a.iata} - {a.city}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-[#424c55] block truncate mt-0.5">
                {airports.find((a) => a.iata === origin)?.name}
              </span>
            </div>

            {/* Swap Button */}
            <div className="col-span-1 flex justify-center">
              <button
                type="button"
                onClick={handleSwapAirports}
                title="互換出發地與目的地"
                className="w-11 h-11 rounded-full bg-white border border-[#d1ccdc] text-[#424c55] hover:text-[#3d2c2e] hover:border-[#886f68] hover:bg-[#d1ccdc]/20 flex items-center justify-center shadow-xs transition-all active:rotate-180"
              >
                <ArrowRightLeft className="w-4 h-4 text-[#886f68]" />
              </button>
            </div>

            {/* Destination (To) */}
            <div className="col-span-3 bg-[#f5edf0]/80 border border-[#d1ccdc] rounded-2xl p-3.5 focus-within:ring-2 focus-within:ring-[#886f68]/40 focus-within:bg-white transition-all">
              <span className="text-[10px] font-bold text-[#886f68] uppercase tracking-wider block">
                目的地 (TO)
              </span>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-transparent font-serif font-bold text-lg text-[#3d2c2e] focus:outline-none cursor-pointer mt-1"
              >
                {airports.map((a) => (
                  <option key={a.iata} value={a.iata}>
                    {a.iata} - {a.city}
                  </option>
                ))}
              </select>
              <span className="text-[11px] text-[#424c55] block truncate mt-0.5">
                {airports.find((a) => a.iata === destination)?.name}
              </span>
            </div>

            {/* Departure Date */}
            <div className="col-span-3 bg-[#f5edf0]/80 border border-[#d1ccdc] rounded-2xl p-3.5 focus-within:ring-2 focus-within:ring-[#886f68]/40 focus-within:bg-white transition-all">
              <span className="text-[10px] font-bold text-[#886f68] uppercase tracking-wider block">
                出發日期 (DEPARTURE)
              </span>
              <input
                type="date"
                value={departDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setDepartDate(e.target.value)}
                className="w-full bg-transparent font-mono font-bold text-base text-[#3d2c2e] focus:outline-none mt-1"
              />
              <span className="text-[11px] text-[#424c55] block mt-0.5">
                {tripType === 'round' ? '單趟航程出發日 (回程另計)' : '單程航班出發日'}
              </span>
            </div>

            {/* Search Submit CTA */}
            <div className="col-span-2">
              <button
                type="submit"
                disabled={isSearching}
                className="w-full py-4 px-4 rounded-2xl bg-[#3d2c2e] hover:bg-[#3d2c2e]/90 text-[#f5edf0] font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 border border-[#886f68]/60 disabled:opacity-50 h-[74px]"
              >
                <Search className="w-4 h-4 text-[#886f68]" />
                <span>{isSearching ? '搜尋中...' : '搜尋優惠航班'}</span>
              </button>
            </div>
          </form>

          {/* Quick Route Shortcut Chips */}
          <div className="mt-6 pt-4 border-t border-[#d1ccdc]/60 flex items-center gap-3 text-xs text-[#424c55]">
            <span className="font-bold text-[#886f68] shrink-0">熱門經典航線快捷：</span>
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { orig: 'TPE', dest: 'LAX', label: '台北 ➔ 洛杉磯', price: 'NT$ 28,500' },
                { orig: 'TPE', dest: 'NRT', label: '台北 ➔ 東京成田', price: 'NT$ 14,200' },
                { orig: 'TPE', dest: 'LHR', label: '台北 ➔ 倫敦希斯洛', price: 'NT$ 38,900' },
                { orig: 'TPE', dest: 'CDG', label: '台北 ➔ 巴黎戴高樂', price: 'NT$ 37,500' },
              ].map((r) => (
                <button
                  key={r.label}
                  type="button"
                  onClick={() => handleQuickBook(r.orig, r.dest)}
                  className="px-3.5 py-1.5 rounded-full bg-[#f5edf0] hover:bg-[#d1ccdc]/60 border border-[#d1ccdc] text-[#3d2c2e] transition-colors flex items-center gap-2 font-medium shadow-2xs hover:border-[#886f68]"
                >
                  <span>{r.label}</span>
                  <span className="text-[11px] font-mono text-[#886f68] font-bold">{r.price}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Search Results Display Area */}
      {searched && (
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14">
          <div className="flex items-center justify-between border-b border-[#d1ccdc] pb-4 mb-6">
            <div>
              <h2 className="font-serif font-bold text-3xl text-[#3d2c2e]">
                搜尋結果 (Available Flights)
              </h2>
              <p className="text-xs text-[#424c55] mt-1 font-medium">
                {origin} ➔ {destination} • {departDate} • {cabinClass.toUpperCase()}
              </p>
            </div>
            <span className="text-xs font-mono text-[#886f68] font-bold">
              共找到 {searchResults?.length || 0} 個直飛班次
            </span>
          </div>

          {searchResults && searchResults.length > 0 ? (
            <div className="space-y-4">
              {searchResults.map((flight) => {
                const hours = Math.floor(flight.duration_mins / 60);
                const mins = flight.duration_mins % 60;
                const standardPrice = flight.fares?.standard.price || flight.base_price;

                return (
                  <div
                    key={flight.flight_no}
                    className="bg-white rounded-3xl border border-[#d1ccdc] p-6 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-8"
                  >
                    {/* Flight Timetable Column */}
                    <div className="flex-1 grid grid-cols-3 items-center gap-6 text-left">
                      <div>
                        <span className="font-serif font-bold text-3xl text-[#3d2c2e] block">
                          {flight.dep_time}
                        </span>
                        <span className="font-serif font-semibold text-xl text-[#3d2c2e]">
                          {flight.origin}
                        </span>
                        <span className="text-xs text-[#424c55] block truncate mt-0.5">
                          {flight.origin_airport?.city} ({flight.origin_airport?.name})
                        </span>
                      </div>

                      <div className="text-center">
                        <span className="text-xs font-mono text-[#886f68] flex items-center justify-center gap-1 font-semibold">
                          <Clock className="w-3.5 h-3.5" />
                          {hours}小時 {mins > 0 ? `${mins}分` : ''}
                        </span>
                        <div className="relative my-2 flex items-center justify-center">
                          <div className="w-full h-[1px] bg-[#d1ccdc]" />
                          <Plane className="w-4 h-4 text-[#886f68] absolute bg-white px-0.5 transform rotate-90" />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          直飛 Direct
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="font-serif font-bold text-3xl text-[#3d2c2e] block">
                          {flight.arr_time}
                        </span>
                        <span className="font-serif font-semibold text-xl text-[#3d2c2e]">
                          {flight.destination}
                        </span>
                        <span className="text-xs text-[#424c55] block truncate mt-0.5">
                          {flight.destination_airport?.city} ({flight.destination_airport?.name})
                        </span>
                      </div>
                    </div>

                    {/* Aircraft & Pricing CTA */}
                    <div className="flex items-center gap-8 border-l border-[#d1ccdc]/60 pl-8 shrink-0">
                      <div className="text-right">
                        <span className="font-serif font-bold text-base text-[#3d2c2e] block">
                          {flight.flight_no}
                        </span>
                        <span className="text-xs text-[#424c55] block font-medium">
                          {flight.aircraft_name}
                        </span>
                        <p className="font-serif font-bold text-2xl text-[#3d2c2e] mt-1">
                          NT$ {standardPrice.toLocaleString()}
                          <span className="text-xs font-sans text-[#424c55] font-normal"> 起/人</span>
                        </p>
                      </div>

                      <button
                        onClick={() => onSelectFlight(flight)}
                        className="px-7 py-3.5 rounded-2xl bg-[#3d2c2e] hover:bg-[#3d2c2e]/90 text-[#f5edf0] text-xs font-bold tracking-wider flex items-center gap-2 shadow-md transition-all active:scale-95 border border-[#886f68]/40"
                      >
                        <span>選擇此航班</span>
                        <ChevronRight className="w-4 h-4 text-[#886f68]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-[#d1ccdc]">
              <Plane className="w-12 h-12 text-[#886f68] mx-auto mb-3 opacity-60" />
              <p className="font-serif font-bold text-xl text-[#3d2c2e]">查無此日期的執飛班次</p>
              <p className="text-xs text-[#424c55] mt-1">
                請參考上方熱門航線，或至「航班時刻表」查看所有執飛日期與路線
              </p>
            </div>
          )}
        </div>
      )}

      {/* Featured Global Destinations Section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#886f68]/15 text-[#886f68] text-xs font-bold uppercase tracking-wider mb-2">
              <Globe2 className="w-3.5 h-3.5" />
              Featured Global Destinations
            </div>
            <h2 className="font-serif font-bold text-4xl text-[#3d2c2e]">
              精選熱門航點特惠
            </h2>
            <p className="text-sm text-[#424c55] mt-1.5">
              長榮航空連結亞洲、北美與歐洲主要大都會，尊享最舒適便捷的直飛航網。
            </p>
          </div>
        </div>

        {/* 6 Destination Cards Grid */}
        <div className="grid grid-cols-3 gap-7">
          {featuredDestinations.map((dest) => (
            <div
              key={dest.city}
              className="bg-white rounded-3xl border border-[#d1ccdc] shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col justify-between group"
            >
              <div className="relative h-52 overflow-hidden bg-slate-200">
                <img
                  src={dest.image}
                  alt={dest.city}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                <div className="absolute top-3.5 left-3.5">
                  <span className="px-3 py-1 rounded-full bg-[#3d2c2e]/90 text-white text-[11px] font-bold tracking-wider backdrop-blur-xs border border-[#886f68]/70">
                    {dest.tag}
                  </span>
                </div>
                <div className="absolute bottom-3.5 left-5 right-5 flex items-end justify-between text-white">
                  <div>
                    <span className="text-[10px] text-[#d1ccdc] uppercase tracking-wider block font-semibold">
                      {dest.country}
                    </span>
                    <h3 className="font-serif font-bold text-2xl drop-shadow-sm leading-tight">
                      {dest.city}
                    </h3>
                  </div>
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-white/20 backdrop-blur-xs border border-white/30">
                    {dest.airport}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs text-[#886f68] font-bold mb-2">
                    <Plane className="w-4 h-4" />
                    <span>{dest.aircraft}</span>
                  </div>
                  <p className="text-xs text-[#424c55] leading-relaxed">
                    {dest.desc}
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-[#d1ccdc]/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#424c55] font-medium block">經濟艙優惠單程</span>
                    <span className="font-serif font-bold text-xl text-[#3d2c2e]">
                      {dest.price} <span className="text-xs font-sans font-normal text-[#424c55]">起</span>
                    </span>
                  </div>

                  <button
                    onClick={() => handleQuickBook(dest.orig, dest.dest)}
                    className="px-5 py-2.5 rounded-xl bg-[#3d2c2e] hover:bg-[#3d2c2e]/90 text-[#f5edf0] text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all active:scale-95"
                  >
                    <span>即刻預訂</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#886f68]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Radar Quick Teaser Banner - Desktop Wide Banner */}
      {onNavigateToMap && (
        <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-20">
          <div className="bg-[#3d2c2e] text-[#f5edf0] rounded-3xl p-10 shadow-2xl relative overflow-hidden border border-[#886f68]">
            <div className="absolute -right-16 -bottom-16 w-96 h-96 bg-[#886f68]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between gap-8">
              <div className="space-y-2.5 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 text-xs font-semibold text-[#d1ccdc]">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>實時飛航遙測系統 • 24 小時雷達</span>
                </div>
                <h3 className="font-serif font-bold text-3xl text-white">
                  探索全球動態飛航雷達地圖
                </h3>
                <p className="text-sm text-[#d1ccdc] leading-relaxed font-light">
                  即時查看長榮航空執飛的所有跨洋與亞洲航線，掌握大圓航線軌跡、即時巡航高度、地面航速與預估抵達時間。
                </p>
              </div>

              <button
                onClick={onNavigateToMap}
                className="px-8 py-4 rounded-2xl bg-[#886f68] hover:bg-[#886f68]/90 text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 whitespace-nowrap shrink-0 border border-white/20"
              >
                <Compass className="w-4 h-4" />
                <span>開啟全球即時雷達</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Five-Star Boutique Cabin Experience Showcase */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pb-20">
        <div className="text-center mb-12">
          <span className="text-xs font-mono font-bold text-[#886f68] tracking-widest uppercase block mb-1">
            EXCELLENCE IN THE SKY
          </span>
          <h2 className="font-serif font-bold text-4xl text-[#3d2c2e]">
            五星級極致客艙款待
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-[#d1ccdc] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-[#886f68]/15 text-[#886f68] flex items-center justify-center mb-5">
              <Sparkles className="w-7 h-7" />
            </div>
            <h3 className="font-serif font-bold text-xl text-[#3d2c2e] mb-2.5">皇璽商務艙 (Royal Laurel)</h3>
            <p className="text-xs text-[#424c55] leading-relaxed">
              獨立反魚骨 1-2-1 全平躺包廂，搭配知名品牌降噪耳機、奢華旅行過夜包與米其林星級名廚空中饗宴。
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-[#d1ccdc] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-[#886f68]/15 text-[#886f68] flex items-center justify-center mb-5">
              <Luggage className="w-7 h-7" />
            </div>
            <h3 className="font-serif font-bold text-xl text-[#3d2c2e] mb-2.5">豪華經濟艙 (Premium Eco)</h3>
            <p className="text-xs text-[#424c55] leading-relaxed">
              業界領先 38 吋超寬椅距、多向微調皮質人體工學頭靠、個人專屬電源插座與 13.3 吋觸控高畫質螢幕。
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-[#d1ccdc] shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-2xl bg-[#886f68]/15 text-[#886f68] flex items-center justify-center mb-5">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="font-serif font-bold text-xl text-[#3d2c2e] mb-2.5">世界級安全與數位服務</h3>
            <p className="text-xs text-[#424c55] leading-relaxed">
              連續多年榮獲全球最安全航空公司前十大評鑑肯定，全機配備醫療級 HEPA 空氣循環過濾系統與高速 Wi-Fi。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
