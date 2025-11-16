import { Card } from '../ui/card';
import {
  Brain,
  AlertTriangle,
  CheckCircle,
  Pill,
  Clock,
  TrendingUp,
  Info,
} from 'lucide-react';

const AIRecommendationSidebar = ({
  recommendations,
  selectedDrug,
  selectedAnimal,
}) => {
  if (!recommendations && !selectedDrug) {
    return (
      <Card className="p-6 rounded-2xl border-2 border-gray-200 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Brain className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-600 font-medium">
            AI Recommendations will appear here
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Select an animal and medicine to get AI-powered insights
          </p>
        </div>
      </Card>
    );
  }

  const getRiskColor = (score) => {
    if (score >= 70) return 'text-red-600 bg-red-50 border-red-200';
    if (score >= 50) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (score >= 30) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getRiskLabel = (score) => {
    if (score >= 70) return 'High Risk';
    if (score >= 50) return 'Medium Risk';
    if (score >= 30) return 'Low Risk';
    return 'Very Low Risk';
  };

  return (
    <Card className="p-6 rounded-2xl border-2 border-[#1976D2] bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg sticky top-6">
      <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <Brain className="w-6 h-6 text-[#1976D2]" />
        AI Recommendations
      </h3>

      <div className="space-y-5">
        {/* Risk Score */}
        {recommendations?.riskScore !== undefined && (
          <div
            className={`p-4 rounded-xl border-2 ${getRiskColor(
              recommendations.riskScore
            )}`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">Risk Score</p>
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold">{recommendations.riskScore}</p>
              <p className="text-sm">/ 100</p>
            </div>
            <p className="text-xs mt-2 font-semibold">
              {getRiskLabel(recommendations.riskScore)}
            </p>
          </div>
        )}

        {/* Predicted Withdrawal */}
        {recommendations?.predictedWithdrawal && (
          <div className="bg-white p-4 rounded-xl border-2 border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-[#1976D2]" />
              <p className="text-sm font-semibold text-gray-800">
                Predicted Withdrawal
              </p>
            </div>
            <p className="text-2xl font-bold text-[#1976D2]">
              {recommendations.predictedWithdrawal} days
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Based on AI analysis of drug and animal profile
            </p>
          </div>
        )}

        {/* Alternative Medicines */}
        {recommendations?.alternativeMedicines &&
          recommendations.alternativeMedicines.length > 0 && (
            <div className="bg-white p-4 rounded-xl border-2 border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Pill className="w-5 h-5 text-[#2E7D32]" />
                <p className="text-sm font-semibold text-gray-800">
                  Alternative Medicines
                </p>
              </div>
              <div className="space-y-2">
                {recommendations.alternativeMedicines.map((alt, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <p className="font-medium text-gray-800 text-sm">
                      {alt.name}
                    </p>
                    <span
                      className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-semibold ${
                        alt.riskLevel === 'Low'
                          ? 'bg-green-100 text-green-700'
                          : alt.riskLevel === 'Medium'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {alt.riskLevel} Risk
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Overdose Alerts */}
        {recommendations?.overdoseAlert && (
          <div
            className={`p-4 rounded-xl border-2 ${
              recommendations.overdoseAlert.warning
                ? 'bg-yellow-50 border-yellow-300 text-yellow-800'
                : 'bg-red-50 border-red-300 text-red-800'
            }`}
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold mb-1">Overdose Alert</p>
                <p className="text-sm">{recommendations.overdoseAlert.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Drug Safety Info */}
        {selectedDrug && (
          <div className="bg-white p-4 rounded-xl border-2 border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-[#1976D2]" />
              <p className="text-sm font-semibold text-gray-800">
                Drug Safety Info
              </p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">MRL Limit:</span>
                <span className="font-semibold text-gray-800">
                  {selectedDrug.mrlLimit} {selectedDrug.mrlLimitUnit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Safe Dosage:</span>
                <span className="font-semibold text-gray-800">
                  {selectedDrug.safeDosageMgKg} {selectedDrug.dosageUnit}
                </span>
              </div>
              {selectedDrug.banned && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs font-semibold text-red-700 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    This drug is BANNED
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* No Alerts Message */}
        {recommendations &&
          !recommendations.overdoseAlert &&
          recommendations.riskScore < 50 && (
            <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-sm font-semibold text-green-800">
                  No critical alerts detected
                </p>
              </div>
            </div>
          )}
      </div>
    </Card>
  );
};

export default AIRecommendationSidebar;

