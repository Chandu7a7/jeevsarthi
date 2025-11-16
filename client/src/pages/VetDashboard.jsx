import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { treatmentAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { 
  FiPlus, FiFileText, FiActivity, FiCheckCircle, FiAlertCircle,
  FiTrendingUp, FiUsers, FiClock, FiMessageCircle
} from 'react-icons/fi';

const VetDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    animalsUnderCare: 0,
    activePrescriptions: 0,
    pendingWithdrawals: 0,
    complianceScore: 100,
  });
  const [treatments, setTreatments] = useState([]);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [formData, setFormData] = useState({
    farmerId: '',
    animalId: '',
    medicine: '',
    dosage: '',
    frequency: 'once',
    duration: '',
    notes: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await treatmentAPI.getTreatments({});
      setTreatments(response.data.data.filter(t => t.status === 'active'));
      // Calculate stats from treatments
      setStats({
        animalsUnderCare: new Set(response.data.data.map(t => t.animalId?._id)).size,
        activePrescriptions: response.data.data.filter(t => t.status === 'active').length,
        pendingWithdrawals: response.data.data.filter(t => {
          const withdrawalEnd = new Date(t.withdrawalEndDate);
          const today = new Date();
          const daysUntil = Math.ceil((withdrawalEnd - today) / (1000 * 60 * 60 * 24));
          return daysUntil <= 1 && daysUntil > 0;
        }).length,
        complianceScore: 95,
      });
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitPrescription = async (e) => {
    e.preventDefault();
    try {
      await treatmentAPI.addTreatment(formData);
      toast.success('Prescription added successfully!');
      setShowPrescriptionForm(false);
      setFormData({
        farmerId: '',
        animalId: '',
        medicine: '',
        dosage: '',
        frequency: 'once',
        duration: '',
        notes: '',
      });
      loadDashboardData();
    } catch (error) {
      toast.error('Failed to add prescription');
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
          Welcome, Dr. {user?.name || 'Veterinarian'} 👨‍⚕️
        </h1>
        <p className="text-gray-600 mt-2">
          Helping farmers ensure safe & responsible livestock medication.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<FiUsers className="w-8 h-8 text-primary-green" />}
          title="Animals Under Care"
          value={stats.animalsUnderCare}
        />
        <StatCard
          icon={<FiFileText className="w-8 h-8 text-primary-blue" />}
          title="Active Prescriptions"
          value={stats.activePrescriptions}
        />
        <StatCard
          icon={<FiClock className="w-8 h-8 text-yellow-500" />}
          title="Pending Withdrawals"
          value={stats.pendingWithdrawals}
        />
        <StatCard
          icon={<FiTrendingUp className="w-8 h-8 text-green-500" />}
          title="Compliance Score"
          value={`${stats.complianceScore}%`}
        />
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button
          onClick={() => setShowPrescriptionForm(true)}
          className="bg-primary-green text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
        >
          <FiPlus /> <span>Add Prescription</span>
        </button>
        <button className="bg-primary-blue text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
          Verify Requests
        </button>
        <button className="bg-primary-blue text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
          Treatment History
        </button>
        <button
          onClick={() => navigate('/dashboard/consultation/vet')}
          className="bg-primary-blue text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
        >
          <FiMessageCircle /> <span>Consultation Requests</span>
        </button>
      </div>

      {/* Main Content - Prescription Form & AI Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Prescription Form */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Add Prescription Form</h2>
          {showPrescriptionForm ? (
            <form onSubmit={handleSubmitPrescription} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Farmer
                </label>
                <input
                  type="text"
                  value={formData.farmerId}
                  onChange={(e) => setFormData({ ...formData, farmerId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Select Farmer"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Animal ID
                </label>
                <input
                  type="text"
                  value={formData.animalId}
                  onChange={(e) => setFormData({ ...formData, animalId: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Select Animal"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Drug Name
                </label>
                <input
                  type="text"
                  value={formData.medicine}
                  onChange={(e) => setFormData({ ...formData, medicine: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Search medicine..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dosage (mg/kg)
                </label>
                <input
                  type="number"
                  value={formData.dosage}
                  onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Enter dosage"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Frequency
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="once">Once</option>
                  <option value="twice">Twice</option>
                  <option value="thrice">Thrice</option>
                  <option value="daily">Daily</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duration (days)
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="Enter duration"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes/Diagnosis
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
                  Submit Prescription
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrescriptionForm(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowPrescriptionForm(true)}
              className="w-full btn-primary py-3"
            >
              Add New Prescription
            </button>
          )}
        </div>

        {/* AI Recommendation Panel */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">
            AI Recommendation (Beta) 🤖
          </h2>
          <div className="space-y-4">
            <div className="alert-warning">
              <div className="flex items-start space-x-2">
                <FiAlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-semibold">High-risk medicine detected</p>
                  <p className="text-sm text-gray-600">
                    Suggest lower dosage for calves
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <p className="font-semibold text-green-800">Recommended Withdrawal: 5 days</p>
              <p className="text-sm text-green-700 mt-1">
                Alternative: Amoxicillin (Low-residue)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Treatments Table */}
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4">Active Treatments</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Animal ID</th>
                <th className="text-left py-2">Farmer Name</th>
                <th className="text-left py-2">Medicine</th>
                <th className="text-left py-2">Dosage</th>
                <th className="text-left py-2">Start Date</th>
                <th className="text-left py-2">Withdrawal End</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {treatments.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8 text-gray-500">
                    No active treatments
                  </td>
                </tr>
              ) : (
                treatments.map((treatment) => (
                  <tr key={treatment._id} className="border-b">
                    <td className="py-2">{treatment.animalId?.pashuAadhaarId || '-'}</td>
                    <td className="py-2">{treatment.farmerId?.name || '-'}</td>
                    <td className="py-2">{treatment.medicine}</td>
                    <td className="py-2">{treatment.dosage} {treatment.dosageUnit}</td>
                    <td className="py-2">
                      {new Date(treatment.dateGiven).toLocaleDateString()}
                    </td>
                    <td className="py-2">
                      {new Date(treatment.withdrawalEndDate).toLocaleDateString()}
                    </td>
                    <td className="py-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        treatment.status === 'active' ? 'bg-green-100 text-green-800' :
                        treatment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {treatment.status}
                      </span>
                    </td>
                    <td className="py-2">
                      <button className="text-primary-blue hover:underline">
                        View
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

export default VetDashboard;

