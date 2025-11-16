import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { farmerAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import { FiCheckCircle, FiAlertCircle, FiXCircle, FiFilter } from 'react-icons/fi';

const AlertsPage = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, [filter]);

  const loadAlerts = async () => {
    try {
      const params = {};
      if (filter !== 'all') {
        if (filter === 'unread') {
          params.readStatus = false;
        } else {
          params.type = filter;
        }
      }
      
      const response = await farmerAPI.getAlerts(params);
      setAlerts(response.data.data);
    } catch (error) {
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (alertId) => {
    try {
      await farmerAPI.markAlertAsRead(alertId);
      loadAlerts();
      toast.success('Alert marked as read');
    } catch (error) {
      toast.error('Failed to mark alert as read');
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'safe':
        return <FiCheckCircle className="w-6 h-6 text-green-500" />;
      case 'warning':
        return <FiAlertCircle className="w-6 h-6 text-yellow-500" />;
      case 'violation':
        return <FiXCircle className="w-6 h-6 text-red-500" />;
      default:
        return <FiAlertCircle className="w-6 h-6 text-gray-500" />;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Alerts Center</h1>
        
        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all' ? 'bg-primary-green text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'unread' ? 'bg-primary-green text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Unread
          </button>
          <button
            onClick={() => setFilter('warning')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'warning' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Warnings
          </button>
          <button
            onClick={() => setFilter('violation')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'violation' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Violations
          </button>
          <button
            onClick={() => setFilter('safe')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'safe' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            Safe
          </button>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FiAlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p>No alerts found</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert._id}
                className={`p-4 rounded-lg flex items-start space-x-4 ${
                  alert.type === 'safe' ? 'alert-safe' :
                  alert.type === 'warning' ? 'alert-warning' :
                  'alert-violation'
                } ${!alert.readStatus ? 'border-l-4' : ''}`}
              >
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{alert.title}</h3>
                      <p className="text-gray-700 mt-1">{alert.message}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!alert.readStatus && (
                      <button
                        onClick={() => handleMarkAsRead(alert._id)}
                        className="ml-4 text-sm text-primary-blue hover:underline"
                      >
                        Mark as Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertsPage;

