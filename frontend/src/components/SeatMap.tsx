import React, { useState } from 'react';
import { Plane, Check, User, Info } from 'lucide-react';
import { Passenger } from '../types';

interface SeatMapProps {
  aircraftCode: string;
  aircraftName: string;
  cabinClass: string;
  passengers: Passenger[];
  selectedSeats: { [passengerIndex: number]: string };
  onSeatSelect: (passengerIndex: number, seatNumber: string) => void;
  activePassengerIndex: number;
  setActivePassengerIndex: (index: number) => void;
}

// Generate deterministic occupied seats for realistic realism
const OCCUPIED_SEATS = new Set([
  '1A', '2D', '5K', '6G', '7A',
  '20A', '20K', '21C', '22E', '23H',
  '30A', '30B', '30C', '31D', '32K', '33A', '34F', '35H', '36B', '37E', '38A'
]);

export const SeatMap: React.FC<SeatMapProps> = ({
  aircraftCode,
  aircraftName,
  cabinClass,
  passengers,
  selectedSeats,
  onSeatSelect,
  activePassengerIndex,
  setActivePassengerIndex,
}) => {
  const [hoveredSeat, setHoveredSeat] = useState<{
    seat: string;
    type: string;
    price: number;
    extra: string;
  } | null>(null);

  // Business class rows
  const businessRows = [1, 2, 5, 6, 7];
  // Premium economy rows
  const peRows = [20, 21, 22, 23];
  // Economy rows
  const ecoRows = [30, 31, 32, 33, 34, 35, 36, 37, 38];

  const handleSeatClick = (seatCode: string) => {
    if (OCCUPIED_SEATS.has(seatCode)) return;

    // Check if this seat is already taken by another passenger in this booking
    const takenByOther = Object.entries(selectedSeats).some(
      ([idx, s]) => Number(idx) !== activePassengerIndex && s === seatCode
    );
    if (takenByOther) return;

    onSeatSelect(activePassengerIndex, seatCode);
  };

  const getSeatStatus = (seatCode: string) => {
    if (selectedSeats[activePassengerIndex] === seatCode) return 'selected-current';
    const takenByOther = Object.entries(selectedSeats).find(
      ([idx, s]) => Number(idx) !== activePassengerIndex && s === seatCode
    );
    if (takenByOther) return 'selected-other';
    if (OCCUPIED_SEATS.has(seatCode)) return 'occupied';
    return 'available';
  };

  return (
    <div className="bg-white/80 rounded-2xl border border-[#d1ccdc] p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[#d1ccdc]/60 gap-3">
        <div>
          <h3 className="font-serif font-bold text-xl text-[#3d2c2e]">
            機艙互動選位 (Seat Selection)
          </h3>
          <p className="text-xs text-[#424c55] mt-0.5">
            {aircraftName} ({aircraftCode}) • 點擊客艙座椅為每位旅客預先保留喜好座位
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-[#424c55]">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-[#886f68] text-white flex items-center justify-center text-[10px]">✓</div>
            <span>已選擇</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded border border-[#d1ccdc] bg-[#f5edf0]"></div>
            <span>可選擇</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-[#424c55]/20 text-[#424c55] flex items-center justify-center text-[10px]">✕</div>
            <span>已佔用</span>
          </div>
        </div>
      </div>

      {/* Passenger tabs for seat selection */}
      <div className="flex items-center gap-2 my-4 overflow-x-auto pb-1">
        {passengers.map((p, idx) => {
          const isCurrent = activePassengerIndex === idx;
          const assignedSeat = selectedSeats[idx];
          return (
            <button
              key={idx}
              onClick={() => setActivePassengerIndex(idx)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                isCurrent
                  ? 'bg-[#3d2c2e] text-[#f5edf0] border-[#3d2c2e] shadow-xs'
                  : 'bg-white/60 text-[#424c55] border-[#d1ccdc] hover:bg-[#d1ccdc]/30'
              }`}
            >
              <User className="w-3.5 h-3.5 text-[#886f68]" />
              <span>
                旅客 {idx + 1}: {p.last_name || '旅客'} {p.first_name}
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[11px] font-mono font-bold ${
                assignedSeat ? 'bg-[#886f68] text-white' : 'bg-[#d1ccdc]/50 text-[#424c55]'
              }`}>
                {assignedSeat ? `座位 ${assignedSeat}` : '未選位'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Cabin Fuselage Container */}
      <div className="relative max-w-2xl mx-auto bg-[#f5edf0]/90 rounded-[4rem] border-2 border-[#d1ccdc] p-8 shadow-inner my-6">
        {/* Cockpit nose shape */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-10 border-t-2 border-x-2 border-[#886f68] rounded-t-full flex items-center justify-center bg-white/60">
            <span className="text-[10px] font-mono font-bold text-[#886f68] tracking-widest uppercase">駕駛艙</span>
          </div>
          <div className="w-full border-b border-[#d1ccdc] mt-2 mb-4" />
        </div>

        {/* Section 1: Royal Laurel / Business Class */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-bold text-[#886f68] uppercase tracking-wider mb-3 px-2">
            <span>皇璽商務艙 (Royal Laurel)</span>
            <span className="text-[11px] font-mono">1-2-1 反魚骨配置</span>
          </div>
          <div className="space-y-2">
            {businessRows.map((row) => (
              <div key={row} className="flex items-center justify-between px-2">
                {/* Left A */}
                <button
                  onClick={() => handleSeatClick(`${row}A`)}
                  className={getSeatClasses(getSeatStatus(`${row}A`), true)}
                  title={`座位 ${row}A (商務艙 - 靠窗)`}
                >
                  {row}A
                </button>

                {/* Center D, G */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleSeatClick(`${row}D`)}
                    className={getSeatClasses(getSeatStatus(`${row}D`), true)}
                  >
                    {row}D
                  </button>
                  <button
                    onClick={() => handleSeatClick(`${row}G`)}
                    className={getSeatClasses(getSeatStatus(`${row}G`), true)}
                  >
                    {row}G
                  </button>
                </div>

                {/* Right K */}
                <button
                  onClick={() => handleSeatClick(`${row}K`)}
                  className={getSeatClasses(getSeatStatus(`${row}K`), true)}
                  title={`座位 ${row}K (商務艙 - 靠窗)`}
                >
                  {row}K
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Galley & Exit Divider */}
        <div className="flex items-center justify-between py-3 my-4 border-y border-[#d1ccdc] text-[10px] text-[#424c55] font-mono uppercase px-4 bg-white/40 rounded-lg">
          <span>緊急出口 EXIT</span>
          <span className="font-semibold text-[#886f68]">GALLEY / 茶水服務區</span>
          <span>EXIT 緊急出口</span>
        </div>

        {/* Section 2: Economy Class */}
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-[#424c55] uppercase tracking-wider mb-3 px-2">
            <span>經濟艙 (Economy Class)</span>
            <span className="text-[11px] font-mono">3-3-3 寬體客機配置</span>
          </div>
          <div className="space-y-2">
            {ecoRows.map((row) => (
              <div key={row} className="flex items-center justify-between px-1">
                {/* Left Trio: A, B, C */}
                <div className="flex items-center gap-1">
                  {['A', 'B', 'C'].map((col) => (
                    <button
                      key={col}
                      onClick={() => handleSeatClick(`${row}${col}`)}
                      className={getSeatClasses(getSeatStatus(`${row}${col}`), false)}
                    >
                      {row}{col}
                    </button>
                  ))}
                </div>

                {/* Aisle Spacer */}
                <div className="text-[10px] font-mono text-[#d1ccdc] px-1 font-bold">{row}</div>

                {/* Middle Trio: D, E, F */}
                <div className="flex items-center gap-1">
                  {['D', 'E', 'F'].map((col) => (
                    <button
                      key={col}
                      onClick={() => handleSeatClick(`${row}${col}`)}
                      className={getSeatClasses(getSeatStatus(`${row}${col}`), false)}
                    >
                      {row}{col}
                    </button>
                  ))}
                </div>

                {/* Aisle Spacer */}
                <div className="text-[10px] font-mono text-[#d1ccdc] px-1 font-bold">{row}</div>

                {/* Right Trio: G, H, K */}
                <div className="flex items-center gap-1">
                  {['G', 'H', 'K'].map((col) => (
                    <button
                      key={col}
                      onClick={() => handleSeatClick(`${row}${col}`)}
                      className={getSeatClasses(getSeatStatus(`${row}${col}`), false)}
                    >
                      {row}{col}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Aircraft Tail */}
        <div className="text-center mt-8 pt-4 border-t border-[#d1ccdc] text-[10px] font-mono text-[#886f68] uppercase">
          機尾 (Lavatories & Rear Galley)
        </div>
      </div>
    </div>
  );
};

// Helper for dynamic seat styles
function getSeatClasses(status: string, isBusiness: boolean): string {
  const base = `font-mono text-xs font-bold rounded-xl transition-all duration-150 flex items-center justify-center cursor-pointer select-none ${
    isBusiness ? 'w-12 h-12 shadow-sm' : 'w-9 h-9'
  }`;

  switch (status) {
    case 'selected-current':
      return `${base} bg-[#886f68] text-white border-2 border-[#3d2c2e] shadow-md scale-105`;
    case 'selected-other':
      return `${base} bg-[#424c55] text-white border border-[#3d2c2e] opacity-80`;
    case 'occupied':
      return `${base} bg-[#424c55]/20 text-[#424c55]/40 border border-[#d1ccdc]/40 cursor-not-allowed line-through`;
    case 'available':
    default:
      return `${base} bg-white hover:bg-[#d1ccdc]/50 text-[#3d2c2e] border border-[#d1ccdc] hover:border-[#886f68] active:scale-95`;
  }
}
