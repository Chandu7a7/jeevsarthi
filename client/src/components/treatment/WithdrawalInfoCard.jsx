import { Card } from '../ui/card';
import { Calendar, Clock, AlertCircle } from 'lucide-react';

const WithdrawalInfoCard = ({ withdrawalEndDate, withdrawalPeriod, medicine }) => {
  if (!withdrawalEndDate) return null;

  const isWithdrawalActive = new Date(withdrawalEndDate) > new Date();
  const daysRemaining = Math.ceil(
    (new Date(withdrawalEndDate) - new Date()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <Clock className="w-5 h-5 text-purple-600" />
        Withdrawal Period Information
      </h3>

      <div className="space-y-3">
        {/* Withdrawal Period */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Withdrawal Period</p>
          <p className="text-lg font-semibold text-gray-800">
            {withdrawalPeriod} days
          </p>
        </div>

        {/* End Date */}
        <div className="bg-white p-3 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Withdrawal Ends On
          </p>
          <p className="text-lg font-semibold text-gray-800">
            {new Date(withdrawalEndDate).toLocaleDateString('en-IN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>

        {/* Status */}
        {isWithdrawalActive && (
          <div className="bg-yellow-50 p-3 rounded-lg border-2 border-yellow-300">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-800 mb-1">
                  Withdrawal Period Active
                </p>
                <p className="text-sm text-yellow-700">
                  {daysRemaining > 0
                    ? `${daysRemaining} days remaining. Do not sell milk or meat until withdrawal period ends.`
                    : 'Withdrawal period ends today. Wait until tomorrow before selling.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {!isWithdrawalActive && (
          <div className="bg-green-50 p-3 rounded-lg border-2 border-green-300">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-semibold text-green-800 mb-1">
                  Withdrawal Period Completed
                </p>
                <p className="text-sm text-green-700">
                  Safe to sell milk and meat.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default WithdrawalInfoCard;

