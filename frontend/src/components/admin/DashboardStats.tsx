'use client';

import { 
  ArrowUpIcon, 
  ArrowDownIcon 
} from '@heroicons/react/24/solid';

interface Stat {
  name: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  change: string;
  changeType: 'positive' | 'negative';
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red';
}

interface DashboardStatsProps {
  stats: Stat[];
}

const colorClasses = {
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-500',
  purple: 'bg-purple-500',
  red: 'bg-red-500',
};

const iconColorClasses = {
  blue: 'text-blue-600',
  green: 'text-green-600',
  yellow: 'text-yellow-600',
  purple: 'text-purple-600',
  red: 'text-red-600',
};

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="relative overflow-hidden rounded-lg bg-white px-4 pb-12 pt-5 shadow sm:px-6 sm:pt-6"
        >
          <dt>
            <div className={`absolute rounded-md p-3 ${colorClasses[stat.color]}`}>
              <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <p className="ml-16 truncate text-sm font-medium text-gray-500">
              {stat.name}
            </p>
          </dt>
          <dd className="ml-16 flex items-baseline pb-6 sm:pb-7">
            <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            <p
              className={`ml-2 flex items-baseline text-sm font-semibold ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {stat.changeType === 'positive' ? (
                <ArrowUpIcon className="h-4 w-4 flex-shrink-0 self-center" aria-hidden="true" />
              ) : (
                <ArrowDownIcon className="h-4 w-4 flex-shrink-0 self-center" aria-hidden="true" />
              )}
              <span className="sr-only">
                {stat.changeType === 'positive' ? 'Increased' : 'Decreased'} by
              </span>
              {stat.change}
            </p>
            <div className="absolute inset-x-0 bottom-0 bg-gray-50 px-4 py-4 sm:px-6">
              <div className="text-sm">
                <a href="#" className={`font-medium ${iconColorClasses[stat.color]} hover:${iconColorClasses[stat.color].replace('text-', 'text-')}`}>
                  View details
                  <span className="sr-only"> {stat.name} stats</span>
                </a>
              </div>
            </div>
          </dd>
        </div>
      ))}
    </div>
  );
}
