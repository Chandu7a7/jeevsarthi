import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { farmerAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const MRLUsageOverview = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    loadMRLData();
  }, []);

  const loadMRLData = async () => {
    try {
      setLoading(true);
      const response = await farmerAPI.getMRLOverview();
      console.log('MRL Overview Response:', response.data);
      
      if (response.data && response.data.success) {
        setData(response.data.data);
      } else {
        toast.error(response.data?.message || 'Failed to load MRL overview data');
        console.error('Invalid response format:', response.data);
      }
    } catch (error) {
      console.error('Error loading MRL overview:', error);
      const errorMessage = 
        error.response?.data?.message || 
        error.message || 
        'Failed to load MRL overview data. Please try again.';
      toast.error(errorMessage);
      
      // Set default empty data structure to prevent crashes
      setData({
        stats: {
          totalTests: 0,
          passPercentage: 0,
          failPercentage: 0,
          avgWithdrawalDays: 0,
        },
        tests: [],
        treatments: [],
        drugDistribution: {},
        trendData: [],
        aiPrediction: {
          riskScore: 0,
          riskLevel: 'Low',
          recommendation: 'No data available. Start by adding treatments and lab tests.',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-green" />
      </div>
    );
  }

  // Handle case when data is not loaded yet or is empty
  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No data available</p>
          <Button onClick={() => navigate('/dashboard/farmer')}>Go Back</Button>
        </div>
      </div>
    );
  }

  // Destructure with defaults to prevent errors
  const {
    stats = {
      totalTests: 0,
      passPercentage: 0,
      failPercentage: 0,
      avgWithdrawalDays: 0,
    },
    tests = [],
    treatments = [],
    drugDistribution = {},
    trendData = [],
    aiPrediction = {
      riskScore: 0,
      riskLevel: 'Low',
      recommendation: 'No data available.',
    },
  } = data;

  // Prepare pie chart data
  const pieData = Object.entries(drugDistribution).map(([drug, info]) => ({
    name: drug,
    value: info.total,
    passed: info.passed,
    failed: info.failed,
  }));

  const COLORS = ['#2E7D32', '#1976D2', '#FF9800', '#9C27B0', '#F44336', '#00BCD4'];

  const getStatusIcon = (status) => {
    return status === 'pass' ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : (
      <AlertCircle className="w-5 h-5 text-red-600" />
    );
  };

  const getStatusBadge = (status) => {
    return status === 'pass' ? (
      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
        ✅ Pass
      </span>
    ) : (
      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
        ❌ Fail
      </span>
    );
  };

  const getSafeBadge = (status) => {
    return status === 'pass' ? (
      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
        🟢 Safe
      </span>
    ) : (
      <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
        🚫 Unsafe
      </span>
    );
  };

  const getWithdrawalStatus = (withdrawalEndDate) => {
    const daysRemaining = Math.ceil(
      (new Date(withdrawalEndDate) - new Date()) / (1000 * 60 * 60 * 24)
    );
    if (daysRemaining <= 0) {
      return { status: 'completed', text: 'Completed', color: 'text-green-600' };
    } else if (daysRemaining <= 2) {
      return { status: 'warning', text: `Warning (${daysRemaining} days left)`, color: 'text-red-600' };
    } else if (daysRemaining <= 5) {
      return { status: 'caution', text: `Caution (${daysRemaining} days left)`, color: 'text-yellow-600' };
    } else {
      return { status: 'safe', text: `Safe (${daysRemaining} days left)`, color: 'text-green-600' };
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'High':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'Medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'Low':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">MRL Usage Overview</h1>
            <p className="text-gray-600 mt-2">Monitor your Maximum Residue Limits and compliance</p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard/farmer')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Tests Done</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalTests}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">MRL Passed (%)</p>
                <p className="text-3xl font-bold text-green-600">{stats.passPercentage}%</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">MRL Failed (%)</p>
                <p className="text-3xl font-bold text-red-600">{stats.failPercentage}%</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Withdrawal Days Remaining</p>
                <p className="text-3xl font-bold text-orange-600">{stats.avgWithdrawalDays}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Animal-wise MRL Status Table */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Animal-wise MRL Status
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Animal ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Last Medicine</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">MRL Limit</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actual MRL</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Safe/Unsafe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tests.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                      No test records found
                    </td>
                  </tr>
                ) : (
                  tests.map((test) => (
                    <tr key={test._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-800 font-medium">
                        {test.animalId?.pashuAadhaarId || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{test.medicineTested}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {test.allowedLimit} {test.mrlUnit}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {test.mrlValue} {test.mrlUnit}
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(test.status)}</td>
                      <td className="px-4 py-3">{getSafeBadge(test.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* MRL Trend Chart */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              MRL Trend Chart (Last 6 Tests)
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="mrlValue"
                  stroke="#2E7D32"
                  strokeWidth={2}
                  dot={{ fill: '#2E7D32', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span>Pass</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span>Fail</span>
              </div>
            </div>
          </Card>

          {/* Drug-wise MRL Distribution */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Drug-wise MRL Distribution
            </h2>
            {pieData.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-gray-500">
                No drug data available
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {pieData.map((drug, index) => (
                    <div
                      key={drug.name}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="font-medium">{drug.name}</span>
                      </div>
                      <div className="flex gap-4">
                        <span className="text-green-600">Pass: {drug.passed}</span>
                        <span className="text-red-600">Fail: {drug.failed}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        </div>

        {/* Withdrawal Period Timeline */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Withdrawal Period Timeline
          </h2>
          {treatments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No active withdrawal periods
            </div>
          ) : (
            <div className="space-y-6">
              {treatments.map((treatment) => {
                const withdrawalStatus = getWithdrawalStatus(treatment.withdrawalEndDate);
                const daysRemaining = Math.ceil(
                  (new Date(treatment.withdrawalEndDate) - new Date()) / (1000 * 60 * 60 * 24)
                );
                return (
                  <div key={treatment._id} className="border-l-4 border-primary-green pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {treatment.animalId?.pashuAadhaarId || 'Unknown Animal'}
                        </p>
                        <p className="text-sm text-gray-600">{treatment.medicine}</p>
                      </div>
                      <span className={`text-sm font-semibold ${withdrawalStatus.color}`}>
                        {withdrawalStatus.text}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>
                        Start: {new Date(treatment.dateGiven).toLocaleDateString('en-IN')}
                      </span>
                      <span>→</span>
                      <span>
                        Withdrawal Ends: {new Date(treatment.withdrawalEndDate).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    {daysRemaining > 0 && (
                      <div className="mt-2 text-xs text-gray-500">
                        {daysRemaining} days remaining
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* AI Prediction Card */}
        <Card className={`p-6 border-2 ${getRiskColor(aiPrediction.riskLevel)}`}>
          <h2 className="text-xl font-semibold mb-4">AI Predicted MRL Risk</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Risk Score</span>
                <span className="text-2xl font-bold">{aiPrediction.riskScore}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${
                    aiPrediction.riskLevel === 'High'
                      ? 'bg-red-600'
                      : aiPrediction.riskLevel === 'Medium'
                      ? 'bg-yellow-600'
                      : 'bg-green-600'
                  }`}
                  style={{ width: `${aiPrediction.riskScore}%` }}
                ></div>
              </div>
              <p className="text-sm mt-2">
                Risk Level: <span className="font-semibold">{aiPrediction.riskLevel}</span>
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-sm font-semibold mb-2">Recommendation:</p>
              <p className="text-sm">{aiPrediction.recommendation}</p>
            </div>
          </div>
        </Card>

        {/* Blockchain History (Optional) */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Blockchain Verification History
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    MRL Test
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Blockchain Verified
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">View Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tests.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                      No test records found
                    </td>
                  </tr>
                ) : (
                  tests.slice(0, 10).map((test) => (
                    <tr key={test._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-800">
                        {test.medicineTested} - {test.animalId?.pashuAadhaarId || 'N/A'}
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(test.status)}</td>
                      <td className="px-4 py-3">
                        {test.blockchainHash ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                            ✓ Verified
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {test.blockchainHash ? (
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(test.blockchainHash);
                              toast.success('Hash copied to clipboard');
                            }}
                            className="text-primary-green hover:underline text-sm"
                          >
                            View Hash
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MRLUsageOverview;

