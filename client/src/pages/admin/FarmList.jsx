import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { MapPin, Search, Filter } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';

const FarmList = () => {
  const [loading, setLoading] = useState(true);
  const [farms, setFarms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [filterCompliance, setFilterCompliance] = useState('');

  useEffect(() => {
    loadFarms();
  }, [searchTerm, filterState, filterDistrict, filterCompliance]);

  const loadFarms = async () => {
    try {
      const response = await adminAPI.getFarmsList({
        search: searchTerm,
        state: filterState,
        district: filterDistrict,
        compliance: filterCompliance,
      });
      if (response.data.success) {
        setFarms(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load farms');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getComplianceStatus = (score) => {
    if (score >= 80) return { label: 'Good', color: 'bg-green-500' };
    if (score >= 60) return { label: 'Warning', color: 'bg-yellow-500' };
    return { label: 'Critical', color: 'bg-red-500' };
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <MapPin className="w-8 h-8 text-primary-green" />
            Farm Registry
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage all registered farms</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search farms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="flex h-10 w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm"
          >
            <option value="">All States</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Gujarat">Gujarat</option>
            <option value="Punjab">Punjab</option>
          </select>
          <select
            value={filterDistrict}
            onChange={(e) => setFilterDistrict(e.target.value)}
            className="flex h-10 w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm"
          >
            <option value="">All Districts</option>
            <option value="Mumbai">Mumbai</option>
            <option value="Pune">Pune</option>
            <option value="Nagpur">Nagpur</option>
          </select>
          <select
            value={filterCompliance}
            onChange={(e) => setFilterCompliance(e.target.value)}
            className="flex h-10 w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm"
          >
            <option value="">All Compliance</option>
            <option value="good">Good (≥80%)</option>
            <option value="warning">Warning (60-79%)</option>
            <option value="critical">Critical (&lt;60%)</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Farm Name</TableHead>
                <TableHead>Owner Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Total Animals</TableHead>
                <TableHead>MRL Compliance %</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {farms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No farms found
                  </TableCell>
                </TableRow>
              ) : (
                farms.map((farm) => {
                  const status = getComplianceStatus(farm.amuComplianceScore || 0);
                  return (
                    <TableRow key={farm._id}>
                      <TableCell className="font-medium">
                        {farm.farmRegistrationId || farm.farmerId?.name || 'N/A'}
                      </TableCell>
                      <TableCell>{farm.fullName || farm.farmerId?.name || 'N/A'}</TableCell>
                      <TableCell>
                        {farm.district ? `${farm.district}, ${farm.state}` : farm.state || 'N/A'}
                      </TableCell>
                      <TableCell>{farm.totalAnimals || 0}</TableCell>
                      <TableCell>
                        <Badge className={status.color}>
                          {(farm.amuComplianceScore || 0).toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={status.color}>{status.label}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default FarmList;

