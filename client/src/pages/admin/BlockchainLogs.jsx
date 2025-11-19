import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { Link2, Search, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';

const BlockchainLogs = () => {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    loadLogs();
  }, [searchTerm, filterStatus]);

  const loadLogs = async () => {
    try {
      const response = await adminAPI.getBlockchainLogs({
        search: searchTerm,
        status: filterStatus,
      });
      if (response.data.success) {
        setLogs(response.data.data);
      }
    } catch (error) {
      toast.error('Failed to load blockchain logs');
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
          <Link2 className="w-8 h-8 text-primary-green" />
          Blockchain Verification Logs
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">View all blockchain transaction logs</p>
      </div>

      <Card className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by hash, animal ID, or treatment ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="flex h-10 w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm"
          >
            <option value="">All Status</option>
            <option value="verified">Verified</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </Card>

      <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Transaction Hash</TableHead>
                <TableHead>Animal ID</TableHead>
                <TableHead>Treatment ID</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No blockchain logs found
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log._id}>
                    <TableCell className="font-mono text-xs">
                      {log.hash?.substring(0, 20)}...
                    </TableCell>
                    <TableCell>{log.data?.animalId || 'N/A'}</TableCell>
                    <TableCell>{log.data?.treatmentId || 'N/A'}</TableCell>
                    <TableCell>
                      {log.timestamp
                        ? new Date(log.timestamp).toLocaleString()
                        : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {log.verified ? (
                        <Badge className="bg-green-500 text-white flex items-center gap-1 w-fit">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge className="bg-red-500 text-white flex items-center gap-1 w-fit">
                          <XCircle className="w-3 h-3" />
                          Failed
                        </Badge>
                      )}
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

export default BlockchainLogs;

