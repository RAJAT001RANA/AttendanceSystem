import React from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { AttendanceStatus } from '@/types';
import { cn } from '@/lib/utils';

interface AttendanceStatusBadgeProps {
  status: AttendanceStatus;
  className?: string;
}

const statusConfig: Record<AttendanceStatus, { icon: React.ElementType; colorClass: string; text: string }> = {
  present: { icon: CheckCircle, colorClass: 'bg-green-500 hover:bg-green-500/90 text-white', text: 'Present' },
  absent: { icon: XCircle, colorClass: 'bg-red-500 hover:bg-red-500/90 text-white', text: 'Absent' },
  late: { icon: Clock, colorClass: 'bg-yellow-500 hover:bg-yellow-500/90 text-black', text: 'Late' },
};

export function AttendanceStatusBadge({ status, className }: AttendanceStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge
      variant="default"
      className={cn(
        "flex items-center gap-1.5 whitespace-nowrap border-transparent",
        config.colorClass,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{config.text}</span>
    </Badge>
  );
}
