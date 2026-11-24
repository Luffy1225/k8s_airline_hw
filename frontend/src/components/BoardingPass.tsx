import React, { useState } from 'react';
import { Booking, Passenger } from '../types';
import { Plane, Printer, CheckCircle, QrCode, Sparkles, Smartphone, Download } from 'lucide-react';

interface BoardingPassProps {
  booking: Booking;
}

export const BoardingPass: React.FC<BoardingPassProps> = ({ booking }) => {
  const [selectedPaxIndex, setSelectedPaxIndex] = useState<number>(0);
  const passengers = booking.passengers || [];
  const currentPax = passengers[selectedPaxIndex] || passengers[0];

  const handlePrint = () => {
    window.print();
  };

  // Generate authentic looking QR Matrix
  const generateQrMatrix = (seed: string) => {
    const size = 17;
    const matrix: boolean[][] = [];
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }

    for (let r = 0; r < size; r++) {
      const row: boolean[] = [];
      for (let c = 0; c < size; c++) {
        // Corner position markers (7x7)
        const isTopLeft = r < 7 && c < 7;
        const isTopRight = r < 7 && c >= size - 7;
        const isBottomLeft = r >= size - 7 && c < 7;

        if (isTopLeft || isTopRight || isBottomLeft) {
          const lr = isBottomLeft ? r - (size - 7) : r;
          const lc = isTopRight ? c - (size - 7) : c;
          const isBorder = lr === 0 || lr === 6 || lc === 0 || lc === 6;
          const isCenter = lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4;
          row.push(isBorder || isCenter);
        } else {
          // Pseudorandom inner pattern based on hash
          const bit = Math.abs(Math.sin((r * size + c) * 31 + hash)) > 0.48;
          row.push(bit);
        }
      }
      matrix.push(row);
    }
    return matrix;
  };

  const qrMatrix = generateQrMatrix(`${booking.pnr}-${currentPax?.last_name}-${booking.flight_no}`);

  return (
    <div className="max-w-5xl mx-auto my-8 select-none">
      {/* Top Banner & Multi-passenger switcher */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 print:hidden">
        <div className="flex items-center gap-3 text-emerald-900 bg-emerald-50 border border-emerald-300 px-5 py-3 rounded-2xl shadow-xs">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <span className="text-xs font-semibold block">訂位確認成功！開票作業已完成</span>
            <span className="text-sm font-bold">
              專屬訂位代號 (PNR)：<strong className="text-lg font-mono text-[#3d2c2e] ml-1 tracking-wider">{booking.pnr}</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Passenger Tabs if > 1 passenger */}
          {passengers.length > 1 && (
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-[#d1ccdc] shadow-2xs">
              <span className="text-[11px] font-bold text-[#886f68] px-2">旅客登機證：</span>
              {passengers.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedPaxIndex(idx)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    selectedPaxIndex === idx
                      ? 'bg-[#3d2c2e] text-white shadow-xs'
                      : 'text-[#424c55] hover:bg-[#d1ccdc]/30'
                  }`}
                >
                  {p.last_name || `旅客 ${idx + 1}`}
                </button>
              ))}
            </div>
          )}

          {/* Add to Apple Wallet badge */}
          <button
            onClick={() => alert('已生成 Apple Wallet / Google Pay 專屬 Passbook 票卡憑證！')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white text-xs font-medium transition-all shadow-sm active:scale-95 border border-neutral-700"
            title="加入 Apple Wallet / Google Pay"
          >
            <Smartphone className="w-4 h-4 text-white" />
            <span className="font-mono text-[11px]">Add to Apple Wallet</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#3d2c2e] hover:bg-[#3d2c2e]/90 text-[#f5edf0] text-xs font-bold transition-all shadow-md active:scale-95 border border-[#886f68]/50"
          >
            <Printer className="w-4 h-4 text-[#886f68]" />
            <span>列印全套登機證</span>
          </button>
        </div>
      </div>

      {/* Main Luxury Boarding Pass Ticket Container */}
      <div className="relative bg-white rounded-3xl border-2 border-[#d1ccdc] shadow-2xl overflow-hidden flex flex-col lg:flex-row print:border-black print:shadow-none">
        {/* Left / Main Boarding Pass Section */}
        <div className="flex-1 p-8 sm:p-10 flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#d1ccdc]/60 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#3d2c2e] text-[#f5edf0] flex items-center justify-center font-bold shadow-md border border-[#886f68]">
                <Plane className="w-6 h-6 transform -rotate-45 text-[#d1ccdc]" />
              </div>
              <div>
                <span className="font-serif font-bold text-2xl text-[#3d2c2e] tracking-tight">
                  EVA AIRWAYS
                </span>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#886f68] font-bold block mt-0.5">
                  ELECTRONIC BOARDING PASS • 電子登機證
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="px-4 py-1.5 rounded-full bg-[#886f68]/15 text-[#886f68] border border-[#886f68]/40 text-xs font-bold font-mono tracking-wider">
                {booking.cabin_class?.toUpperCase() || 'ECONOMY CLASS'}
              </span>
            </div>
          </div>

          {/* Passenger & Flight Basic Grid */}
          <div className="grid grid-cols-4 gap-6 py-6 border-b border-[#d1ccdc]/60">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#424c55] tracking-wider block">
                旅客姓名 / PASSENGER
              </span>
              <p className="font-serif font-bold text-lg text-[#3d2c2e] uppercase mt-1 truncate">
                {currentPax?.last_name} / {currentPax?.first_name} {currentPax?.title}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-[#424c55] tracking-wider block">
                航班號 / FLIGHT
              </span>
              <p className="font-serif font-bold text-lg text-[#3d2c2e] mt-1">
                {booking.flight_no}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-[#424c55] tracking-wider block">
                出發日期 / DATE
              </span>
              <p className="font-mono font-bold text-base text-[#3d2c2e] mt-1">
                {booking.flight_date}
              </p>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-[#424c55] tracking-wider block">
                訂位代號 / PNR
              </span>
              <p className="font-mono font-bold text-lg text-[#886f68] mt-1 tracking-wider">
                {booking.pnr}
              </p>
            </div>
          </div>

          {/* Airport Route Major Heading */}
          <div className="grid grid-cols-2 gap-8 py-8 border-b border-[#d1ccdc]/60">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#886f68] tracking-widest block">
                出發地 / FROM
              </span>
              <p className="font-serif font-bold text-4xl sm:text-5xl text-[#3d2c2e] mt-1 tracking-tight">
                {booking.origin}
              </p>
              <p className="text-sm text-[#424c55] font-semibold mt-1">
                {booking.origin_airport?.city || booking.origin}
              </p>
              <p className="text-xs text-[#424c55]/80 mt-0.5">
                {booking.origin_airport?.name}
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-[#886f68] tracking-widest block">
                目的地 / TO
              </span>
              <p className="font-serif font-bold text-4xl sm:text-5xl text-[#3d2c2e] mt-1 tracking-tight">
                {booking.destination}
              </p>
              <p className="text-sm text-[#424c55] font-semibold mt-1">
                {booking.destination_airport?.city || booking.destination}
              </p>
              <p className="text-xs text-[#424c55]/80 mt-0.5">
                {booking.destination_airport?.name}
              </p>
            </div>
          </div>

          {/* Boarding Gate, Time & Seat Critical Info */}
          <div className="grid grid-cols-3 gap-5 pt-6">
            <div className="bg-[#f5edf0] p-4 rounded-2xl border border-[#d1ccdc] text-center shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-[#424c55] tracking-wider block">
                登機門 / GATE
              </span>
              <p className="font-serif font-bold text-3xl text-[#3d2c2e] mt-1">
                {booking.gate}
              </p>
            </div>

            <div className="bg-[#f5edf0] p-4 rounded-2xl border border-[#d1ccdc] text-center shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-[#424c55] tracking-wider block">
                登機時間 / BOARDING
              </span>
              <p className="font-mono font-bold text-3xl text-[#886f68] mt-1">
                {booking.boarding_time}
              </p>
            </div>

            <div className="bg-[#3d2c2e] text-[#f5edf0] p-4 rounded-2xl border border-[#886f68] text-center shadow-lg">
              <span className="text-[10px] uppercase font-bold text-[#d1ccdc] tracking-wider block">
                客艙座位 / SEAT
              </span>
              <p className="font-mono font-bold text-3xl text-white mt-1 tracking-wide">
                {currentPax?.seat || '未劃位'}
              </p>
            </div>
          </div>

          {/* Purchased Boutique Services Pill Bar */}
          {booking.addons && booking.addons.length > 0 && (
            <div className="mt-5 pt-4 border-t border-[#d1ccdc]/60">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#886f68] uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>尊榮附加禮遇 (Confirmed Ancillary Services)</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {booking.addons.map((ad) => (
                  <span
                    key={ad.id}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#f5edf0] border border-[#d1ccdc] text-xs font-semibold text-[#3d2c2e]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                    {ad.name} <span className="font-mono text-[#886f68]">({ad.count} {ad.unit})</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Perforated Divider for Physical Ticket Tear-off Look */}
        <div className="relative hidden lg:flex flex-col items-center justify-between w-10 bg-white">
          <div className="w-10 h-10 rounded-full bg-[#f5edf0] -mt-5 border-b-2 border-[#d1ccdc]" />
          <div className="w-[2px] h-full border-r-2 border-dashed border-[#d1ccdc]" />
          <div className="w-10 h-10 rounded-full bg-[#f5edf0] -mb-5 border-t-2 border-[#d1ccdc]" />
        </div>

        {/* Right / Boarding Stub & Barcode / QR Code */}
        <div className="w-full lg:w-80 bg-[#f5edf0]/70 p-8 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-[#d1ccdc]/60">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#d1ccdc]/60">
              <span className="font-serif font-bold text-sm text-[#3d2c2e]">BOARDING PASS STUB</span>
              <span className="text-[10px] font-mono text-[#886f68] font-bold">STAR ALLIANCE</span>
            </div>

            <div className="mt-5 space-y-3">
              <div>
                <span className="text-[9px] uppercase font-bold text-[#424c55] block">PASSENGER NAME</span>
                <p className="font-serif font-bold text-sm text-[#3d2c2e] truncate mt-0.5">
                  {currentPax?.last_name}/{currentPax?.first_name}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="text-[9px] uppercase font-bold text-[#424c55] block">FLIGHT</span>
                  <p className="font-mono font-bold text-xs text-[#3d2c2e] mt-0.5">{booking.flight_no}</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-[#424c55] block">DATE</span>
                  <p className="font-mono font-bold text-xs text-[#3d2c2e] mt-0.5">{booking.flight_date}</p>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-[#424c55] block">SEAT</span>
                  <p className="font-mono font-bold text-sm text-[#886f68] mt-0.5">{currentPax?.seat || 'N/A'}</p>
                </div>
              </div>

              <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-[#d1ccdc]">
                <div>
                  <span className="text-[9px] uppercase font-bold text-[#424c55] block">ROUTING</span>
                  <p className="font-mono font-bold text-xs text-[#3d2c2e]">{booking.origin} ➔ {booking.destination}</p>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase font-bold text-[#424c55] block">GATE</span>
                  <p className="font-serif font-bold text-sm text-[#3d2c2e]">{booking.gate}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Authentic 2D High-Density QR Code Graphics */}
          <div className="mt-6 pt-5 border-t border-[#d1ccdc]/60 flex flex-col items-center text-center">
            <div className="p-2.5 bg-white rounded-2xl border border-[#d1ccdc] shadow-sm">
              <div
                className="grid gap-[1.5px]"
                style={{
                  gridTemplateColumns: `repeat(${qrMatrix.length}, minmax(0, 1fr))`,
                  width: '110px',
                  height: '110px',
                }}
              >
                {qrMatrix.flatMap((row, r) =>
                  row.map((active, c) => (
                    <div
                      key={`${r}-${c}`}
                      className={active ? 'bg-[#3d2c2e] rounded-[0.5px]' : 'bg-transparent'}
                    />
                  ))
                )}
              </div>
            </div>

            <p className="font-mono text-[9px] text-[#424c55] tracking-widest mt-2 font-bold uppercase">
              ETKT #{booking.pnr}-{(selectedPaxIndex + 1).toString().padStart(3, '0')}
            </p>
            <span className="text-[9px] text-[#886f68] font-medium">長榮航空專屬電子驗證識別碼</span>
          </div>
        </div>
      </div>
    </div>
  );
};
