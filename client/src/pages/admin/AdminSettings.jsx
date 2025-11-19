import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useDarkMode } from '../../context/DarkModeContext';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Settings, User, Lock, Key, Moon } from 'lucide-react';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

const AdminSettings = () => {
  const { user } = useAuth();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch } = useForm();

  const onSubmitPassword = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // Implement password update API call
      toast.success('Password updated successfully');
    } catch (error) {
      toast.error('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-bg-light dark:bg-gray-900 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Settings className="w-8 h-8 text-primary-green" />
          Admin Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Profile Section */}
      <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
        <div className="flex items-center gap-3 mb-6">
          <User className="w-5 h-5 text-primary-green" />
          <h2 className="text-xl font-semibold">Profile Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label>Name</Label>
            <Input value={user?.name || ''} disabled className="rounded-xl mt-1" />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={user?.email || ''} disabled className="rounded-xl mt-1" />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={user?.phone || ''} disabled className="rounded-xl mt-1" />
          </div>
          <div>
            <Label>Role</Label>
            <Input value={user?.role || ''} disabled className="rounded-xl mt-1 capitalize" />
          </div>
          {user?.state && (
            <div>
              <Label>State</Label>
              <Input value={user.state} disabled className="rounded-xl mt-1" />
            </div>
          )}
          {user?.district && (
            <div>
              <Label>District</Label>
              <Input value={user.district} disabled className="rounded-xl mt-1" />
            </div>
          )}
        </div>
      </Card>

      {/* Password Section */}
      <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
        <div className="flex items-center gap-3 mb-6">
          <Lock className="w-5 h-5 text-primary-green" />
          <h2 className="text-xl font-semibold">Update Password</h2>
        </div>
        <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">Current Password *</Label>
            <Input
              id="currentPassword"
              type="password"
              {...register('currentPassword', { required: 'Current password is required' })}
              className="rounded-xl mt-1"
            />
            {errors.currentPassword && (
              <p className="text-sm text-danger-red mt-1">{errors.currentPassword.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="newPassword">New Password *</Label>
            <Input
              id="newPassword"
              type="password"
              {...register('newPassword', {
                required: 'New password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' },
              })}
              className="rounded-xl mt-1"
            />
            {errors.newPassword && (
              <p className="text-sm text-danger-red mt-1">{errors.newPassword.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm New Password *</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword', { required: 'Please confirm password' })}
              className="rounded-xl mt-1"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-danger-red mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>
          <Button
            type="submit"
            className="bg-primary-green hover:bg-green-700 rounded-xl"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </form>
      </Card>

      {/* Access Keys Section */}
      <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
        <div className="flex items-center gap-3 mb-6">
          <Key className="w-5 h-5 text-primary-green" />
          <h2 className="text-xl font-semibold">Manage Access Keys</h2>
        </div>
        <p className="text-gray-600 mb-4">
          Generate and manage API access keys for external integrations.
        </p>
        <Button variant="outline" className="rounded-xl">
          Generate New Key
        </Button>
      </Card>

      {/* Dark Mode Section */}
      <Card className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Moon className="w-5 h-5 text-primary-green" />
            <div>
              <h2 className="text-xl font-semibold dark:text-white">Dark Mode</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Toggle dark mode (Optional)</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={toggleDarkMode}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-green rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-green"></div>
          </label>
        </div>
      </Card>
    </div>
  );
};

export default AdminSettings;

