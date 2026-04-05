import { Card } from '../ui/card';
import { TrendingUp, TrendingDown, Minus, BarChart3 } from 'lucide-react';
import type { GigWorkerData } from '../../types/financial';

interface Props {
  data: GigWorkerData;
  computed: {
    cv: number;
    trend: string;
    weeklyAmounts: number[];
    avgWeekly: number;
    bestWeek: number;
    typicalMonthly: number;
    worstMonthly: number;
    bestMonthly: number;
  };
}

export function IncomeStabilityCard({ data, computed }: Props) {
  const { income } = data;
  const volatilityPct = Math.round(computed.cv * 100);

  const stability =
    volatilityPct < 25 ? { label: 'Pretty steady', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', bar: 'bg-green-500' }
    : volatilityPct < 50 ? { label: 'Changes a fair amount', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', bar: 'bg-amber-500' }
    : { label: 'Changes a lot', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', bar: 'bg-red-500' };

  const barWidth = Math.min(volatilityPct, 100);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-5">
        <BarChart3 className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-semibold text-gray-900">How steady is your income?</h2>
      </div>

      {/* Volatility meter */}
      <div className={`p-3 rounded-xl border ${stability.bg} ${stability.border} mb-5`}>
        <div className="flex justify-between items-center mb-2">
          <span className={`text-sm font-semibold ${stability.color}`}>{stability.label}</span>
          <span className={`text-lg font-bold ${stability.color}`}>{volatilityPct}%</span>
        </div>
        <div className="h-2 bg-white/60 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${stability.bar}`}
            style={{ width: `${barWidth}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1.5">How much it changes as % of average</p>
      </div>

      {/* Income range */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-red-50 rounded-xl text-center">
          <TrendingDown className="w-4 h-4 text-red-500 mx-auto mb-1" />
          <p className="text-xs text-gray-500 mb-0.5">Your slowest month</p>
          <p className="text-base font-bold text-red-600">${computed.worstMonthly.toLocaleString()}</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-xl text-center">
          <Minus className="w-4 h-4 text-blue-500 mx-auto mb-1" />
          <p className="text-xs text-gray-500 mb-0.5">Average</p>
          <p className="text-base font-bold text-blue-600">${computed.typicalMonthly.toLocaleString()}</p>
        </div>
        <div className="p-3 bg-green-50 rounded-xl text-center">
          <TrendingUp className="w-4 h-4 text-green-500 mx-auto mb-1" />
          <p className="text-xs text-gray-500 mb-0.5">Your best month</p>
          <p className="text-base font-bold text-green-600">${computed.bestMonthly.toLocaleString()}</p>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-4 text-center">
        All financial planning is based on your <strong className="text-gray-600">slowest month</strong>
      </p>
    </Card>
  );
}
