import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { Building2, Search, TestTube } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';

const LabsList = () => {
  const [loading, setLoading] = useState(true);
  const [labs, setLabs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadLabs();
  }, [searchTerm]);

  const loadLabs = async () => {
    try {
      const response = await adminAPI.getLabsList({ search: searchTerm });
      if (response.data.success) {
        setLabs(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load labs');
    } finally {
      setLoading(false);
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
          <Building2 className="w-8 h-8 text-primary-green" />
          Labs Directory
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">View all registered laboratories</p>
      </div>

      <Card className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search labs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
      </Card>

      <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lab Name</TableHead>
                <TableHead>Registration</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Tests Completed</TableHead>
                <TableHead>MRL Violations</TableHead>
                <TableHead>Last Test</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {labs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No labs found
                  </TableCell>
                </TableRow>
              ) : (
                labs.map((lab) => (
                  <TableRow key={lab._id}>
                    <TableCell className="font-medium">{lab.name}</TableCell>
                    <TableCell>{lab.email}</TableCell>
                    <TableCell>
                      {lab.district ? `${lab.district}, ${lab.state}` : lab.state || 'N/A'}
                    </TableCell>
                    <TableCell>{lab.testsCompleted || 0}</TableCell>
                    <TableCell>
                      <Badge className={lab.violations > 0 ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}>
                        {lab.violations || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {lab.updatedAt ? new Date(lab.updatedAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default LabsList;

