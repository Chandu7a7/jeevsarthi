import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { labAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { 
  FiUpload, FiFileText, FiCheckCircle, FiXCircle,
  FiActivity, FiAlertCircle, FiCopy, FiDownload
} from 'react-icons/fi';

const LabDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalTests: 0,
    pendingTests: 0,
    passedTests: 0,
    failedTests: 0,
  });
  const [tests, setTests] = useState([]);
  const [showTestForm, setShowTestForm] = useState(false);
  const [formData, setFormData] = useState({
    sampleId: '',
    animalId: '',
    farmerId: '',
    medicineTested: '',
    mrlValue: '',
    allowedLimit: '',
    notes: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const dashboardResponse = await labAPI.getDashboard();
      setStats(dashboardResponse.data.data.stats);

      const testsResponse = await labAPI.getLabTests({});
      setTests(testsResponse.data.data.slice(0, 10));
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTest = async (e) => {
    e.preventDefault();
    try {
      const testResult = {
        ...formData,
        labOfficerId: user.id,
      };
      await labAPI.uploadTestResult(testResult);
      toast.success('Test result uploaded successfully!');
      setShowTestForm(false);
      setFormData({
        sampleId: '',
        animalId: '',
        farmerId: '',
        medicineTested: '',
        mrlValue: '',
        allowedLimit: '',
        notes: '',
      });
      loadDashboardData();
    } catch (error) {
      toast.error('Failed to upload test result');
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'pass') {
      return (
        <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium flex items-center space-x-1">
          <FiCheckCircle className="w-4 h-4" />
          <span>PASS</span>
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm font-medium flex items-center space-x-1">
          <FiXCircle className="w-4 h-4" />
          <span>FAIL</span>
        </span>
      );
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Greeting Header */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome, Lab Officer 🧪
        </h1>
        <p className="text-gray-600 mt-2">
          Submit and verify antimicrobial residue tests.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<FiActivity className="w-8 h-8 text-primary-blue" />}
          title="Total Tests Done"
          value={stats.totalTests}
        />
        <StatCard
          icon={<FiFileText className="w-8 h-8 text-yellow-500" />}
          title="Pending Samples"
          value={stats.pendingTests}
        />
        <StatCard
          icon={<FiCheckCircle className="w-8 h-8 text-green-500" />}
          title="MRL Passed"
          value={stats.passedTests}
        />
        <StatCard
          icon={<FiXCircle className="w-8 h-8 text-red-500" />}
          title="MRL Failed"
          value={stats.failedTests}
        />
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setShowTestForm(true)}
          className="bg-primary-green text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
        >
          <FiUpload /> <span>Upload New Test</span>
        </button>
        <button className="bg-primary-blue text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
          View Pending Samples
        </button>
        <button className="bg-primary-blue text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
          Generate Report
        </button>
      </div>

      {/* Main Content - Upload Form & AI Prediction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Test Result Form */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Upload Test Result</h2>
          {showTestForm ? (
            <form onSubmit={handleSubmitTest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Animal ID
                </label>
                <input
                  type="text"
                  value={formData.animalId}
                  onChange={(e) => setFormData({ ...formData, animalId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Select Animal ID"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sample ID
                </label>
                <input
                  type="text"
                  value={formData.sampleId}
                  onChange={(e) => setFormData({ ...formData, sampleId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Enter Sample ID"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Medicine Tested
                </label>
                <input
                  type="text"
                  value={formData.medicineTested}
                  onChange={(e) => setFormData({ ...formData, medicineTested: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Select Medicine"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  MRL Value (mg/kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.mrlValue}
                  onChange={(e) => setFormData({ ...formData, mrlValue: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Enter MRL value"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allowed Limit (mg/kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.allowedLimit}
                  onChange={(e) => setFormData({ ...formData, allowedLimit: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Enter allowed limit"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows="3"
                  placeholder="Enter notes..."
                />
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="btn-primary flex-1">
                  Submit Test Result
                </button>
                <button
                  type="button"
                  onClick={() => setShowTestForm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowTestForm(true)}
              className="w-full btn-primary py-3"
            >
              Upload New Test Result
            </button>
          )}
        </div>

        {/* AI Prediction Panel */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            AI-Based MRL Prediction (Beta) ⚙️
          </h2>
          <div className="space-y-4">
            <div className="alert-violation">
              <div className="flex items-start space-x-2">
                <FiAlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                <div>
                  <p className="font-semibold">High risk of MRL violation detected</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Suggested Action: Re-test sample for confirmation.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Prediction Accuracy: 87%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MRL Test History Table */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">MRL Test History</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Sample ID</th>
                <th className="text-left py-2">Animal ID</th>
                <th className="text-left py-2">Medicine Tested</th>
                <th className="text-left py-2">MRL Value</th>
                <th className="text-left py-2">Allowed Limit</th>
                <th className="text-left py-2">Result</th>
                <th className="text-left py-2">Blockchain Hash</th>
                <th className="text-left py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {tests.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-500">
                    No test results
                  </td>
                </tr>
              ) : (
                tests.map((test) => (
                  <tr key={test._id} className="border-b">
                    <td className="py-2">{test.sampleId}</td>
                    <td className="py-2">{test.animalId?.pashuAadhaarId || '-'}</td>
                    <td className="py-2">{test.medicineTested}</td>
                    <td className="py-2">{test.mrlValue} {test.mrlUnit}</td>
                    <td className="py-2">{test.allowedLimit} {test.mrlUnit}</td>
                    <td className="py-2">{getStatusBadge(test.status)}</td>
                    <td className="py-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono text-gray-600">
                          {test.blockchainHash?.substring(0, 10)}...
                        </span>
                        <button className="text-primary-blue hover:underline">
                          <FiCopy className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                    <td className="py-2">
                      <button className="text-primary-blue hover:underline">
                        <FiDownload className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value }) => {
  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-800 mt-2">{value}</p>
        </div>
        {icon}
      </div>
    </div>
  );
};

export default LabDashboard;

