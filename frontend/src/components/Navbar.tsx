import React, { useState } from 'react';
import { Plane, Calendar, Compass, Search, Ticket, Radio, Zap } from 'lucide-react';
import { CacheModal } from './CacheModal';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  airborneCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, airborneCount }) => {
  const [isCacheModalOpen, setIsCacheModalOpen] = useState<boolean>(false);

  const navItems = [
    { id: 'search', label: '預訂機票', en: 'Book Flight', icon: Search },
    { id: 'map', label: '即時雷達', en: 'Live Radar', icon: Compass },
    { id: 'status', label: '班號動態', en: 'Flight Status', icon: Radio },
    { id: 'schedules', label: '航班時刻', en: 'Schedules', icon: Calendar },
    { id: 'manage', label: '行程管理', en: 'Manage Booking', icon: Ticket },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#d1ccdc]/60 bg-[#f5edf0]/95 backdrop-blur-md shadow-xs select-none">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between gap-6">
        {/* Brand Logo & Star Alliance Signature */}
        <div 
          onClick={() => setActiveTab('search')} 
          className="flex items-center gap-3.5 cursor-pointer group shrink-0"
        >
          <div className="w-11 h-11 rounded-xl bg-[#3d2c2e] text-[#f5edf0] flex items-center justify-center shadow-md transform transition-transform group-hover:scale-105 duration-300 border border-[#886f68] shrink-0">
            <Plane className="w-5 h-5 transform -rotate-45 text-[#d1ccdc]" />
          </div>
          <div className="flex flex-col whitespace-nowrap">
            <div className="flex items-baseline gap-2">
              <span className="font-serif font-bold text-2xl text-[#3d2c2e] tracking-tight">
                EVA AIRWAYS
              </span>
              <span className="text-xs font-sans font-bold tracking-widest text-[#886f68] uppercase">
                VIRTUAL
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#424c55]/85 font-medium">
              STAR ALLIANCE MEMBER • 頂級尊榮航空
            </span>
          </div>
        </div>

        {/* Center Desktop Navigation Pills */}
        <nav className="flex items-center gap-2 xl:gap-3 flex-nowrap shrink-0">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-[#3d2c2e] bg-[#d1ccdc]/50 shadow-xs border border-[#886f68]/50 ring-1 ring-[#886f68]/30'
                    : 'text-[#424c55] hover:text-[#3d2c2e] hover:bg-[#d1ccdc]/25'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#886f68]' : 'text-[#424c55]/70'}`} />
                <span>{item.label}</span>
                <span className="text-[11px] font-normal text-[#886f68] hidden xl:inline">
                  {item.en}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Right Info: Live Flight Telemetry Counter & Book CTA */}
        <div className="flex items-center gap-3.5 shrink-0">
          <button 
            onClick={() => setActiveTab('map')}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/90 border border-[#d1ccdc] text-xs font-medium text-[#424c55] hover:bg-white hover:border-[#886f68] hover:shadow-sm transition-all shadow-2xs whitespace-nowrap shrink-0"
            title="查看全球即時飛航雷達"
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span className="font-mono font-bold text-[#3d2c2e]">{airborneCount}</span>
            <span className="text-[11px] text-[#424c55] whitespace-nowrap">架長榮客機在空</span>
          </button>

          {/* Cache Control Button */}
          <button
            onClick={() => setIsCacheModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-600/30 hover:border-amber-600/50 text-xs font-semibold text-amber-900 transition-all shadow-2xs whitespace-nowrap"
            title="檢視後端快取統計與一鍵手動清除"
          >
            <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
            <span>快取管理</span>
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className="px-5 py-2.5 rounded-xl bg-[#3d2c2e] hover:bg-[#3d2c2e]/90 text-[#f5edf0] text-xs font-bold tracking-wider uppercase transition-all shadow-sm hover:shadow-md active:scale-95 border border-[#886f68]/60 whitespace-nowrap shrink-0"
          >
            立即預訂
          </button>
        </div>
      </div>

      {/* Backend In-Memory Cache Monitoring & Purge Modal */}
      <CacheModal isOpen={isCacheModalOpen} onClose={() => setIsCacheModalOpen(false)} />
    </header>
  );
};
