import React, { useState } from 'react';
import { FleetItem } from '../types';
import { Plane, Compass, Gauge, Users, Sparkles, Check, ArrowRight } from 'lucide-react';

interface FleetModalProps {
  fleet: FleetItem[];
  onSelectRoute?: () => void;
}

export const FleetModal: React.FC<FleetModalProps> = ({ fleet, onSelectRoute }) => {
  const [selectedCode, setSelectedCode] = useState<string>(fleet[0]?.code || 'B789');

  const activeAircraft = fleet.find((f) => f.code === selectedCode) || fleet[0];

  const cabinFeatures = {
    business: [
      '1-2-1 反魚骨全平躺獨立私密包廂 (180° Fully-Flat Bed)',
      '18 吋 4K 超高畫質個人觸控娛樂系統',
      '義大利精品備品與頂級抗噪耳機',
      '星空燈光客艙氛圍營造與精緻星級美饌',
    ],
    premium_economy: [
      '寬敞 38 吋椅距與 19.5 吋人體工學加大座椅',
      '全方位多段調整皮質頭靠與獨立腿部支撐墊',
      '13.3 吋個人高畫質防眩光觸控螢幕',
      '專屬個人充電插座與貼心配備旅行收納袋',
    ],
    economy: [
      '符合人體工學薄型減壓座椅，大幅增加膝部活動空間',
      '12 吋個人觸控螢幕與全機藍牙耳機連線支援',
      '每座配置獨立 USB-A / USB-C 快速充電埠',
      '四季精選星級名廚特製航空美饌',
    ],
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#886f68]/15 text-[#886f68] text-xs font-semibold mb-2 uppercase tracking-wider">
          <Plane className="w-3.5 h-3.5" />
          Modern & Sustainable Fleet
        </div>
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#3d2c2e]">
          現代化先進機隊與極致客艙
        </h1>
        <p className="text-xs sm:text-sm text-[#424c55] mt-1 max-w-2xl mx-auto">
          長榮航空引進業界最頂尖的波音 787 夢幻客機與波音 777-300ER 長程客機，兼具極致靜音、節能環保與五星級奢華客艙設計。
        </p>
      </div>

      {/* Aircraft Selector Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
        {fleet.map((item) => (
          <button
            key={item.code}
            onClick={() => setSelectedCode(item.code)}
            className={`px-5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
              selectedCode === item.code
                ? 'bg-[#3d2c2e] text-[#f5edf0] shadow-md border border-[#886f68]'
                : 'bg-white/80 border border-[#d1ccdc] text-[#424c55] hover:bg-[#d1ccdc]/30'
            }`}
          >
            {item.model}
          </button>
        ))}
      </div>

      {activeAircraft && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* Aircraft Specs Grid */}
          <div className="bg-white/90 rounded-3xl border border-[#d1ccdc] p-6 sm:p-8 shadow-md">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#d1ccdc]/60 pb-6 gap-4">
              <div>
                <span className="text-xs font-mono font-bold text-[#886f68] tracking-widest uppercase">
                  {activeAircraft.manufacturer} • AIRCRAFT SPECIFICATIONS
                </span>
                <h2 className="font-serif font-bold text-3xl text-[#3d2c2e] mt-1">
                  {activeAircraft.model}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#886f68]/15 text-[#886f68] text-xs font-mono font-bold">
                  ICAO: {activeAircraft.code}
                </span>
              </div>
            </div>

            {/* Performance Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
              <div className="bg-[#f5edf0]/70 p-4 rounded-2xl border border-[#d1ccdc] text-center">
                <Users className="w-5 h-5 text-[#886f68] mx-auto mb-1" />
                <span className="text-[10px] text-[#424c55] uppercase font-bold tracking-wider block">載客量</span>
                <p className="font-serif font-bold text-xl text-[#3d2c2e] mt-0.5">{activeAircraft.capacity} 席</p>
              </div>

              <div className="bg-[#f5edf0]/70 p-4 rounded-2xl border border-[#d1ccdc] text-center">
                <Gauge className="w-5 h-5 text-[#886f68] mx-auto mb-1" />
                <span className="text-[10px] text-[#424c55] uppercase font-bold tracking-wider block">巡航時速</span>
                <p className="font-serif font-bold text-xl text-[#3d2c2e] mt-0.5">{activeAircraft.cruising_speed} kts</p>
              </div>

              <div className="bg-[#f5edf0]/70 p-4 rounded-2xl border border-[#d1ccdc] text-center">
                <Compass className="w-5 h-5 text-[#886f68] mx-auto mb-1" />
                <span className="text-[10px] text-[#424c55] uppercase font-bold tracking-wider block">最大巡航高度</span>
                <p className="font-serif font-bold text-xl text-[#3d2c2e] mt-0.5">{activeAircraft.max_altitude.toLocaleString()} ft</p>
              </div>

              <div className="bg-[#f5edf0]/70 p-4 rounded-2xl border border-[#d1ccdc] text-center">
                <Plane className="w-5 h-5 text-[#886f68] mx-auto mb-1" />
                <span className="text-[10px] text-[#424c55] uppercase font-bold tracking-wider block">最大航程</span>
                <p className="font-serif font-bold text-xl text-[#3d2c2e] mt-0.5">{activeAircraft.range_km.toLocaleString()} km</p>
              </div>
            </div>
          </div>

          {/* Cabin Classes Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Royal Laurel / Business */}
            <div className="bg-white/90 rounded-3xl border-2 border-[#886f68]/50 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-[#886f68]" />
                  <h3 className="font-serif font-bold text-lg text-[#3d2c2e]">皇璽商務艙 (Royal Laurel)</h3>
                </div>
                <p className="text-xs text-[#424c55] mb-4">
                  極致隱私反魚骨設計，讓每一次長途飛行化作身心放鬆的尊榮私饗。
                </p>
                <ul className="text-xs text-[#424c55] space-y-2.5 border-t border-[#d1ccdc]/60 pt-4">
                  {cabinFeatures.business.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#886f68] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Premium Economy */}
            <div className="bg-white/90 rounded-3xl border border-[#d1ccdc] p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-[#424c55]" />
                  <h3 className="font-serif font-bold text-lg text-[#3d2c2e]">豪華經濟艙 (Premium Eco)</h3>
                </div>
                <p className="text-xs text-[#424c55] mb-4">
                  長榮航空開創業界先河之經典，超越標準經濟艙的非凡寬敞舒適。
                </p>
                <ul className="text-xs text-[#424c55] space-y-2.5 border-t border-[#d1ccdc]/60 pt-4">
                  {cabinFeatures.premium_economy.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#886f68] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Economy */}
            <div className="bg-white/90 rounded-3xl border border-[#d1ccdc] p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Plane className="w-4 h-4 text-[#424c55]" />
                  <h3 className="font-serif font-bold text-lg text-[#3d2c2e]">經濟艙 (Economy Class)</h3>
                </div>
                <p className="text-xs text-[#424c55] mb-4">
                  以人體工學為本的輕巧減壓座椅，長途越洋飛行依然輕盈舒適。
                </p>
                <ul className="text-xs text-[#424c55] space-y-2.5 border-t border-[#d1ccdc]/60 pt-4">
                  {cabinFeatures.economy.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#886f68] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
