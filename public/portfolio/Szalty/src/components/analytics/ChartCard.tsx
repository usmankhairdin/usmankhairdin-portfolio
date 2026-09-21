
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ResponsiveContainer } from 'recharts';
import { LucideIcon } from 'lucide-react';

interface ChartCardProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

export const ChartCard: React.FC<ChartCardProps> = ({ title, icon: Icon, children }) => {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200 border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center text-lg font-semibold">
          <Icon size={20} className="mr-3 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-80">
          {children}
        </div>
      </CardContent>
    </Card>
  );
};
