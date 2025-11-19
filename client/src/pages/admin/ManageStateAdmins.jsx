import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { adminAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { Users, Plus, Edit, Trash2, Search, X } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

// Indian States List
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Puducherry'
];

const ManageStateAdmins = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stateAdmins, setStateAdmins] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteAdminId, setDeleteAdminId] = useState(null);
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm();

  useEffect(() => {
    loadStateAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, filterState, filterStatus]);

  const loadStateAdmins = async () => {
    setLoading(true);
    try {
      // Build query params object - only include non-empty values
      const queryParams = {};
      if (searchTerm && searchTerm.trim() !== '') {
        queryParams.search = searchTerm.trim();
      }
      if (filterState && filterState.trim() !== '') {
        queryParams.state = filterState.trim();
      }
      if (filterStatus && filterStatus.trim() !== '') {
        queryParams.status = filterStatus.trim();
      }
      
      console.log('Loading State Admins with params:', queryParams);
      
      const response = await adminAPI.getStateAdmins(queryParams);
      
      console.log('State Admins API Response:', response.data);
      
      if (response.data && response.data.success) {
        const admins = response.data.data || [];
        console.log(`Loaded ${admins.length} State Admins:`, admins);
        setStateAdmins(admins);
        
        if (admins.length === 0) {
          console.log('No state admins found in database with current filters');
          // Don't show error toast if no results - might just be empty database or filtered out
        }
      } else {
        console.error('API response format error:', response.data);
        toast.error(response.data?.message || 'Failed to load State Admins');
        setStateAdmins([]);
      }
    } catch (error) {
      console.error('Error loading State Admins:', error);
      console.error('Error response:', error.response?.data);
      
      // Don't show toast for network errors that might be temporary
      if (error.response) {
        toast.error(
          error.response?.data?.message || 
          'Failed to load State Admins. Please try again.'
        );
      } else {
        toast.error('Network error. Please check your connection.');
      }
      setStateAdmins([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const response = await adminAPI.updateStateAdmin(id, {
        isActive: !currentStatus,
      });
      if (response.data.success) {
        toast.success(`State Admin ${!currentStatus ? 'activated' : 'deactivated'}`);
        loadStateAdmins();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update State Admin status');
    }
  };

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setValue('name', admin.name);
    setValue('email', admin.email);
    setValue('phone', admin.phone || '');
    setValue('state', admin.state || '');
    setValue('password', '');
    setShowEditModal(true);
  };

  const handleDelete = (id) => {
    setDeleteAdminId(id);
    setShowDeleteModal(true);
  };

  const onEditSubmit = async (data) => {
    try {
      const updateData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        state: data.state,
      };
      
      // Only include password if provided
      if (data.password && data.password.length > 0) {
        updateData.password = data.password;
      }

      const response = await adminAPI.updateStateAdmin(editingAdmin._id, updateData);
      if (response.data.success) {
        toast.success('State Admin updated successfully');
        setShowEditModal(false);
        setEditingAdmin(null);
        reset();
        loadStateAdmins();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update State Admin');
    }
  };

  const confirmDelete = async () => {
    try {
      const response = await adminAPI.deleteStateAdmin(deleteAdminId);
      if (response.data.success) {
        toast.success('State Admin deleted successfully');
        setShowDeleteModal(false);
        setDeleteAdminId(null);
        loadStateAdmins();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete State Admin');
      setShowDeleteModal(false);
      setDeleteAdminId(null);
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Users className="w-8 h-8 text-primary-green" />
            Manage State Admins
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage all State-level administrators</p>
        </div>
        <Button
          onClick={() => navigate('/dashboard/admin/super-admin/create-state-admin')}
          className="bg-primary-green hover:bg-green-700 rounded-xl flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create State Admin
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by name or email..."
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
            {INDIAN_STATES.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="flex h-10 w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 text-sm"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>State</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stateAdmins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No State Admins found
                  </TableCell>
                </TableRow>
              ) : (
                stateAdmins.map((admin) => (
                  <TableRow key={admin._id}>
                    <TableCell className="font-medium">{admin.name}</TableCell>
                    <TableCell>{admin.email}</TableCell>
                    <TableCell>{admin.phone || 'N/A'}</TableCell>
                    <TableCell>{admin.state || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge
                        className={admin.isActive ? 'bg-green-500 text-white' : 'bg-gray-400 text-white'}
                      >
                        {admin.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>{admin.createdBy?.name || 'N/A'}</TableCell>
                    <TableCell>
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(admin)}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1"
                        >
                          <Edit className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(admin._id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Edit Modal */}
      {showEditModal && editingAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-2xl mx-4 w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit State Admin</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingAdmin(null);
                  reset();
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Name *</Label>
                <Input
                  id="edit-name"
                  {...register('name', { required: 'Name is required' })}
                  placeholder="Enter full name"
                  className="rounded-xl"
                />
                {errors.name && (
                  <p className="text-sm text-danger-red">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: 'Please enter a valid email',
                    },
                  })}
                  placeholder="Enter email address"
                  className="rounded-xl"
                />
                {errors.email && (
                  <p className="text-sm text-danger-red">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-phone">Mobile Number *</Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  {...register('phone', {
                    required: 'Mobile number is required',
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: 'Please enter a valid 10-digit mobile number',
                    },
                  })}
                  placeholder="Enter 10-digit mobile number"
                  className="rounded-xl"
                />
                {errors.phone && (
                  <p className="text-sm text-danger-red">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-state">State *</Label>
                <Select
                  value={watch('state')}
                  onValueChange={(value) => setValue('state', value)}
                  required
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.state && (
                  <p className="text-sm text-danger-red">{errors.state.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-password">New Password (Leave blank to keep current)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  {...register('password', {
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  placeholder="Enter new password (optional)"
                  className="rounded-xl"
                />
                {errors.password && (
                  <p className="text-sm text-danger-red">{errors.password.message}</p>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingAdmin(null);
                    reset();
                  }}
                  className="flex-1 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-primary-green hover:bg-green-700 rounded-xl"
                >
                  Update State Admin
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Delete State Admin?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you sure you want to delete this State Admin? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteAdminId(null);
                  }}
                  className="flex-1 rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDelete}
                  className="flex-1 bg-danger-red hover:bg-red-700 text-white rounded-xl"
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ManageStateAdmins;

