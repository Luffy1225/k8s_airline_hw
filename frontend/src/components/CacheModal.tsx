import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Zap, Trash2, RefreshCw, X, CheckCircle2, Clock, Activity, ShieldCheck } from 'lucide-react';

interface CacheEntry {
  key: string;
  age_seconds: number;
  ttl_remaining_seconds: number;
  ttl: number;
}

interface CacheStats {
  total_cached_items: number;
  hits: number;
  misses: number;
  hit_ratio_percent: number;
  entries: CacheEntry[];
}

interface CacheModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CacheModal: React.FC<CacheModalProps> = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isClearing, setIsClearing] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>('');

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const data = await api.getCacheStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load cache stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStats();
      setAlertMessage('');
    }
  }, [isOpen]);

  const handleClearCache = async () => {
    setIsClearing(true);
    setAlertMessage('');
    try {
      const res = await api.clearCache();
      setAlertMessage(res.message || '後端快取已成功清除！');
      // Refresh stats after clear
      await fetchStats();
    } catch (err) {
      setAlertMessage('清除快取失敗，請確認後端服務是否正常運作。');
    } finally {
      setIsClearing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#d1ccdc] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#3d2c2e] text-[#f5edf0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight">後端 In-Memory 快取監控控制台</h3>
              <p className="text-[11px] text-[#d1ccdc]">Flask In-Memory Cache (TTL &amp; X-Cache Observability)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#d1ccdc] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Success / Alert Banner */}
          {alertMessage && (
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium animate-in slide-in-from-top-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{alertMessage} (呼叫 <code>POST /api/cache/clear</code> 回傳 200 OK)</span>
            </div>
          )}

          {/* Stats 4-Grid Cards */}
          <div className="grid grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl bg-[#f5edf0] border border-[#d1ccdc]/60">
              <span className="text-[11px] text-[#886f68] font-medium block">快取總項目</span>
              <span className="text-xl font-bold font-mono text-[#3d2c2e]">
                {stats?.total_cached_items ?? 0}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[11px] text-emerald-700 font-medium block">命中次數 (HIT)</span>
              <span className="text-xl font-bold font-mono text-emerald-800">
                {stats?.hits ?? 0}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-[11px] text-amber-700 font-medium block">未命中 (MISS)</span>
              <span className="text-xl font-bold font-mono text-amber-800">
                {stats?.misses ?? 0}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
              <span className="text-[11px] text-blue-700 font-medium block">快取命中率</span>
              <span className="text-xl font-bold font-mono text-blue-800">
                {stats?.hit_ratio_percent ?? 0}%
              </span>
            </div>
          </div>

          {/* Active Cached Entries List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#3d2c2e] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#886f68]" />
                目前記憶體中的快取條目 (Active Cached Keys)
              </span>
              <button
                onClick={fetchStats}
                disabled={isLoading}
                className="text-[11px] text-[#886f68] hover:text-[#3d2c2e] flex items-center gap-1 font-medium transition-colors"
                title="重新整理統計數據"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                <span>重新整理</span>
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto rounded-xl border border-[#d1ccdc] bg-[#fbfbfd] divide-y divide-[#d1ccdc]/40">
              {stats?.entries && stats.entries.length > 0 ? (
                stats.entries.map((entry, index) => (
                  <div key={index} className="px-3.5 py-2.5 flex items-center justify-between text-xs hover:bg-[#f5edf0]/60 transition-colors">
                    <div className="truncate max-w-[280px]">
                      <code className="text-[#3d2c2e] font-mono font-medium">{entry.key}</code>
                      <div className="text-[10px] text-[#886f68] flex items-center gap-2 mt-0.5">
                        <span>已快取: {entry.age_seconds}s</span>
                        <span>•</span>
                        <span>總 TTL: {entry.ttl}s</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-right shrink-0">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-mono text-xs font-semibold text-emerald-700">
                        剩餘 {entry.ttl_remaining_seconds}s
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-xs text-[#886f68]">
                  目前記憶體快取為空（未產生任何快取或已被清空）
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#f5edf0]/80 border-t border-[#d1ccdc]">
          <span className="text-[11px] text-[#886f68]">
            端點：<code>POST /api/cache/clear</code>
          </span>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#d1ccdc] text-xs font-medium text-[#424c55] hover:bg-white transition-colors"
            >
              關閉
            </button>
            <button
              onClick={handleClearCache}
              disabled={isClearing}
              className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm hover:shadow transition-all active:scale-95 disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{isClearing ? '清除中...' : '手動清除快取 (Clear Cache)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
