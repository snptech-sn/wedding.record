import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { EventItem, GiftRecord, AllTimeStats } from '../types';
import { formatCurrency, formatDateKhmer, EVENT_TYPE_LABELS } from '../utils/formatters';
import {
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  DollarSign,
  Banknote,
  CheckCircle2,
  Clock,
  Users,
  Calendar,
  Layers,
  ChevronDown,
  Plus,
  Sparkles,
  Info,
} from 'lucide-react';

interface DataVisualizationViewProps {
  events: EventItem[];
  activeEvent: EventItem | null;
  gifts: GiftRecord[];
  allTimeStats: AllTimeStats;
  onSelectEvent: (eventId: string) => void;
  onOpenNewGiftModal?: () => void;
}

type CurrencyViewMode = 'USD' | 'KHR' | 'BOTH';

export const DataVisualizationView: React.FC<DataVisualizationViewProps> = ({
  events,
  activeEvent,
  gifts,
  allTimeStats,
  onSelectEvent,
  onOpenNewGiftModal,
}) => {
  // Bar Chart Currency Mode Toggle
  const [currencyMode, setCurrencyMode] = useState<CurrencyViewMode>('BOTH');
  const [includePendingInBar, setIncludePendingInBar] = useState<boolean>(true);

  // 1. Prepare Bar Chart Data: Comparing total gift amounts across different events
  const barChartData = useMemo(() => {
    if (!events || events.length === 0) return [];

    return events.map((evt) => {
      const eventGifts = gifts.filter((g) => g.eventId === evt.id);
      
      let paidUSD = 0;
      let paidKHR = 0;
      let pendingUSD = 0;
      let pendingKHR = 0;
      let paidCount = 0;
      let pendingCount = 0;

      for (const g of eventGifts) {
        if (g.status === 'PAID') {
          paidCount++;
          if (g.currency === 'USD') paidUSD += g.amount;
          else paidKHR += g.amount;
        } else {
          pendingCount++;
          if (g.currency === 'USD') pendingUSD += g.amount;
          else pendingKHR += g.amount;
        }
      }

      const totalUSD = includePendingInBar ? (paidUSD + pendingUSD) : paidUSD;
      const totalKHR = includePendingInBar ? (paidKHR + pendingKHR) : paidKHR;

      return {
        id: evt.id,
        title: evt.title,
        shortTitle: evt.title.length > 15 ? `${evt.title.slice(0, 14)}…` : evt.title,
        date: evt.date,
        eventType: evt.eventType,
        totalUSD,
        totalKHR,
        paidUSD,
        paidKHR,
        pendingUSD,
        pendingKHR,
        totalGuests: eventGifts.length,
        paidCount,
        pendingCount,
        isActive: activeEvent?.id === evt.id,
      };
    });
  }, [events, gifts, activeEvent, includePendingInBar]);

  // 2. Prepare Pie Chart Data: PAID vs PENDING ratio for the active event
  const activeEventGifts = useMemo(() => {
    if (!activeEvent) return [];
    return gifts.filter((g) => g.eventId === activeEvent.id);
  }, [gifts, activeEvent]);

  const pieChartData = useMemo(() => {
    let paidCount = 0;
    let pendingCount = 0;
    let paidUSD = 0;
    let paidKHR = 0;
    let pendingUSD = 0;
    let pendingKHR = 0;

    for (const g of activeEventGifts) {
      if (g.status === 'PAID') {
        paidCount++;
        if (g.currency === 'USD') paidUSD += g.amount;
        else paidKHR += g.amount;
      } else {
        pendingCount++;
        if (g.currency === 'USD') pendingUSD += g.amount;
        else pendingKHR += g.amount;
      }
    }

    const totalCount = paidCount + pendingCount;

    return {
      totalCount,
      paidCount,
      pendingCount,
      paidUSD,
      paidKHR,
      pendingUSD,
      pendingKHR,
      paidPercentage: totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0,
      pendingPercentage: totalCount > 0 ? Math.round((pendingCount / totalCount) * 100) : 0,
      chartSlices: [
        {
          name: 'បានទទួលរួច (PAID)',
          value: paidCount,
          percentage: totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0,
          color: '#10b981', // Emerald 500
          usd: paidUSD,
          khr: paidKHR,
        },
        {
          name: 'មិនទាន់បង់ (PENDING)',
          value: pendingCount,
          percentage: totalCount > 0 ? Math.round((pendingCount / totalCount) * 100) : 0,
          color: '#f59e0b', // Amber 500
          usd: pendingUSD,
          khr: pendingKHR,
        },
      ].filter((slice) => slice.value > 0),
    };
  }, [activeEventGifts]);

  // Highest event summary
  const topEventByUSD = useMemo(() => {
    if (!barChartData.length) return null;
    return [...barChartData].sort((a, b) => b.totalUSD - a.totalUSD)[0];
  }, [barChartData]);

  // Payment method breakdown for active event
  const paymentMethodStats = useMemo(() => {
    let cash = 0;
    let transfer = 0;
    let envelope = 0;
    for (const g of activeEventGifts) {
      if (g.paymentMethod === 'CASH') cash++;
      else if (g.paymentMethod === 'TRANSFER') transfer++;
      else if (g.paymentMethod === 'ENVELOPE') envelope++;
    }
    return [
      { name: 'សាច់ប្រាក់សុទ្ធ (Cash)', count: cash, color: '#3b82f6' },
      { name: 'ផ្ទេរតាមធនាគារ (Bakong/ABA)', count: transfer, color: '#8b5cf6' },
      { name: 'ស្រោមសំបុត្រ (Envelope)', count: envelope, color: '#ec4899' },
    ];
  }, [activeEventGifts]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Top Banner & Insight Overview */}
      <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-amber-900 text-white rounded-2xl p-4 sm:p-6 shadow-md border border-rose-800/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/10 text-rose-200 text-xs font-semibold backdrop-blur-xs border border-white/10 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>ការវិភាគទិន្នន័យក្រាហ្វិក (Data Analytics & Charts)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>ផ្ទាំងទិដ្ឋភាពទូទៅនៃចំណងដៃ</span>
            </h2>
            <p className="text-xs sm:text-sm text-rose-100/90 mt-1 max-w-2xl">
              ប្រៀបធៀបទំហំទឹកប្រាក់ចំណងដៃតាមកម្មវិធីនីមួយៗ និងមើលសមាមាត្រស្ថានភាពទូទាត់ (បានទទួលរួច vs មិនទាន់បង់) តាមរយៈក្រាហ្វិក Recharts
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 bg-black/20 backdrop-blur-xs p-3 rounded-xl border border-white/10 shrink-0">
            <div className="text-center px-3 border-r border-white/10">
              <span className="text-[11px] text-rose-200 block">កម្មវិធីសរុប</span>
              <span className="text-lg sm:text-xl font-bold text-white">{events.length}</span>
            </div>
            <div className="text-center px-3 border-r border-white/10">
              <span className="text-[11px] text-rose-200 block">ភ្ញៀវទាំងអស់</span>
              <span className="text-lg sm:text-xl font-bold text-white">{gifts.length} នាក់</span>
            </div>
            <div className="text-center px-3">
              <span className="text-[11px] text-rose-200 block">ចំណូលសរុប (USD)</span>
              <span className="text-lg sm:text-xl font-bold text-amber-300">
                ${allTimeStats.totalPaidUSD.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout: Left Column (Bar Chart) & Right Column (Pie Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* 1. BAR CHART: Comparing total gift amounts across different events */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            {/* Header & Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200/80 dark:border-rose-800/60 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    ប្រៀបធៀបចំណងដៃតាមកម្មវិធី
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    ទំហំទឹកប្រាក់សរុបនៅតាមកម្មវិធីផ្សេងៗគ្នា
                  </p>
                </div>
              </div>

              {/* Currency Mode Selector */}
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/70 dark:border-slate-700 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setCurrencyMode('BOTH')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    currencyMode === 'BOTH'
                      ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  ទាំងពីរ (USD/KHR)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrencyMode('USD')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    currencyMode === 'USD'
                      ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  ដុល្លារ ($)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrencyMode('KHR')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    currencyMode === 'KHR'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  រៀល (៛)
                </button>
              </div>
            </div>

            {/* Filter checkbox: include pending */}
            <div className="flex items-center justify-between mt-3 mb-2 text-xs text-slate-500 dark:text-slate-400">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includePendingInBar}
                  onChange={(e) => setIncludePendingInBar(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-rose-600 focus:ring-rose-500 dark:bg-slate-800"
                />
                <span>រាប់បញ្ចូលទាំងប្រាក់មិនទាន់បង់ (Pending Amounts)</span>
              </label>
              <span className="text-[11px] text-slate-400">
                {events.length} កម្មវិធី
              </span>
            </div>

            {/* Bar Chart Area */}
            {barChartData.length === 0 ? (
              <div className="h-72 flex flex-col items-center justify-center text-slate-400 text-sm">
                <Info className="w-8 h-8 mb-2 stroke-1 text-slate-300 dark:text-slate-600" />
                <p>ពុំទាន់មានទិន្នន័យកម្មវិធីសម្រាប់បង្ហាញក្រាហ្វិកនៅឡើយទេ</p>
              </div>
            ) : (
              <div className="w-full h-80 mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barChartData}
                    margin={{ top: 20, right: 15, left: -5, bottom: 25 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e2e8f0"
                      className="dark:stroke-slate-800"
                    />
                    <XAxis
                      dataKey="shortTitle"
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      interval={0}
                      angle={-18}
                      textAnchor="end"
                      height={40}
                    />
                    <YAxis
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      tickFormatter={(val: number) => {
                        if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
                        if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
                        return `${val}`;
                      }}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1.5 min-w-[210px] animate-in fade-in zoom-in-95">
                            <div className="font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-1.5">
                              {data.title}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                              <span>កាលបរិច្ឆេទ:</span>
                              <span className="font-medium text-slate-700 dark:text-slate-300">
                                {formatDateKhmer(data.date)}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                              <span>ចំនួនភ្ញៀវ:</span>
                              <span className="font-medium text-slate-700 dark:text-slate-300">
                                {data.totalGuests} នាក់ (បានបង់: {data.paidCount})
                              </span>
                            </div>
                            
                            {(currencyMode === 'BOTH' || currencyMode === 'USD') && (
                              <div className="flex items-center justify-between pt-1 text-emerald-600 dark:text-emerald-400 font-semibold border-t border-slate-100 dark:border-slate-800">
                                <span>ទឹកប្រាក់ដុល្លារ:</span>
                                <span>${data.totalUSD.toLocaleString()}</span>
                              </div>
                            )}

                            {(currencyMode === 'BOTH' || currencyMode === 'KHR') && (
                              <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 font-semibold">
                                <span>ទឹកប្រាក់រៀល:</span>
                                <span>{data.totalKHR.toLocaleString()} ៛</span>
                              </div>
                            )}

                            {data.isActive && (
                              <div className="mt-1 pt-1 text-[10px] text-center font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 py-0.5 rounded-md">
                                ★ កម្មវិធីកំពុងជ្រើសរើសបច្ចុប្បន្ន
                              </div>
                            )}
                          </div>
                        );
                      }}
                    />
                    <Legend
                      wrapperStyle={{ paddingTop: '8px', fontSize: '12px' }}
                      iconType="circle"
                    />

                    {/* Bars based on selected currency mode */}
                    {(currencyMode === 'BOTH' || currencyMode === 'USD') && (
                      <Bar
                        dataKey="totalUSD"
                        name="ប្រាក់ដុល្លារ ($ USD)"
                        fill="#10b981" // Emerald
                        radius={[6, 6, 0, 0]}
                        maxBarSize={44}
                      >
                        {barChartData.map((entry) => (
                          <Cell
                            key={`cell-usd-${entry.id}`}
                            fill={entry.isActive ? '#059669' : '#10b981'}
                            stroke={entry.isActive ? '#047857' : 'none'}
                            strokeWidth={entry.isActive ? 2 : 0}
                          />
                        ))}
                      </Bar>
                    )}

                    {(currencyMode === 'BOTH' || currencyMode === 'KHR') && (
                      <Bar
                        dataKey="totalKHR"
                        name="ប្រាក់រៀល (៛ KHR)"
                        fill="#3b82f6" // Blue
                        radius={[6, 6, 0, 0]}
                        maxBarSize={44}
                      >
                        {barChartData.map((entry) => (
                          <Cell
                            key={`cell-khr-${entry.id}`}
                            fill={entry.isActive ? '#1d4ed8' : '#3b82f6'}
                            stroke={entry.isActive ? '#1e40af' : 'none'}
                            strokeWidth={entry.isActive ? 2 : 0}
                          />
                        ))}
                      </Bar>
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Quick Insight Footer */}
          {topEventByUSD && (
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span>
                  កម្មវិធីទទួលបានដុល្លារច្រើនជាងគេ: <strong className="text-slate-800 dark:text-slate-200">{topEventByUSD.title}</strong> (${topEventByUSD.totalUSD.toLocaleString()})
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                ចុចជ្រើសរើសកម្មវិធីដើម្បីមើល Pie Chart លម្អិត
              </span>
            </div>
          )}
        </div>

        {/* 2. PIE CHART: Ratio of PAID vs PENDING status for the active event */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div>
            {/* Header & Active Event Dropdown */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                  <PieChartIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    សមាមាត្រស្ថានភាពទូទាត់
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    PAID vs PENDING សម្រាប់កម្មវិធីសកម្ម
                  </p>
                </div>
              </div>

              {/* Event Quick Switcher */}
              <div className="relative">
                <select
                  value={activeEvent?.id || ''}
                  onChange={(e) => onSelectEvent(e.target.value)}
                  className="text-xs font-medium bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-rose-500 cursor-pointer pr-6"
                >
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Event Banner */}
            {activeEvent && (
              <div className="mt-3 p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                  <span className="font-semibold text-rose-900 dark:text-rose-200 truncate">
                    {activeEvent.title}
                  </span>
                </div>
                <span className="text-slate-500 dark:text-slate-400 shrink-0 text-[11px]">
                  {activeEventGifts.length} ចំណងដៃ
                </span>
              </div>
            )}

            {/* Pie Chart Rendering Area */}
            {pieChartData.totalCount === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400 text-xs">
                <Info className="w-8 h-8 mb-2 stroke-1 text-slate-300 dark:text-slate-600" />
                <p className="font-medium text-slate-600 dark:text-slate-400">
                  មិនទាន់មានទិន្នន័យចំណងដៃក្នុងកម្មវិធីនេះទេ
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  សូមកត់ត្រាចំណងដៃថ្មីដើម្បីមើលក្រាហ្វិកសមាមាត្រ
                </p>
                {onOpenNewGiftModal && (
                  <button
                    type="button"
                    onClick={onOpenNewGiftModal}
                    className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-semibold text-xs transition-colors shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>កត់ចំណងដៃដំបូង</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="w-full h-64 mt-1 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData.chartSlices}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={88}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ percent }) => `${((percent ?? 0) * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {pieChartData.chartSlices.map((entry, index) => (
                        <Cell
                          key={`slice-${index}`}
                          fill={entry.color}
                          stroke="#ffffff"
                          strokeWidth={2}
                          className="dark:stroke-slate-900 transition-opacity hover:opacity-85"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white dark:bg-slate-900 p-3 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1 min-w-[180px]">
                            <div className="font-bold flex items-center gap-1.5 text-slate-900 dark:text-white">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: data.color }}
                              />
                              <span>{data.name}</span>
                            </div>
                            <div className="text-slate-600 dark:text-slate-400 flex justify-between">
                              <span>ចំនួនភ្ញៀវ:</span>
                              <span className="font-bold text-slate-900 dark:text-white">
                                {data.value} នាក់ ({data.percentage}%)
                              </span>
                            </div>
                            <div className="text-emerald-600 dark:text-emerald-400 flex justify-between">
                              <span>សរុប USD:</span>
                              <span className="font-semibold">${data.usd.toLocaleString()}</span>
                            </div>
                            <div className="text-blue-600 dark:text-blue-400 flex justify-between">
                              <span>សរុប KHR:</span>
                              <span className="font-semibold">{data.khr.toLocaleString()} ៛</span>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                {/* Center Stat inside Donut */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[62%] text-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-900 dark:text-white block leading-none">
                    {pieChartData.totalCount}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                    ចំណងដៃ
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Ratio Comparison Cards */}
          <div className="grid grid-cols-2 gap-2.5 mt-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            {/* PAID CARD */}
            <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-900/40 rounded-xl p-2.5">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>បានទទួល (PAID)</span>
                </span>
                <span className="font-extrabold text-emerald-700 dark:text-emerald-400">
                  {pieChartData.paidPercentage}%
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {pieChartData.paidCount} នាក់
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 space-y-0.5">
                <div>${pieChartData.paidUSD.toLocaleString()}</div>
                <div>{pieChartData.paidKHR.toLocaleString()} ៛</div>
              </div>
            </div>

            {/* PENDING CARD */}
            <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/40 rounded-xl p-2.5">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>មិនទាន់បង់ (PENDING)</span>
                </span>
                <span className="font-extrabold text-amber-700 dark:text-amber-400">
                  {pieChartData.pendingPercentage}%
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {pieChartData.pendingCount} នាក់
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 space-y-0.5">
                <div>${pieChartData.pendingUSD.toLocaleString()}</div>
                <div>{pieChartData.pendingKHR.toLocaleString()} ៛</div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Additional Visual Insights: Payment Method Distribution for active event */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              មធ្យោបាយទូទាត់សម្រាប់ «{activeEvent?.title || 'កម្មវិធីសកម្ម'}»
            </h4>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            សាច់ប្រាក់សុទ្ធ vs ការផ្ទេរធនាគារ vs ស្រោមសំបុត្រ
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {paymentMethodStats.map((item) => {
            const pct = activeEventGifts.length > 0 
              ? Math.round((item.count / activeEventGifts.length) * 100) 
              : 0;
            return (
              <div
                key={item.name}
                className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-2"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {item.name}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {item.count} ចំណងដៃ ({pct}%)
                  </div>
                </div>
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-2xs"
                  style={{ backgroundColor: item.color }}
                >
                  {pct}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
