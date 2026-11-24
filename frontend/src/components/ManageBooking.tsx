import React, { useState } from 'react';
import { Booking } from '../types';
import { api } from '../services/api';
import { BoardingPass } from './BoardingPass';
import { Search, Ticket, AlertCircle, CheckCircle, Plane, ArrowRight, User } from 'lucide-react';

export const ManageBooking: React.FC = () => {
  const [pnr, setPnr] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pnr.trim() || !lastName.trim()) {
      setErrorMsg('請輸入完整的 6 碼訂位代號 (PNR) 與旅客英文姓氏');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setBooking(null);

    try {
      const res = await api.searchBooking(pnr, lastName);
      setBooking(res);
    } catch (err: any) {
      setErrorMsg(err.message || '查無此訂位紀錄，請確認代號與姓氏是否相符');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setPnr('BR5LW6');
    setLastName('WANG');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#886f68]/15 text-[#886f68] text-xs font-semibold mb-2 uppercase tracking-wider">
          <Ticket className="w-3.5 h-3.5" />
          Manage My Booking
        </div>
        <h1 className="font-serif font-bold text-3xl sm:text-4xl text-[#3d2c2e]">
          行程管理與登機證調閱
        </h1>
        <p className="text-xs sm:text-sm text-[#424c55] mt-1">
          輸入您的 6 碼訂位代號 (PNR) 與旅客護照英文姓氏，即可即時查詢航班行程、劃位資訊並列印電子登機證。
        </p>
      </div>

      {/* Lookup Card */}
      <div className="bg-white/90 rounded-3xl border border-[#d1ccdc] p-6 sm:p-8 shadow-md mb-8">
        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          <div className="sm:col-span-5">
            <label className="block text-xs font-semibold text-[#424c55] uppercase tracking-wider mb-1.5">
              訂位代號 (Booking Reference / PNR) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="如: BR8A2K"
              maxLength={8}
              value={pnr}
              onChange={(e) => setPnr(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 text-base font-mono font-bold uppercase rounded-xl border border-[#d1ccdc] bg-[#f5edf0]/60 focus:bg-white text-[#3d2c2e] focus:outline-none focus:ring-1 focus:ring-[#886f68]"
            />
          </div>

          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-[#424c55] uppercase tracking-wider mb-1.5">
              旅客英文姓氏 (Last Name) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="如: WANG"
              value={lastName}
              onChange={(e) => setLastName(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 text-base font-serif font-bold uppercase rounded-xl border border-[#d1ccdc] bg-[#f5edf0]/60 focus:bg-white text-[#3d2c2e] focus:outline-none focus:ring-1 focus:ring-[#886f68]"
            />
          </div>

          <div className="sm:col-span-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#3d2c2e] hover:bg-[#3d2c2e]/90 text-[#f5edf0] font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-md transition-all active:scale-95 disabled:opacity-50"
            >
              <Search className="w-4 h-4 text-[#886f68]" />
              <span>{isLoading ? '查詢中...' : '查詢行程'}</span>
            </button>
          </div>
        </form>

        {/* Quick Demo Helper */}
        <div className="mt-4 pt-3 border-t border-[#d1ccdc]/60 flex items-center justify-between text-xs text-[#424c55]">
          <span>想要快速體驗系統查詢功能？</span>
          <button
            type="button"
            onClick={handleFillDemo}
            className="text-[#886f68] hover:underline font-semibold"
          >
            填入測試訂單 (BR5LW6 / WANG)
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 mb-8">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Booking Result */}
      {booking && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <BoardingPass booking={booking} />
        </div>
      )}
    </div>
  );
};
