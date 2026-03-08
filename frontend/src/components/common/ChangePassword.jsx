import { useState } from 'react';
import axios from 'axios';
import { Lock, Eye, EyeOff, Key, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ChangePassword = ({ onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    hasLength: false,
    hasNumber: false,
    hasUpper: false,
    hasLower: false,
    hasSpecial: false
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));

    // Check password strength when new password changes
    if (name === 'new_password') {
      checkPasswordStrength(value);
    }
  };

  const checkPasswordStrength = (password) => {
    const strength = {
      hasLength: password.length >= 8,
      hasNumber: /\d/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const score = Object.values(strength).filter(Boolean).length;
    setPasswordStrength({ ...strength, score });
  };

  const getStrengthColor = () => {
    const { score } = passwordStrength;
    if (score <= 2) return 'bg-red-500';
    if (score <= 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    const { score } = passwordStrength;
    if (score <= 2) return 'Weak';
    if (score <= 4) return 'Moderate';
    return 'Strong';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }

    // Validate password strength
    if (passwordStrength.score < 3) {
      toast.error('Please choose a stronger password');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/auth/change-password',
        {
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password
        }
      );

      toast.success('Password changed successfully');
      
      // Reset form
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });

      if (onSuccess) onSuccess(response.data);
    } catch (error) {
      console.error('Password change error:', error);
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
        <p className="text-sm text-gray-500 mb-6">
          Update your password to keep your account secure
        </p>
      </div>

      <div className="space-y-4">
        {/* Current Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Password
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type={showCurrentPassword ? "text" : "password"}
              name="current_password"
              value={passwordForm.current_password}
              onChange={handleChange}
              className="w-full pl-9 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
              placeholder="Enter current password"
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            New Password
          </label>
          <div className="relative">
            <Key className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type={showNewPassword ? "text" : "password"}
              name="new_password"
              value={passwordForm.new_password}
              onChange={handleChange}
              className="w-full pl-9 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
              placeholder="Enter new password"
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password Strength Meter */}
          {passwordForm.new_password && (
            <div className="mt-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-500">Password Strength</span>
                <span className="text-xs font-medium" style={{ 
                  color: passwordStrength.score <= 2 ? '#EF4444' : 
                         passwordStrength.score <= 4 ? '#F59E0B' : '#10B981' 
                }}>
                  {getStrengthText()}
                </span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${getStrengthColor()}`}
                  style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                />
              </div>
              <div className="grid grid-cols-5 gap-1 mt-2">
                <div className="flex items-center text-xs">
                  <CheckCircle className={`w-3 h-3 mr-1 ${passwordStrength.hasLength ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className={passwordStrength.hasLength ? 'text-gray-700' : 'text-gray-400'}>8+ chars</span>
                </div>
                <div className="flex items-center text-xs">
                  <CheckCircle className={`w-3 h-3 mr-1 ${passwordStrength.hasNumber ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className={passwordStrength.hasNumber ? 'text-gray-700' : 'text-gray-400'}>Number</span>
                </div>
                <div className="flex items-center text-xs">
                  <CheckCircle className={`w-3 h-3 mr-1 ${passwordStrength.hasUpper ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className={passwordStrength.hasUpper ? 'text-gray-700' : 'text-gray-400'}>Uppercase</span>
                </div>
                <div className="flex items-center text-xs">
                  <CheckCircle className={`w-3 h-3 mr-1 ${passwordStrength.hasLower ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className={passwordStrength.hasLower ? 'text-gray-700' : 'text-gray-400'}>Lowercase</span>
                </div>
                <div className="flex items-center text-xs">
                  <CheckCircle className={`w-3 h-3 mr-1 ${passwordStrength.hasSpecial ? 'text-green-500' : 'text-gray-300'}`} />
                  <span className={passwordStrength.hasSpecial ? 'text-gray-700' : 'text-gray-400'}>Special</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm New Password
          </label>
          <div className="relative">
            <Key className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirm_password"
              value={passwordForm.confirm_password}
              onChange={handleChange}
              className="w-full pl-9 pr-10 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition"
              placeholder="Confirm new password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {passwordForm.new_password && passwordForm.confirm_password && (
            <div className="mt-2">
              {passwordForm.new_password === passwordForm.confirm_password ? (
                <p className="text-xs text-green-600 flex items-center">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Passwords match
                </p>
              ) : (
                <p className="text-xs text-red-600 flex items-center">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Passwords do not match
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              Updating...
            </>
          ) : (
            'Update Password'
          )}
        </button>
      </div>
    </form>
  );
};

export default ChangePassword;