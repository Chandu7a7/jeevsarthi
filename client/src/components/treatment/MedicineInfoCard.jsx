import { Card } from '../ui/card';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

const MedicineInfoCard = ({ drug }) => {
  if (!drug) return null;

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'Low':
        return 'text-green-600 bg-green-50';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'High':
        return 'text-orange-600 bg-orange-50';
      case 'Critical':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getToxicityColor = (toxicity) => {
    switch (toxicity) {
      case 'safe':
        return 'text-green-600';
      case 'caution':
        return 'text-yellow-600';
      case 'unsafe':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <Info className="w-5 h-5 text-blue-600" />
        Medicine Information
      </h3>
      
      <div className="space-y-3">
        {/* Drug Name & Category */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-800">{drug.drugName}</p>
            <p className="text-sm text-gray-600 capitalize">{drug.category}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskColor(drug.riskLevel)}`}>
            {drug.riskLevel} Risk
          </span>
        </div>

        {/* MRL Limit */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">MRL Limit</p>
          <p className="text-lg font-semibold text-gray-800">
            {drug.mrlLimit} {drug.mrlLimitUnit}
          </p>
        </div>

        {/* Withdrawal Period */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Milk Withdrawal</p>
            <p className="text-lg font-semibold text-gray-800">
              {drug.withdrawalPeriodMilk} days
            </p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Meat Withdrawal</p>
            <p className="text-lg font-semibold text-gray-800">
              {drug.withdrawalPeriodMeat} days
            </p>
          </div>
        </div>

        {/* Safe Dosage */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Safe Dosage</p>
          <p className="text-lg font-semibold text-gray-800">
            {drug.safeDosageMgKg} {drug.dosageUnit}
          </p>
        </div>

        {/* Toxicity by Age */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Age Toxicity</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Calves:</span>
              <span className={`text-sm font-semibold ${getToxicityColor(drug.toxicityByAge?.calves)}`}>
                {drug.toxicityByAge?.calves?.toUpperCase() || 'SAFE'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Adults:</span>
              <span className={`text-sm font-semibold ${getToxicityColor(drug.toxicityByAge?.adults)}`}>
                {drug.toxicityByAge?.adults?.toUpperCase() || 'SAFE'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Pregnant:</span>
              <span className={`text-sm font-semibold ${getToxicityColor(drug.toxicityByAge?.pregnant)}`}>
                {drug.toxicityByAge?.pregnant?.toUpperCase() || 'SAFE'}
              </span>
            </div>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex gap-2 flex-wrap">
          {drug.banned && (
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              BANNED
            </span>
          )}
          {!drug.allowed && (
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
              RESTRICTED
            </span>
          )}
          {drug.allowed && !drug.banned && (
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              ALLOWED
            </span>
          )}
        </div>

        {/* Description */}
        {drug.description && (
          <div className="bg-white p-3 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600 mb-1">Description</p>
            <p className="text-sm text-gray-700">{drug.description}</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default MedicineInfoCard;

