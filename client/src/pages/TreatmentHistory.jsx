import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { treatmentAPI } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  Search,
  Filter,
  Calendar,
  Pill,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Download,
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Button } from '../components/ui/button';

const TreatmentHistory = () => {
  const { user } = useAuth();
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [animalFilter, setAnimalFilter] = useState('all');
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadTreatments();
  }, [statusFilter, animalFilter]);

  const loadTreatments = async () => {
    try {
      setLoading(true);
      const response = await treatmentAPI.getTreatments({
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setTreatments(response.data.data || []);
    } catch (error) {
      console.error('Error loading treatments:', error);
      toast.error('Failed to load treatment history');
    } finally {
      setLoading(false);
    }
  };

  const filteredTreatments = treatments.filter((treatment) => {
    const matchesSearch =
      treatment.medicine?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      treatment.animalId?.pashuAadhaarId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      treatment.animalId?.animalName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAnimal =
      animalFilter === 'all' || treatment.animalId?._id === animalFilter;

    return matchesSearch && matchesAnimal;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        icon: CheckCircle,
        label: 'Active',
      },
      pending: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        icon: Clock,
        label: 'Pending',
      },
      completed: {
        bg: 'bg-blue-100',
        text: 'text-blue-800',
        icon: CheckCircle,
        label: 'Completed',
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const getRiskBadge = (riskScore) => {
    if (riskScore >= 70) {
      return (
        <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700">
          High Risk
        </span>
      );
    } else if (riskScore >= 50) {
      return (
        <span className="px-2 py-1 rounded text-xs font-semibold bg-orange-100 text-orange-700">
          Medium Risk
        </span>
      );
    } else if (riskScore >= 30) {
      return (
        <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">
          Low Risk
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">
        Very Low Risk
      </span>
    );
  };

  const handleViewDetails = (treatment) => {
    setSelectedTreatment(treatment);
    setShowDetailsModal(true);
  };

  const uniqueAnimals = Array.from(
    new Map(treatments.map((t) => [t.animalId?._id, t.animalId])).values()
  ).filter(Boolean);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2E7D32] mx-auto mb-4"></div>
              <p className="text-gray-600">Loading treatment history...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Treatment History
          </h1>
          <p className="text-gray-600 text-lg">
            View and manage all treatment records
          </p>
        </div>

        {/* Filters */}
        <Card className="p-6 rounded-2xl border-2 border-gray-200 shadow-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <Label htmlFor="search" className="mb-2 block">
                Search
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="search"
                  type="text"
                  placeholder="Search by medicine, animal ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-xl h-12 border-2"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <Label htmlFor="status" className="mb-2 block">
                Status
              </Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="rounded-xl h-12 border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Animal Filter */}
            <div>
              <Label htmlFor="animal" className="mb-2 block">
                Animal
              </Label>
              <Select value={animalFilter} onValueChange={setAnimalFilter}>
                <SelectTrigger className="rounded-xl h-12 border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Animals</SelectItem>
                  {uniqueAnimals.map((animal) => (
                    <SelectItem key={animal._id} value={animal._id}>
                      {animal.animalName || 'Unnamed'} - {animal.pashuAadhaarId || animal.tagId}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Treatments Table */}
        <Card className="p-6 rounded-2xl border-2 border-gray-200 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              All Treatments ({filteredTreatments.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Animal</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Medicine</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Dosage</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Duration</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Withdrawal End</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Risk Score</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTreatments.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-12 text-gray-500">
                      <Pill className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg">No treatments found</p>
                      <p className="text-sm mt-2">
                        {searchTerm || statusFilter !== 'all' || animalFilter !== 'all'
                          ? 'Try adjusting your filters'
                          : 'Start by adding a treatment'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredTreatments.map((treatment) => (
                    <tr
                      key={treatment._id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">
                            {new Date(treatment.dateGiven).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-800">
                            {treatment.animalId?.animalName || 'Unnamed'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {treatment.animalId?.pashuAadhaarId || treatment.animalId?.tagId || 'N/A'}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Pill className="w-4 h-4 text-[#2E7D32]" />
                          <span className="font-medium">{treatment.medicine}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm">
                          {treatment.dosage} {treatment.dosageUnit}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm">
                          {treatment.duration} {treatment.durationUnit || 'days'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">
                            {treatment.withdrawalEndDate
                              ? new Date(treatment.withdrawalEndDate).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                })
                              : 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {treatment.riskScore !== undefined
                          ? getRiskBadge(treatment.riskScore)
                          : '-'}
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(treatment.status)}
                      </td>
                      <td className="py-4 px-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(treatment)}
                          className="rounded-lg"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedTreatment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Treatment Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Animal Info */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="font-semibold text-gray-800 mb-2">Animal Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>{' '}
                    <span className="font-medium">
                      {selectedTreatment.animalId?.animalName || 'Unnamed'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">ID:</span>{' '}
                    <span className="font-medium">
                      {selectedTreatment.animalId?.pashuAadhaarId ||
                        selectedTreatment.animalId?.tagId ||
                        'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Species:</span>{' '}
                    <span className="font-medium capitalize">
                      {selectedTreatment.animalId?.species || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Medicine Info */}
              <div className="bg-blue-50 p-4 rounded-xl">
                <h3 className="font-semibold text-gray-800 mb-2">Medicine Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Medicine:</span>{' '}
                    <span className="font-medium">{selectedTreatment.medicine}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Dosage:</span>{' '}
                    <span className="font-medium">
                      {selectedTreatment.dosage} {selectedTreatment.dosageUnit}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Frequency:</span>{' '}
                    <span className="font-medium capitalize">{selectedTreatment.frequency}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Duration:</span>{' '}
                    <span className="font-medium">
                      {selectedTreatment.duration} {selectedTreatment.durationUnit || 'days'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="bg-green-50 p-4 rounded-xl">
                <h3 className="font-semibold text-gray-800 mb-2">Important Dates</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Date Given:</span>{' '}
                    <span className="font-medium">
                      {new Date(selectedTreatment.dateGiven).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Withdrawal End:</span>{' '}
                    <span className="font-medium">
                      {selectedTreatment.withdrawalEndDate
                        ? new Date(selectedTreatment.withdrawalEndDate).toLocaleDateString(
                            'en-IN',
                            {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            }
                          )
                        : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Withdrawal Period:</span>{' '}
                    <span className="font-medium">
                      {selectedTreatment.withdrawalPeriod || 'N/A'}{' '}
                      {selectedTreatment.withdrawalPeriodUnit || 'days'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Risk & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-yellow-50 p-4 rounded-xl">
                  <h3 className="font-semibold text-gray-800 mb-2">Risk Score</h3>
                  <p className="text-2xl font-bold text-gray-800">
                    {selectedTreatment.riskScore !== undefined
                      ? `${selectedTreatment.riskScore}/100`
                      : 'N/A'}
                  </p>
                  {selectedTreatment.riskScore !== undefined &&
                    getRiskBadge(selectedTreatment.riskScore)}
                </div>
                <div className="bg-purple-50 p-4 rounded-xl">
                  <h3 className="font-semibold text-gray-800 mb-2">Status</h3>
                  {getStatusBadge(selectedTreatment.status)}
                </div>
              </div>

              {/* Notes */}
              {selectedTreatment.notes && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <h3 className="font-semibold text-gray-800 mb-2">Notes</h3>
                  <p className="text-sm text-gray-700">{selectedTreatment.notes}</p>
                </div>
              )}

              {/* Symptoms */}
              {selectedTreatment.symptoms && (
                <div className="bg-orange-50 p-4 rounded-xl">
                  <h3 className="font-semibold text-gray-800 mb-2">Symptoms</h3>
                  <p className="text-sm text-gray-700">{selectedTreatment.symptoms}</p>
                </div>
              )}

              {/* Blockchain Hash */}
              {selectedTreatment.blockchainHash && (
                <div className="bg-indigo-50 p-4 rounded-xl">
                  <h3 className="font-semibold text-gray-800 mb-2">Blockchain Hash</h3>
                  <p className="text-xs font-mono text-gray-700 break-all">
                    {selectedTreatment.blockchainHash}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={() => setShowDetailsModal(false)} className="rounded-xl">
                Close
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TreatmentHistory;

