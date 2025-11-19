import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { adminAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
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

const CreateStateAdmin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm();

  const onSubmit = async (data) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await adminAPI.createStateAdmin({
        name: data.name,
        email: data.email,
        phone: data.phone,
        state: data.state,
        password: data.password,
      });

      if (response.data.success) {
        setShowSuccessModal(true);
        setTimeout(() => {
          navigate('/dashboard/admin/super-admin/manage-state-admins');
        }, 2000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create State Admin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-bg-light dark:bg-gray-900 min-h-screen">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard/admin/super-admin/manage-state-admins')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <UserPlus className="w-8 h-8 text-primary-green" />
            Create State Admin
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Create a new State-level administrator</p>
        </div>
      </div>

      <Card className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-md max-w-2xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...register('name', { required: 'Name is required' })}
              placeholder="Enter full name"
              className="rounded-xl"
            />
            {errors.name && (
              <p className="text-sm text-danger-red">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
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
            <Label htmlFor="phone">Mobile Number *</Label>
            <Input
              id="phone"
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
            <Label htmlFor="state">State *</Label>
            <Select
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
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              {...register('password', {
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters',
                },
              })}
              placeholder="Enter password"
              className="rounded-xl"
            />
            {errors.password && (
              <p className="text-sm text-danger-red">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword', { required: 'Please confirm password' })}
              placeholder="Confirm password"
              className="rounded-xl"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-danger-red">{errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <strong>Role:</strong> State Admin (Fixed - Cannot be changed)
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard/admin/super-admin/manage-state-admins')}
              className="flex-1 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-primary-green hover:bg-green-700 rounded-xl"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Admin'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-primary-green" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                State Admin Created Successfully!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The State Admin has been created and can now access the portal.
              </p>
              <Button
                onClick={() => navigate('/dashboard/admin/super-admin/manage-state-admins')}
                className="bg-primary-green hover:bg-green-700 rounded-xl"
              >
                View State Admins
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CreateStateAdmin;

