import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatsCard = ({ label, value, icon: Icon, trend, trendValue, bgColor = 'bg-slate-100', iconColor = 'text-slate-900' }) => {
  const isPositive = trend === 'up' || trend === 'positive';
  const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;
  const trendColor = isPositive ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-3 ${bgColor} rounded-xl`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        {trendValue && (
          <span className={`flex items-center text-xs font-medium ${trendColor} px-2 py-1 rounded-full`}>
            {trendValue}
            <TrendIcon className="w-3 h-3 ml-0.5" />
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-slate-900">{value}</div>
      <div className="text-sm text-slate-500 mt-1">{label}</div>
      
      {/* Subtle gradient line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-slate-200 to-transparent"></div>
    </div>
  );
};

export default StatsCard;