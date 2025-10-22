import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface Stat {
  name: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease';
  icon: LucideIcon;
  color: string;
}

interface StatCardProps {
  stat: Stat;
}

export function StatCard({ stat }: StatCardProps) {
  const Icon = stat.icon;
  const isIncrease = stat.changeType === 'increase';

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{stat.name}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
        </div>
        <div className={`p-3 rounded-lg ${stat.color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      <div className="flex items-center mt-4">
        {isIncrease ? (
          <ArrowUpRight className="h-4 w-4 text-green-500" />
        ) : (
          <ArrowDownRight className="h-4 w-4 text-red-500" />
        )}
        <span className={`text-sm font-medium ml-1 ${
          isIncrease ? 'text-green-600' : 'text-red-600'
        }`}>
          {stat.change}
        </span>
        <span className="text-sm text-gray-500 ml-1">del mes pasado</span>
      </div>
    </div>
  );
}
