import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Calendar, Edit2, Save, X, Camera, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { useToast } from '../hooks/useToast';
import { buttonSpring } from '../animations/springs';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(user?.profilePicture || '');
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      pincode: user?.address?.pincode || '',
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: { ...formData.address, [addressField]: value },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.updateProfile(formData);
      updateUser(response.data);
      showToast('Profile updated successfully', 'success');
      setIsEditing(false);
    } catch (error) {
      showToast(error.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      address: {
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        pincode: user?.address?.pincode || '',
      },
    });
    setPreviewUrl(user?.profilePicture || '');
    setIsEditing(false);
  };

  const handlePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        showToast('Only JPEG, JPG, and PNG images are allowed', 'error');
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        showToast('File size must be less than 5MB', 'error');
        return;
      }
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
      uploadPicture(file);
    }
  };

  const uploadPicture = async (file) => {
    setUploadingPicture(true);
    try {
      const formData = new FormData();
      formData.append('profilePicture', file);
      const response = await authAPI.uploadProfilePicture(formData);
      updateUser(response.data.user);
      showToast('Profile picture updated successfully', 'success');
    } catch (error) {
      showToast(error.message || 'Failed to upload profile picture', 'error');
      setPreviewUrl(user?.profilePicture || '');
    } finally {
      setUploadingPicture(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">My Profile</h1>
          <p className="text-foregroundSecondary">Manage your personal information</p>
        </div>

        <div className="card p-8">
          {/* Header with Avatar */}
          <div className="flex items-center gap-6 mb-8 pb-6 border-b border-border dark:border-borderDark">
            <div className="relative">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Profile"
                  className="h-24 w-24 rounded-full object-cover border-4 border-secondary dark:border-secondaryDark"
                />
              ) : (
                <div className="h-24 w-24 bg-secondary dark:bg-secondaryDark/30 rounded-full flex items-center justify-center border-4 border-secondary dark:border-secondaryDark">
                  <span className="text-4xl font-bold text-foreground dark:text-foregroundSecondaryDark">
                    {user?.fullName?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <label className="absolute bottom-0 right-0 h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors shadow-lg">
                <Camera className="h-4 w-4 text-white" />
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  onChange={handlePictureChange}
                  className="hidden"
                  disabled={uploadingPicture}
                />
              </label>
              {uploadingPicture && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-foreground mb-1">{user?.fullName}</h2>
              <p className="text-foregroundSecondary flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {user?.email}
              </p>
              <p className="text-sm text-foreground dark:text-foregroundSecondaryDark mt-1">
                {user?.role === 'admin' ? 'Administrator' : 'Customer'}
              </p>
            </div>
            {!isEditing && (
              <motion.button
                {...buttonSpring}
                onClick={() => setIsEditing(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <Edit2 className="h-4 w-4" />
                Edit Profile
              </motion.button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="label">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foregroundSecondary" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input-field pl-11"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="label">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foregroundSecondary" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input-field pl-11"
                    required
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="label">Street Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-foregroundSecondary" />
                  <input
                    type="text"
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input-field pl-11"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">City</label>
                  <input
                    type="text"
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">State</label>
                  <input
                    type="text"
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="label">Pincode</label>
                <input
                  type="text"
                  name="address.pincode"
                  value={formData.address.pincode}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className="input-field"
                />
              </div>

              {/* Account Info (Read-only) */}
              <div className="pt-4 border-t border-border dark:border-borderDark">
                <label className="label mb-3">Account Information</label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-cardSecondaryDark rounded-lg">
                    <p className="text-xs text-foregroundSecondary mb-1">Email</p>
                    <p className="text-sm font-medium text-foreground">{user?.email}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-cardSecondaryDark rounded-lg">
                    <p className="text-xs text-foregroundSecondary mb-1">Member Since</p>
                    <p className="text-sm font-medium text-foreground">
                      {new Date(user?.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <motion.button
                    {...buttonSpring}
                    type="button"
                    onClick={handleCancel}
                    className="btn-secondary flex-1 flex items-center justify-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </motion.button>
                  <motion.button
                    {...buttonSpring}
                    type="submit"
                    disabled={loading}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </motion.button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
