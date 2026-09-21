
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBg
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200 border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center`}>
            <Icon size={20} className={iconColor} />
          </div>
        </div>
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {value}
        </div>
        <p className="text-sm text-gray-600">{title}</p>
      </CardContent>
    </Card>
  );
};
