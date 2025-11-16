import { Card } from '../ui/card';
import { AlertTriangle, XCircle, AlertCircle } from 'lucide-react';

const DangerWarningCard = ({ warnings = [] }) => {
  if (!warnings || warnings.length === 0) return null;

  const getWarningIcon = (type) => {
    switch (type) {
      case 'banned':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'overdose':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'interaction':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getWarningColor = (type) => {
    switch (type) {
      case 'banned':
        return 'bg-red-50 border-red-200';
      case 'overdose':
        return 'bg-red-50 border-red-200';
      case 'interaction':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-yellow-50 border-yellow-200';
    }
  };

  return (
    <div className="space-y-2">
      {warnings.map((warning, index) => (
        <Card
          key={index}
          className={`p-4 border-2 ${getWarningColor(warning.type)}`}
        >
          <div className="flex items-start gap-3">
            {getWarningIcon(warning.type)}
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 mb-1">
                {warning.title}
              </h4>
              <p className="text-sm text-gray-700">{warning.message}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default DangerWarningCard;

