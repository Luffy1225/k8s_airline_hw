import React from 'react';
import { Plane, Shield, Globe, Award, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#3d2c2e] text-[#f5edf0] border-t border-[#886f68]/40 pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#886f68]/30">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#886f68] text-white flex items-center justify-center font-bold">
                <Plane className="w-5 h-5 transform -rotate-45" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-lg text-white tracking-wide">
                  EVA AIRWAYS <span className="text-[#886f68] text-xs font-sans">VIRTUAL</span>
                </span>
                <span className="text-[10px] tracking-widest text-[#d1ccdc]/70 uppercase">
                  Star Alliance Network
                </span>
              </div>
            </div>
            <p className="text-xs text-[#d1ccdc]/80 leading-relaxed font-light">
              傳承長榮航空安全第一、細緻優雅的五星級服務哲學，為全球模擬飛行與航空愛好者打造沉浸式的虛擬訂票與即時雷達體驗。
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif font-bold text-sm text-white mb-4 uppercase tracking-wider">
              航班與預訂
            </h4>
            <ul className="text-xs space-y-2.5 text-[#d1ccdc]/80 font-light">
              <li className="hover:text-white transition-colors cursor-pointer">全球優惠航點檢索</li>
              <li className="hover:text-white transition-colors cursor-pointer">定期航班時刻表查詢</li>
              <li className="hover:text-white transition-colors cursor-pointer">互動式機艙預先選位</li>
              <li className="hover:text-white transition-colors cursor-pointer">行程管理與登機證調閱</li>
            </ul>
          </div>

          {/* Experience */}
          <div>
            <h4 className="font-serif font-bold text-sm text-white mb-4 uppercase tracking-wider">
              飛行體驗與機隊
            </h4>
            <ul className="text-xs space-y-2.5 text-[#d1ccdc]/80 font-light">
              <li className="hover:text-white transition-colors cursor-pointer">波音 787 夢幻客機</li>
              <li className="hover:text-white transition-colors cursor-pointer">波音 777-300ER 長程客機</li>
              <li className="hover:text-white transition-colors cursor-pointer">皇璽商務艙 (Royal Laurel)</li>
              <li className="hover:text-white transition-colors cursor-pointer">機上星級美饌與抗噪耳機</li>
            </ul>
          </div>

          {/* Virtual Airline Notice */}
          <div>
            <h4 className="font-serif font-bold text-sm text-white mb-4 uppercase tracking-wider">
              航網雷達系統
            </h4>
            <div className="p-4 rounded-2xl bg-white/5 border border-[#886f68]/40 space-y-2 text-xs text-[#d1ccdc]/90">
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>即時飛航遙測數據連線中</span>
              </div>
              <p className="text-[11px] leading-relaxed text-[#d1ccdc]/70">
                本系統透過大圓航線球面插值演算法，提供全球 18 架長榮航機 24 小時動態雷達位置。
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Disclaimer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#d1ccdc]/60 gap-4">
          <p>
            © {new Date().getFullYear()} EVA Airways Virtual Flight System. All rights reserved.
          </p>
          <p className="text-[11px] text-center sm:text-right">
            本專案為虛擬航空示範系統 • 靈感取材自五星級長榮航空飛行美學
          </p>
        </div>
      </div>
    </footer>
  );
};
