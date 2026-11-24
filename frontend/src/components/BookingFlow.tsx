import React, { useState, useEffect } from 'react';
import { FlightSchedule, Airport, Booking, Passenger, BookingAddon } from '../types';
import { SeatMap } from './SeatMap';
import { BoardingPass } from './BoardingPass';
import { api } from '../services/api';
import {
  Check,
  ChevronRight,
  Plane,
  Clock,
  Luggage,
  ShieldAlert,
  ArrowRight,
  User,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Coffee,
  Wifi,
  Sparkles,
  Plus,
  Minus,
  ShieldCheck,
  Utensils
} from 'lucide-react';

interface BookingFlowProps {
  initialFlight?: FlightSchedule | null;
  airports: Airport[];
  onFinish?: () => void;
}

export const BookingFlow: React.FC<BookingFlowProps> = ({ initialFlight, airports, onFinish }) => {
  const [step, setStep] = useState<number>(initialFlight ? 1 : 1);
  const [selectedFlight, setSelectedFlight] = useState<FlightSchedule | null>(initialFlight || null);
  const [selectedFareTier, setSelectedFareTier] = useState<'basic' | 'standard' | 'flex'>('standard');
  const [passengerCount, setPassengerCount] = useState<number>(1);
  
  const [passengers, setPassengers] = useState<Passenger[]>([
    {
      title: 'Mr',
      first_name: '',
      last_name: '',
      passport_no: '',
      seat: '',
      meal_preference: 'Standard',
    },
  ]);

  const [contactEmail, setContactEmail] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [selectedSeats, setSelectedSeats] = useState<{ [index: number]: string }>({});
  const [activePassengerIndex, setActivePassengerIndex] = useState<number>(0);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Fetch seatmap schema from backend when user enters Step 3 (Seat Selection)
  useEffect(() => {
    if (step === 3 && selectedFlight) {
      api.getSeatMap({ flightNo: selectedFlight.flight_no }).catch(() => {
        // Silently fallback to default seatmap
      });
    }
  }, [step, selectedFlight?.flight_no]);

  // Ancillary Add-ons state
  const [selectedAddons, setSelectedAddons] = useState<{
    lounge: number;
    baggage: number;
    wifi: number;
    michelinMeal: number;
    travelGuard: number;
  }>({
    lounge: 0,
    baggage: 0,
    wifi: 0,
    michelinMeal: 0,
    travelGuard: 0,
  });

  const addonCatalog = [
    {
      id: 'lounge' as const,
      name: 'The Infinity 旗艦貴賓室通行證',
      nameEn: 'The Infinity VIP Lounge Pass',
      price: 1800,
      unit: '人',
      badge: '尊榮禮遇',
      icon: Coffee,
      desc: '享用主廚現煮牛肉麵、精緻法式甜點、淋浴空間與舒壓按摩椅（桃園機場/各大主要樞紐）',
    },
    {
      id: 'baggage' as const,
      name: '超額托運行李額度 (+23KG)',
      nameEn: 'Extra Checked Baggage (+23KG)',
      price: 2200,
      unit: '件',
      badge: '特惠 7 折',
      icon: Luggage,
      desc: '越洋長程安心託運，預購享現場機場櫃檯超額行李牌價 7 折特惠',
    },
    {
      id: 'wifi' as const,
      name: '全航程高空衛星高速 Wi-Fi',
      nameEn: 'In-Flight Satellite High-Speed Wi-Fi',
      price: 650,
      unit: '人',
      badge: '跨洋必備',
      icon: Wifi,
      desc: '高空全程不斷線，支援即時社群通訊、高清影音串流與遠距商務辦公',
    },
    {
      id: 'michelinMeal' as const,
      name: '米其林星級主廚私房珍饌預選',
      nameEn: 'Michelin Gourmet Dining Pre-Order',
      price: 880,
      unit: '人',
      badge: '主廚特饌',
      icon: Utensils,
      desc: '專屬預選鼎泰豐招牌名饌或摘星主廚特製私房犢牛菲力佐精選紅酒',
    },
    {
      id: 'travelGuard' as const,
      name: '長榮尊榮海外全險保障專案',
      nameEn: 'Comprehensive Global Travel Guard',
      price: 980,
      unit: '人',
      badge: '安心同行',
      icon: ShieldCheck,
      desc: '包含班機延誤實支實付補償、海外突發醫療救援與行李遺失全方位高額保障',
    },
  ];

  const updateAddonCount = (key: keyof typeof selectedAddons, delta: number) => {
    setSelectedAddons((prev) => {
      const current = prev[key];
      const maxLimit = key === 'baggage' ? passengers.length * 2 : passengers.length;
      const nextVal = Math.max(0, Math.min(maxLimit, current + delta));
      return { ...prev, [key]: nextVal };
    });
  };

  // Pricing calculations
  const flightBasePrice = (selectedFlight?.fares?.[selectedFareTier]?.price || selectedFlight?.base_price || 15000) * passengers.length;
  const addonsTotal = 
    selectedAddons.lounge * 1800 +
    selectedAddons.baggage * 2200 +
    selectedAddons.wifi * 650 +
    selectedAddons.michelinMeal * 880 +
    selectedAddons.travelGuard * 980;
  const totalPrice = flightBasePrice + addonsTotal;

  const formattedAddons: BookingAddon[] = addonCatalog
    .filter((item) => selectedAddons[item.id] > 0)
    .map((item) => ({
      id: item.id,
      name: item.name,
      nameEn: item.nameEn,
      price: item.price,
      count: selectedAddons[item.id],
      unit: item.unit,
    }));

  // Handle passenger count change
  const handlePassengerCountChange = (count: number) => {
    setPassengerCount(count);
    const newPassengers = [...passengers];
    while (newPassengers.length < count) {
      newPassengers.push({
        title: 'Mr',
        first_name: '',
        last_name: '',
        passport_no: '',
        seat: '',
        meal_preference: 'Standard',
      });
    }
    setPassengers(newPassengers.slice(0, count));
  };

  const handlePassengerChange = (index: number, field: keyof Passenger, value: string) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);
  };

  const handleSeatSelect = (passengerIndex: number, seatNumber: string) => {
    const newSeats = { ...selectedSeats, [passengerIndex]: seatNumber };
    setSelectedSeats(newSeats);
    const updatedPassengers = [...passengers];
    if (updatedPassengers[passengerIndex]) {
      updatedPassengers[passengerIndex].seat = seatNumber;
      setPassengers(updatedPassengers);
    }
    // Auto advance to next passenger if available
    if (passengerIndex < passengers.length - 1) {
      setActivePassengerIndex(passengerIndex + 1);
    }
  };

  const handleConfirmBooking = async () => {
    if (!selectedFlight) return;

    // Form validations
    for (let i = 0; i < passengers.length; i++) {
      if (!passengers[i].first_name.trim() || !passengers[i].last_name.trim()) {
        setErrorMsg(`請填寫第 ${i + 1} 位旅客的完整英文姓名`);
        setStep(2);
        return;
      }
    }

    if (!contactEmail || !contactPhone) {
      setErrorMsg('請提供主要聯絡人 Email 與手機號碼以接收電子機票');
      setStep(2);
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload: Partial<Booking> = {
        flight_no: selectedFlight.flight_no,
        flight_date: selectedFlight.flight_date || new Date().toISOString().split('T')[0],
        origin: selectedFlight.origin,
        destination: selectedFlight.destination,
        cabin_class: selectedFlight.cabin_class || 'Economy',
        fare_family: selectedFareTier.toUpperCase(),
        passengers: passengers,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        total_price: totalPrice,
        addons: formattedAddons,
      };

      const res = await api.createBooking(payload);
      setConfirmedBooking(res.booking);
      setStep(5); // Success step
    } catch (err: any) {
      setErrorMsg(err.message || '訂位失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (confirmedBooking) {
    return (
      <div className="py-8">
        <BoardingPass booking={confirmedBooking} />
        <div className="text-center mt-6">
          <button
            onClick={() => {
              setConfirmedBooking(null);
              setStep(1);
              if (onFinish) onFinish();
            }}
            className="px-6 py-2.5 rounded-xl border border-[#d1ccdc] bg-white text-[#3d2c2e] text-xs font-semibold hover:bg-[#d1ccdc]/30 transition-colors shadow-xs"
          >
            返回預訂首頁
          </button>
        </div>
      </div>
    );
  }

  const stepsList = [
    { num: 1, title: '選擇票價方案' },
    { num: 2, title: '旅客基本資料' },
    { num: 3, title: '客艙預先選位' },
    { num: 4, title: '尊榮精品加購' },
    { num: 5, title: '確認行程結帳' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Progress Steps Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {stepsList.map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-serif text-sm font-bold transition-all ${
                    step === s.num
                      ? 'bg-[#3d2c2e] text-[#f5edf0] ring-4 ring-[#886f68]/30 shadow-md'
                      : step > s.num
                      ? 'bg-[#886f68] text-white'
                      : 'bg-[#d1ccdc]/50 text-[#424c55]'
                  }`}
                >
                  {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <span className={`text-[11px] font-medium mt-1.5 hidden sm:inline ${
                  step === s.num ? 'text-[#3d2c2e] font-bold' : 'text-[#424c55]'
                }`}>
                  {s.title}
                </span>
              </div>
              {idx < stepsList.length - 1 && (
                <div className={`flex-1 h-[2px] mx-2 ${
                  step > idx + 1 ? 'bg-[#886f68]' : 'bg-[#d1ccdc]/60'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Flight summary badge if selected */}
      {selectedFlight && (
        <div className="bg-[#3d2c2e] text-[#f5edf0] rounded-2xl p-4 sm:p-5 mb-8 shadow-md flex flex-wrap items-center justify-between gap-4 border border-[#886f68]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Plane className="w-5 h-5 text-[#d1ccdc]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-lg">{selectedFlight.flight_no}</span>
                <span className="text-xs text-[#d1ccdc] font-mono">({selectedFlight.aircraft_name})</span>
              </div>
              <p className="text-xs text-[#d1ccdc]/80">
                {selectedFlight.origin} ➔ {selectedFlight.destination} • {selectedFlight.flight_date || '即將出發'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-[10px] text-[#d1ccdc] uppercase tracking-wider block">總預估票價</span>
              <span className="font-serif font-bold text-xl text-[#f5edf0]">
                NT$ {totalPrice.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 1: Select Fare Tier */}
      {step === 1 && selectedFlight && (
        <div className="space-y-6">
          <div className="text-center sm:text-left">
            <h2 className="font-serif font-bold text-2xl text-[#3d2c2e]">選擇您的票價方案</h2>
            <p className="text-xs text-[#424c55] mt-1">
              為 {selectedFlight.cabin_class || '經濟艙'} 挑選最適合您出行需求的彈性票種
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Basic */}
            {selectedFlight.fares?.basic && (
              <div
                onClick={() => setSelectedFareTier('basic')}
                className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  selectedFareTier === 'basic'
                    ? 'border-[#3d2c2e] bg-white shadow-lg ring-2 ring-[#886f68]/30'
                    : 'border-[#d1ccdc] bg-white/60 hover:bg-white hover:border-[#886f68]/60'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-serif font-bold text-lg text-[#3d2c2e]">輕省 (Basic)</span>
                    {selectedFareTier === 'basic' && <CheckCircle2 className="w-5 h-5 text-[#3d2c2e]" />}
                  </div>
                  <div className="font-serif font-bold text-2xl text-[#3d2c2e] mb-4">
                    NT$ {selectedFlight.fares.basic.price.toLocaleString()}
                    <span className="text-xs font-sans text-[#424c55] font-normal"> /人</span>
                  </div>
                  <ul className="text-xs text-[#424c55] space-y-2 border-t border-[#d1ccdc]/60 pt-4">
                    <li className="flex items-center gap-2">
                      <Luggage className="w-3.5 h-3.5 text-[#886f68]" />
                      托運行李: {selectedFlight.fares.basic.baggage}
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#886f68]" />
                      改票手續費: {selectedFlight.fares.basic.change_fee}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#886f68]" />
                      哩程累計: {selectedFlight.fares.basic.miles_accrual}
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Standard (Recommended) */}
            {selectedFlight.fares?.standard && (
              <div
                onClick={() => setSelectedFareTier('standard')}
                className={`p-6 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                  selectedFareTier === 'standard'
                    ? 'border-[#886f68] bg-white shadow-xl ring-2 ring-[#886f68]/40'
                    : 'border-[#d1ccdc] bg-white/60 hover:bg-white hover:border-[#886f68]'
                }`}
              >
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#886f68] text-white text-[10px] font-bold tracking-wider uppercase">
                  最受歡迎推薦
                </div>
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-serif font-bold text-lg text-[#3d2c2e]">標準 (Standard)</span>
                    {selectedFareTier === 'standard' && <CheckCircle2 className="w-5 h-5 text-[#886f68]" />}
                  </div>
                  <div className="font-serif font-bold text-2xl text-[#3d2c2e] mb-4">
                    NT$ {selectedFlight.fares.standard.price.toLocaleString()}
                    <span className="text-xs font-sans text-[#424c55] font-normal"> /人</span>
                  </div>
                  <ul className="text-xs text-[#424c55] space-y-2 border-t border-[#d1ccdc]/60 pt-4">
                    <li className="flex items-center gap-2">
                      <Luggage className="w-3.5 h-3.5 text-[#886f68]" />
                      托運行李: <strong>{selectedFlight.fares.standard.baggage}</strong>
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#886f68]" />
                      改票政策: {selectedFlight.fares.standard.change_fee}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#886f68]" />
                      預先選位: {selectedFlight.fares.standard.seat_selection}
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#886f68]" />
                      哩程累計: {selectedFlight.fares.standard.miles_accrual}
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Flex */}
            {selectedFlight.fares?.flex && (
              <div
                onClick={() => setSelectedFareTier('flex')}
                className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  selectedFareTier === 'flex'
                    ? 'border-[#3d2c2e] bg-white shadow-lg ring-2 ring-[#886f68]/30'
                    : 'border-[#d1ccdc] bg-white/60 hover:bg-white hover:border-[#886f68]/60'
                }`}
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-serif font-bold text-lg text-[#3d2c2e]">尊榮暢行 (Flex)</span>
                    {selectedFareTier === 'flex' && <CheckCircle2 className="w-5 h-5 text-[#3d2c2e]" />}
                  </div>
                  <div className="font-serif font-bold text-2xl text-[#3d2c2e] mb-4">
                    NT$ {selectedFlight.fares.flex.price.toLocaleString()}
                    <span className="text-xs font-sans text-[#424c55] font-normal"> /人</span>
                  </div>
                  <ul className="text-xs text-[#424c55] space-y-2 border-t border-[#d1ccdc]/60 pt-4">
                    <li className="flex items-center gap-2">
                      <Luggage className="w-3.5 h-3.5 text-[#886f68]" />
                      托運行李: <strong>{selectedFlight.fares.flex.baggage}</strong>
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#886f68]" />
                      改票政策: 免手續費改簽
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#886f68]" />
                      優先劃位與專屬登機通道
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#886f68]" />
                      哩程累計: {selectedFlight.fares.flex.miles_accrual}
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 rounded-xl bg-[#3d2c2e] hover:bg-[#3d2c2e]/90 text-[#f5edf0] text-xs font-semibold tracking-wider flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <span>下一步：填寫旅客資料</span>
              <ChevronRight className="w-4 h-4 text-[#886f68]" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Passenger Details */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif font-bold text-2xl text-[#3d2c2e]">填寫旅客與聯絡資料</h2>
              <p className="text-xs text-[#424c55] mt-1">請填寫與護照完全相同的英文姓名</p>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#424c55]">
              <span>乘客人數:</span>
              <select
                value={passengerCount}
                onChange={(e) => handlePassengerCountChange(Number(e.target.value))}
                className="px-2.5 py-1.5 rounded-lg border border-[#d1ccdc] bg-white font-medium text-[#3d2c2e]"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} 位旅客
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Passenger cards */}
          {passengers.map((p, idx) => (
            <div key={idx} className="bg-white/80 rounded-2xl border border-[#d1ccdc] p-6 shadow-sm">
              <div className="flex items-center gap-2 border-b border-[#d1ccdc]/60 pb-3 mb-4">
                <User className="w-4 h-4 text-[#886f68]" />
                <span className="font-serif font-bold text-base text-[#3d2c2e]">
                  旅客 {idx + 1}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#424c55] mb-1">稱謂 / Title</label>
                  <select
                    value={p.title}
                    onChange={(e) => handlePassengerChange(idx, 'title', e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#d1ccdc] bg-[#f5edf0]/50"
                  >
                    <option value="Mr">Mr (先生)</option>
                    <option value="Ms">Ms (女士)</option>
                    <option value="Mrs">Mrs (太太)</option>
                    <option value="Dr">Dr (博士/醫師)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#424c55] mb-1">
                    英文姓氏 / Last Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="如: WANG"
                    value={p.last_name}
                    onChange={(e) => handlePassengerChange(idx, 'last_name', e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#d1ccdc] bg-[#f5edf0]/50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#424c55] mb-1">
                    英文名字 / First Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="如: CHIEH"
                    value={p.first_name}
                    onChange={(e) => handlePassengerChange(idx, 'first_name', e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#d1ccdc] bg-[#f5edf0]/50 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#424c55] mb-1">餐點偏好 / Meal</label>
                  <select
                    value={p.meal_preference}
                    onChange={(e) => handlePassengerChange(idx, 'meal_preference', e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-[#d1ccdc] bg-[#f5edf0]/50"
                  >
                    <option value="Standard">一般標準餐 (Standard)</option>
                    <option value="Vegetarian">東方素食餐 (Vegetarian)</option>
                    <option value="Fruit">水果舒食餐 (Fruit Meal)</option>
                    <option value="LowFat">低脂輕食餐 (Low Fat)</option>
                    <option value="Kosher">猶太潔食餐 (Kosher)</option>
                  </select>
                </div>
              </div>
            </div>
          ))}

          {/* Contact info card */}
          <div className="bg-white/80 rounded-2xl border border-[#d1ccdc] p-6 shadow-sm">
            <h3 className="font-serif font-bold text-base text-[#3d2c2e] mb-4">
              訂位聯絡人資訊 (電子機票與航訊通知)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#424c55] mb-1">
                  電子郵件信箱 / Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#d1ccdc] bg-[#f5edf0]/50 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#424c55] mb-1">
                  聯絡手機電話 / Mobile <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="+886 912 345 678"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-[#d1ccdc] bg-[#f5edf0]/50 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(1)}
              className="px-5 py-2.5 rounded-xl border border-[#d1ccdc] text-[#424c55] text-xs font-medium hover:bg-[#d1ccdc]/30"
            >
              返回上一步
            </button>
            <button
              onClick={() => {
                if (!passengers[0].first_name || !passengers[0].last_name) {
                  setErrorMsg('請先填寫第一位旅客的姓名');
                  return;
                }
                setErrorMsg('');
                setStep(3);
              }}
              className="px-6 py-3 rounded-xl bg-[#3d2c2e] hover:bg-[#3d2c2e]/90 text-[#f5edf0] text-xs font-semibold tracking-wider flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <span>下一步：客艙選位</span>
              <ChevronRight className="w-4 h-4 text-[#886f68]" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Interactive Seat Selection */}
      {step === 3 && selectedFlight && (
        <div className="space-y-6">
          <SeatMap
            aircraftCode={selectedFlight.aircraft}
            aircraftName={selectedFlight.aircraft_name}
            cabinClass={selectedFlight.cabin_class || 'Economy'}
            passengers={passengers}
            selectedSeats={selectedSeats}
            onSeatSelect={handleSeatSelect}
            activePassengerIndex={activePassengerIndex}
            setActivePassengerIndex={setActivePassengerIndex}
          />

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2.5 rounded-xl border border-[#d1ccdc] text-[#424c55] text-xs font-medium hover:bg-[#d1ccdc]/30"
            >
              返回上一步
            </button>
            <button
              onClick={() => setStep(4)}
              className="px-6 py-3 rounded-xl bg-[#3d2c2e] hover:bg-[#3d2c2e]/90 text-[#f5edf0] text-xs font-semibold tracking-wider flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <span>下一步：尊榮精品加購</span>
              <ChevronRight className="w-4 h-4 text-[#886f68]" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Boutique Travel Add-ons (精品加購服務) */}
      {step === 4 && selectedFlight && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#d1ccdc]/60 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#886f68]/15 text-[#886f68] text-xs font-semibold mb-2 tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                EVA Boutique Travel Services
              </div>
              <h2 className="font-serif font-bold text-2xl text-[#3d2c2e]">長榮尊榮精品加購服務</h2>
              <p className="text-xs text-[#424c55] mt-1">
                為全體 {passengers.length} 位旅客量身打造越洋極致飛行體驗，享線上專屬禮遇牌價
              </p>
            </div>
            {addonsTotal > 0 && (
              <div className="text-right">
                <span className="text-[10px] text-[#886f68] uppercase font-bold tracking-wider block">加購小計</span>
                <span className="font-serif font-bold text-lg text-[#3d2c2e]">
                  + NT$ {addonsTotal.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Addons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {addonCatalog.map((addon) => {
              const Icon = addon.icon;
              const count = selectedAddons[addon.id];
              const isSelected = count > 0;

              return (
                <div
                  key={addon.id}
                  className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white border-[#886f68] shadow-md ring-1 ring-[#886f68]/30'
                      : 'bg-white/80 border-[#d1ccdc] hover:bg-white hover:border-[#886f68]/60 shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-[#3d2c2e] text-[#f5edf0]' : 'bg-[#d1ccdc]/40 text-[#424c55]'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-serif font-bold text-base text-[#3d2c2e]">{addon.name}</h3>
                          </div>
                          <p className="text-[10px] font-mono text-[#886f68]">{addon.nameEn}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#886f68]/15 text-[#886f68] shrink-0">
                        {addon.badge}
                      </span>
                    </div>

                    <p className="text-xs text-[#424c55] leading-relaxed my-3">
                      {addon.desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#d1ccdc]/60 pt-3 mt-1">
                    <div>
                      <span className="font-serif font-bold text-lg text-[#3d2c2e]">
                        NT$ {addon.price.toLocaleString()}
                      </span>
                      <span className="text-xs text-[#424c55]"> /{addon.unit}</span>
                    </div>

                    {/* Stepper Counter */}
                    <div className="flex items-center gap-2 bg-[#f5edf0] rounded-xl p-1 border border-[#d1ccdc]">
                      <button
                        onClick={() => updateAddonCount(addon.id, -1)}
                        disabled={count <= 0}
                        className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-[#3d2c2e] hover:bg-[#d1ccdc]/30 disabled:opacity-40 disabled:hover:bg-white transition-all shadow-2xs"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-7 text-center font-mono font-bold text-sm text-[#3d2c2e]">
                        {count}
                      </span>
                      <button
                        onClick={() => updateAddonCount(addon.id, 1)}
                        className="w-7 h-7 rounded-lg bg-[#3d2c2e] flex items-center justify-center text-[#f5edf0] hover:bg-[#3d2c2e]/90 transition-all shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setStep(3)}
              className="px-5 py-2.5 rounded-xl border border-[#d1ccdc] text-[#424c55] text-xs font-medium hover:bg-[#d1ccdc]/30"
            >
              返回選位
            </button>
            <button
              onClick={() => setStep(5)}
              className="px-6 py-3 rounded-xl bg-[#3d2c2e] hover:bg-[#3d2c2e]/90 text-[#f5edf0] text-xs font-semibold tracking-wider flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <span>下一步：確認行程與結帳</span>
              <ChevronRight className="w-4 h-4 text-[#886f68]" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Review and Payment (確認行程與付款) */}
      {step === 5 && selectedFlight && (
        <div className="space-y-6">
          <div className="text-center sm:text-left">
            <h2 className="font-serif font-bold text-2xl text-[#3d2c2e]">確認行程與結帳</h2>
            <p className="text-xs text-[#424c55] mt-1">請核對您的訂單與精品加購明細，確認後即可開票並生成專屬電子登機證</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Flight Itinerary Card */}
            <div className="md:col-span-2 space-y-5">
              <div className="bg-white/90 rounded-2xl border border-[#d1ccdc] p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#d1ccdc]/60 pb-3">
                  <div className="flex items-center gap-2">
                    <Plane className="w-4 h-4 text-[#886f68]" />
                    <span className="font-serif font-bold text-lg text-[#3d2c2e]">航班行程</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#886f68]">{selectedFlight.flight_no}</span>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-serif font-bold text-2xl text-[#3d2c2e]">{selectedFlight.origin}</p>
                    <p className="text-xs text-[#424c55]">{selectedFlight.origin_airport?.city}</p>
                    <p className="text-xs text-[#886f68] font-mono mt-1">{selectedFlight.dep_time}</p>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-[#424c55]">直飛</span>
                    <Plane className="w-5 h-5 text-[#886f68] my-1" />
                    <span className="text-[10px] text-[#424c55] font-mono">{selectedFlight.flight_date}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-serif font-bold text-2xl text-[#3d2c2e]">{selectedFlight.destination}</p>
                    <p className="text-xs text-[#424c55]">{selectedFlight.destination_airport?.city}</p>
                    <p className="text-xs text-[#886f68] font-mono mt-1">{selectedFlight.arr_time}</p>
                  </div>
                </div>

                {/* Passenger list review */}
                <div className="border-t border-[#d1ccdc]/60 pt-4 space-y-2">
                  <span className="text-xs font-bold text-[#424c55] uppercase tracking-wider block">旅客名單與座位</span>
                  {passengers.map((p, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-2 px-3.5 bg-[#f5edf0]/60 rounded-xl">
                      <span className="font-medium text-[#3d2c2e]">
                        {idx + 1}. {p.last_name} / {p.first_name} ({p.title})
                      </span>
                      <span className="font-mono text-[#886f68] font-bold">
                        座位: {p.seat || '系統自動劃位'} • 餐點: {p.meal_preference}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Add-ons Review */}
              {formattedAddons.length > 0 && (
                <div className="bg-white/90 rounded-2xl border border-[#d1ccdc] p-6 shadow-sm">
                  <div className="flex items-center gap-2 border-b border-[#d1ccdc]/60 pb-3 mb-3">
                    <Sparkles className="w-4 h-4 text-[#886f68]" />
                    <span className="font-serif font-bold text-base text-[#3d2c2e]">加購尊榮服務明細</span>
                  </div>
                  <div className="space-y-2">
                    {formattedAddons.map((addon) => (
                      <div key={addon.id} className="flex items-center justify-between text-xs py-1.5 px-3 bg-[#f5edf0]/40 rounded-xl">
                        <span className="font-medium text-[#3d2c2e]">{addon.name} ({addon.count} {addon.unit})</span>
                        <span className="font-mono font-bold text-[#886f68]">NT$ {(addon.price * addon.count).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Price Breakdown Card */}
            <div className="bg-white/90 rounded-2xl border border-[#d1ccdc] p-6 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="font-serif font-bold text-lg text-[#3d2c2e] border-b border-[#d1ccdc]/60 pb-3 mb-4">
                  費用明細
                </h3>

                <div className="space-y-2.5 text-xs text-[#424c55]">
                  <div className="flex justify-between">
                    <span>機票票價 ({selectedFareTier.toUpperCase()}) x {passengers.length}</span>
                    <span className="font-mono text-[#3d2c2e]">NT$ {flightBasePrice.toLocaleString()}</span>
                  </div>
                  {addonsTotal > 0 && (
                    <div className="flex justify-between">
                      <span>尊榮精品加購小計</span>
                      <span className="font-mono text-[#886f68] font-bold">+ NT$ {addonsTotal.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>燃油附加費與機場稅</span>
                    <span className="font-mono text-emerald-700 font-semibold">已包含</span>
                  </div>
                  <div className="flex justify-between">
                    <span>客艙預先選位費</span>
                    <span className="font-mono text-emerald-700 font-semibold">尊榮免費贈送</span>
                  </div>

                  <div className="border-t border-[#d1ccdc] pt-4 mt-4 flex justify-between items-baseline">
                    <span className="font-bold text-sm text-[#3d2c2e]">應付總金額</span>
                    <span className="font-serif font-bold text-2xl text-[#3d2c2e]">
                      NT$ {totalPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#d1ccdc]/60">
                <button
                  disabled={isSubmitting}
                  onClick={handleConfirmBooking}
                  className="w-full py-3.5 rounded-xl bg-[#3d2c2e] hover:bg-[#3d2c2e]/90 text-[#f5edf0] text-xs font-semibold tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-50"
                >
                  <CreditCard className="w-4 h-4 text-[#886f68]" />
                  <span>{isSubmitting ? '正在為您開票中...' : '確認付款並發行機票'}</span>
                </button>
                <p className="text-[10px] text-center text-[#424c55]/80 mt-2">
                  長榮航空虛擬航線系統 • 即刻發行專屬電子登機證
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-start pt-2">
            <button
              onClick={() => setStep(4)}
              className="px-5 py-2.5 rounded-xl border border-[#d1ccdc] text-[#424c55] text-xs font-medium hover:bg-[#d1ccdc]/30"
            >
              返回加購
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
