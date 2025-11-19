import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { Users, Search, Circle } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';

const VeterinariansList = () => {
  const [loading, setLoading] = useState(true);
  const [vets, setVets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadVets();
  }, [searchTerm]);

  const loadVets = async () => {
    setLoading(true);
    try {
      // Build query params object - only include non-empty values
      const queryParams = {};
      if (searchTerm && searchTerm.trim() !== '') {
        queryParams.search = searchTerm.trim();
      }
      
      console.log('Loading Veterinarians with params:', queryParams);
      
      const response = await adminAPI.getVeterinariansList(queryParams);
      
      console.log('Veterinarians API Response:', response.data);
      
      if (response.data && response.data.success) {
        const veterinarians = response.data.data || [];
        console.log(`Loaded ${veterinarians.length} Veterinarians:`, veterinarians);
        setVets(veterinarians);
      } else {
        console.error('API response format error:', response.data);
        toast.error(response.data?.message || 'Failed to load veterinarians');
        setVets([]);
      }
    } catch (error) {
      console.error('Error loading Veterinarians:', error);
      console.error('Error response:', error.response?.data);
      toast.error(
        error.response?.data?.message || 
        'Failed to load veterinarians. Please try again.'
      );
      setVets([]);
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
          <Users className="w-8 h-8 text-primary-green" />
          Veterinarians Directory
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">View all registered veterinarians</p>
      </div>

      <Card className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by name or registration number..."
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
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Registration No</TableHead>
                <TableHead>State</TableHead>
                <TableHead>District/City</TableHead>
                <TableHead>Live Status</TableHead>
                <TableHead>Total Prescriptions</TableHead>
                <TableHead>Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No veterinarians found
                  </TableCell>
                </TableRow>
              ) : (
                vets.map((vet) => (
                  <TableRow key={vet._id}>
                    <TableCell className="font-medium">{vet.name || 'N/A'}</TableCell>
                    <TableCell>{vet.email || 'N/A'}</TableCell>
                    <TableCell>{vet.registrationNumber || 'N/A'}</TableCell>
                    <TableCell>{vet.state || 'N/A'}</TableCell>
                    <TableCell>{vet.district || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Circle
                          className={`w-3 h-3 ${
                            vet.onlineStatus ? 'text-green-500 fill-green-500' : 'text-gray-400'
                          }`}
                        />
                        <span className="text-sm">{vet.onlineStatus ? 'Online' : 'Offline'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{vet.totalPrescriptions || 0}</TableCell>
                    <TableCell>
                      <Badge className="bg-yellow-500 text-white">
                        {vet.rating > 0 ? vet.rating.toFixed(1) : 'N/A'} ⭐
                      </Badge>
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

export default VeterinariansList;

