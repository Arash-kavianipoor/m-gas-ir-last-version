import React, { useMemo, useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import { Product, StockMovement } from '../types';
import { toPersianDigits, formatNumberFa, formatCurrencyToman } from '../utils/persian';
import { TrendingUp, Info, AlertTriangle, Boxes, Coins, Flame } from 'lucide-react';

interface TopTurnoverStockChartProps {
  products: Product[];
  stockMovements: StockMovement[];
  stockQuantities: Record<string, Record<string, number>>;
  onProductClick?: (productId: string) => void;
}

export type ChartAnalysisMode = 'TURNOVER' | 'VALUE' | 'DEFICIT';

export const TopTurnoverStockChart: React.FC<TopTurnoverStockChartProps> = ({
  products,
  stockMovements,
  stockQuantities,
  onProductClick
}) => {
  const [analysisMode, setAnalysisMode] = useState<ChartAnalysisMode>('TURNOVER');
  const [topCount, setTopCount] = useState<5 | 10>(5);

  const chartData = useMemo(() => {
    // 1. Calculate turnover metrics per product
    const turnoverStats: Record<string, { totalMoved: number; inCount: number; outCount: number }> = {};

    stockMovements.forEach((m) => {
      if (!turnoverStats[m.product_id]) {
        turnoverStats[m.product_id] = { totalMoved: 0, inCount: 0, outCount: 0 };
      }
      const qty = Math.abs(m.quantity || 0);
      turnoverStats[m.product_id].totalMoved += qty;
      if (m.movement_type === 'STOCK_IN' || m.movement_type === 'PURCHASE' || m.movement_type === 'RETURN_IN') {
        turnoverStats[m.product_id].inCount += qty;
      } else {
        turnoverStats[m.product_id].outCount += qty;
      }
    });

    // 2. Map all products with their total stock and financial metrics
    const productList = products.map((p) => {
      const whMap = stockQuantities[p.product_id] || {};
      let totalStock = 0;
      Object.values(whMap).forEach((val) => {
        totalStock += Number(val) || 0;
      });

      const stats = turnoverStats[p.product_id] || { totalMoved: 0, inCount: 0, outCount: 0 };
      const totalValue = totalStock * (p.purchase_price || 0);
      const deficit = p.min_stock - totalStock; // positive if deficit

      const shortName = p.name.length > 16 ? p.name.slice(0, 14) + '...' : p.name;

      return {
        id: p.product_id,
        fullName: p.name,
        shortName,
        sku: p.sku,
        unit: p.unit || 'عدد',
        stock: totalStock,
        turnover: stats.totalMoved,
        totalValue,
        purchasePrice: p.purchase_price,
        minStock: p.min_stock,
        deficit: Math.max(0, deficit),
        isLow: totalStock <= p.min_stock,
        // The display value used as Bar height depending on active mode:
        metricValue:
          analysisMode === 'TURNOVER'
            ? stats.totalMoved
            : analysisMode === 'VALUE'
            ? Math.round(totalValue / 1000000) // In Million Tomans for readable bar scale
            : Math.max(0, deficit)
      };
    });

    // 3. Sort based on active analysis mode
    const sorted = [...productList].sort((a, b) => {
      if (analysisMode === 'TURNOVER') {
        if (b.turnover !== a.turnover) return b.turnover - a.turnover;
        return b.stock - a.stock;
      } else if (analysisMode === 'VALUE') {
        if (b.totalValue !== a.totalValue) return b.totalValue - a.totalValue;
        return b.stock - a.stock;
      } else {
        // DEFICIT
        if (b.deficit !== a.deficit) return b.deficit - a.deficit;
        return a.stock - b.stock;
      }
    });

    return sorted.slice(0, topCount);
  }, [products, stockMovements, stockQuantities, analysisMode, topCount]);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(typeof window !== 'undefined' ? window.innerWidth < 640 : false);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const colors = [
    '#6366f1', // Indigo
    '#0ea5e9', // Sky
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ec4899', // Pink
    '#8b5cf6', // Violet
    '#14b8a6', // Teal
    '#f97316', // Orange
    '#06b6d4', // Cyan
    '#84cc16'  // Lime
  ];

  return (
    <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm dark:shadow-xl space-y-4 transition-colors">
      {/* Header with Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-700/50 flex items-center justify-center text-indigo-700 dark:text-indigo-400">
            {analysisMode === 'TURNOVER' ? (
              <TrendingUp className="w-4 h-4" />
            ) : analysisMode === 'VALUE' ? (
              <Coins className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            )}
          </div>
          <div>
            <h3
              className="text-sm font-bold text-black dark:text-white flex items-center gap-2 cursor-help"
              title="تحلیل هوشمند اقلام با بیش از ۵۰۰ تنوع کالا"
            >
              <span>
                {analysisMode === 'TURNOVER'
                  ? `بیشترین تیراژ گردش اسناد (${toPersianDigits(topCount)} کالای پرگردش)`
                  : analysisMode === 'VALUE'
                  ? `بیشترین ارزش سرمایه خوابیده (${toPersianDigits(topCount)} کالای گران‌قیمت)`
                  : `بیشترین کسری تا حداقل سفارش (${toPersianDigits(topCount)} کالای بحرانی)`}
              </span>
              <Info className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {analysisMode === 'TURNOVER'
                ? 'محاسبه مجموع ورودی‌ها و خروجی‌های انبار'
                : analysisMode === 'VALUE'
                ? 'محاسبه بر حسب میلیون تومان (موجودی × بهای خرید)'
                : 'محاسبه تعداد واحد کسری کالا نسبت به حداقل نقطه سفارش'}
            </p>
          </div>
        </div>

        {/* Action Controls: Mode Switch & Count Switch */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Analysis mode pills */}
          <div className="bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setAnalysisMode('TURNOVER')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                analysisMode === 'TURNOVER'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
              title="کالاهای دارای بیشترین خروج و ورود فیزیکی"
            >
              <TrendingUp className="w-3 h-3" />
              <span>گردش فیزیکی</span>
            </button>
            <button
              type="button"
              onClick={() => setAnalysisMode('VALUE')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                analysisMode === 'VALUE'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
              title="کالاهایی که بیشترین حجم پول را در انبار به خود اختصاص داده‌اند"
            >
              <Coins className="w-3 h-3" />
              <span>ارزش ریالی</span>
            </button>
            <button
              type="button"
              onClick={() => setAnalysisMode('DEFICIT')}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1 ${
                analysisMode === 'DEFICIT'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
              title="کالاهایی که بیشترین فاصله منفی را تا حداقل سفارش دارند"
            >
              <AlertTriangle className="w-3 h-3" />
              <span>بحران کسری</span>
            </button>
          </div>

          {/* 5 or 10 toggle */}
          <div className="bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setTopCount(5)}
              className={`px-2 py-1 rounded-lg font-bold font-mono transition-all cursor-pointer ${
                topCount === 5 ? 'bg-indigo-600 dark:bg-slate-800 text-white dark:text-cyan-300' : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              ۵
            </button>
            <button
              type="button"
              onClick={() => setTopCount(10)}
              className={`px-2 py-1 rounded-lg font-bold font-mono transition-all cursor-pointer ${
                topCount === 10 ? 'bg-indigo-600 dark:bg-slate-800 text-white dark:text-cyan-300' : 'text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white'
              }`}
            >
              ۱۰
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Bar Chart */}
      <div className="w-full h-72 sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 12, right: 10, left: -10, bottom: isMobile ? 65 : 24 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} vertical={false} />
            <XAxis
              dataKey="shortName"
              stroke="#94a3b8"
              fontSize={isMobile ? 10 : 11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              interval={0}
              height={isMobile ? 70 : 28}
              tick={({ x, y, payload }) => {
                const textVal = payload?.value || '';
                const displayVal = isMobile && textVal.length > 12 ? textVal.slice(0, 11) + '…' : textVal;
                return (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      x={0}
                      y={0}
                      dx={isMobile ? -8 : 0}
                      dy={isMobile ? 6 : 14}
                      textAnchor={isMobile ? 'end' : 'middle'}
                      transform={isMobile ? 'rotate(-65)' : undefined}
                      fill="#94a3b8"
                      fontSize={isMobile ? 10 : 11}
                      className="font-medium select-none"
                    >
                      {displayVal}
                    </text>
                  </g>
                );
              }}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              tickFormatter={(v) => toPersianDigits(v)}
            />
            <Tooltip
              cursor={{ fill: 'rgba(51, 65, 85, 0.25)' }}
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const item = payload[0].payload;
                return (
                  <div className="bg-slate-950/95 border border-slate-700/80 p-3 rounded-xl shadow-2xl text-right dir-rtl min-w-[220px]">
                    <div className="text-xs font-bold text-white mb-1.5 flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span>{item.fullName}</span>
                      <span className="text-[10px] font-mono text-indigo-300">{item.sku}</span>
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between text-slate-300">
                        <span>موجودی فعلی:</span>
                        <span className="font-bold text-emerald-400 font-mono">
                          {formatNumberFa(item.stock)} {item.unit}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>حجم کل گردش:</span>
                        <span className="font-mono text-cyan-300 font-bold">
                          {formatNumberFa(item.turnover)} {item.unit}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>ارزش ریالی موجودی:</span>
                        <span className="font-mono text-emerald-300 font-bold">
                          {formatCurrencyToman(item.totalValue)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span>حداقل نقطه سفارش:</span>
                        <span className="font-mono text-slate-300">
                          {toPersianDigits(item.minStock)} {item.unit}
                        </span>
                      </div>
                      {item.deficit > 0 && (
                        <div className="pt-1 text-[11px] text-rose-400 flex items-center justify-between border-t border-slate-800/80 font-bold">
                          <span>کسری تا نقطه سفارش:</span>
                          <span className="font-mono">{toPersianDigits(item.deficit)} {item.unit}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }}
            />
            <Bar
              dataKey="metricValue"
              radius={[6, 6, 0, 0]}
              onClick={(entry) => onProductClick?.(entry.id)}
              className="cursor-pointer"
            >
              {chartData.map((entry, index) => {
                const color =
                  analysisMode === 'DEFICIT'
                    ? '#f43f5e' // Rose for deficit
                    : analysisMode === 'VALUE'
                    ? colors[index % colors.length]
                    : colors[index % colors.length];

                return (
                  <Cell
                    key={`cell-${entry.id}`}
                    fill={color}
                    className="hover:opacity-85 transition-opacity"
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
