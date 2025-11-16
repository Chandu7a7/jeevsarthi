import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

const typeConfig = {
  violation: {
    icon: AlertTriangle,
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    iconColor: 'text-red-600',
    titleColor: 'text-red-900',
  },
  warning: {
    icon: AlertCircle,
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    iconColor: 'text-yellow-600',
    titleColor: 'text-yellow-900',
  },
  safe: {
    icon: CheckCircle,
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    iconColor: 'text-green-600',
    titleColor: 'text-green-900',
  },
};

export function AlertCard({ type = 'warning', title, message, time }) {
  const config = typeConfig[type] || typeConfig.warning;
  const Icon = config.icon;

  return (
    <div className={`${config.bgColor} ${config.borderColor} border rounded-[12px] p-4 flex items-start gap-3`}>
      <div className={`${config.iconColor} flex-shrink-0 mt-0.5`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <h5 className={`${config.titleColor} font-medium mb-1`}>{title}</h5>
        <p className="text-sm text-gray-700 mb-2">{message}</p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
  );
}

export default AlertCard;

