import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { AlertTriangle, Eye, Search, Filter } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';

const AIAlerts = () => {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('');

  useEffect(() => {
    loadAlerts();
  }, [searchTerm, filterType, filterSeverity]);

  const loadAlerts = async () => {
    try {
      const response = await adminAPI.getAIAlerts({
        search: searchTerm,
        type: filterType,
        severity: filterSeverity,
      });
      if (response.data.success) {
        setAlerts(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  const getAlertColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-600';
      case 'warning':
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-600';
      default:
        return 'border-green-500 bg-green-50 dark:bg-green-900/20 dark:border-green-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-bg-light dark:bg-gray-900">
        <div className="text-lg text-gray-900 dark:text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-bg-light dark:bg-gray-900 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-danger-red" />
          AI Alerts Monitoring
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor AI-generated alerts and notifications</p>
      </div>

      <Card className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="flex h-10 w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm"
          >
            <option value="">All Types</option>
            <option value="overdose">Overdose</option>
            <option value="withdrawal_violation">Withdrawal Violation</option>
            <option value="mrl_violation">MRL Violation</option>
            <option value="amr_risk_spike">AMR Risk Spike</option>
          </select>
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="flex h-10 w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm"
          >
            <option value="">All Severity</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="info">Info</option>
          </select>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {alerts.length === 0 ? (
          <Card className="p-8 col-span-full text-center">
            <p className="text-gray-500 dark:text-gray-400">No alerts found</p>
          </Card>
        ) : (
          alerts.map((alert) => (
            <Card
              key={alert._id}
              className={`p-6 rounded-xl shadow-md border-l-4 ${getAlertColor(alert.severity)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <Badge
                  className={
                    alert.severity === 'critical'
                      ? 'bg-red-500 text-white'
                      : alert.severity === 'warning'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-green-500 text-white'
                  }
                >
                  {alert.severity || 'Info'}
                </Badge>
                <span className="text-xs text-gray-500">
                  {new Date(alert.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h3 className="font-semibold text-lg mb-2 dark:text-white">{alert.type || 'Alert'}</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">{alert.message}</p>
              <div className="space-y-2 text-sm dark:text-gray-300">
                {alert.data?.animalId && (
                  <p>
                    <strong>Animal ID:</strong> {alert.data.animalId}
                  </p>
                )}
                {alert.data?.farmerName && (
                  <p>
                    <strong>Farmer:</strong> {alert.data.farmerName}
                  </p>
                )}
                {alert.data?.vet && (
                  <p>
                    <strong>Vet:</strong> {alert.data.vet}
                  </p>
                )}
                {alert.data?.drug && (
                  <p>
                    <strong>Drug:</strong> {alert.data.drug}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                className="mt-4 w-full rounded-xl"
                onClick={() => {
                  // Navigate to case details
                  toast.info('View case functionality to be implemented');
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Case
              </Button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AIAlerts;

