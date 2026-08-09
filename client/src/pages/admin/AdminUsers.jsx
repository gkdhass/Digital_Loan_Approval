import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Trash2, ChevronLeft, ChevronRight, Mail, Phone, Calendar } from 'lucide-react';
import api from '../../services/api';
import { pageVariants, cardVariants } from '../../animations/variants';
import { SkeletonTable } from '../../components/SkeletonLoader';
import { useToast } from '../../hooks/useToast.jsx';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const { showToast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/admin/users', {
        params: { page: currentPage, limit: 10, search: searchTerm || undefined },
      });
      // Interceptor unwraps HTTP body → response = {success, data:[...], totalPages}
      setUsers(Array.isArray(response.data) ? response.data : []);
      setTotalPages(response.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(err?.message || 'Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter((user) => user._id !== userId));
      setDeleteConfirm(null);
      showToast('User deleted successfully', 'success');
    } catch (error) {
      console.error('Failed to delete user:', error);
      showToast('Failed to delete user', 'error');
    }
  };

  if (loading && currentPage === 1) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SkeletonTable rows={10} />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="min-h-screen bg-background dark:bg-transparent py-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground dark:text-foregroundDark mb-2">User Management</h1>
          <p className="text-foregroundSecondary dark:text-foregroundSecondaryDark">Manage customer accounts</p>
        </div>

        {/* Search */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="card mb-6"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-foregroundMuted dark:text-foregroundMutedDark" />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-cardDark border border-border dark:border-borderDark rounded-lg text-foreground dark:text-foregroundDark placeholder:text-foregroundMuted dark:placeholder:text-foregroundMutedDark focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primaryDark transition-colors duration-200"
            />
          </div>
        </motion.div>

        {/* Users Table */}
        <motion.div
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          custom={1}
          className="card"
        >
          {users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="mx-auto text-foregroundSecondary mb-4" size={48} />
              <p className="text-foregroundSecondary">No users found</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border dark:border-borderDark">
                      <th className="text-left py-4 px-4 font-semibold text-foreground dark:text-foregroundDark">User</th>
                      <th className="text-left py-4 px-4 font-semibold text-foreground dark:text-foregroundDark">Contact</th>
                      <th className="text-left py-4 px-4 font-semibold text-foreground dark:text-foregroundDark">Joined</th>
                      <th className="text-right py-4 px-4 font-semibold text-foreground dark:text-foregroundDark">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, index) => (
                      <motion.tr
                        key={user._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-border dark:border-borderDark hover:bg-input dark:hover:bg-cardSecondaryDark transition-colors duration-200"
                      >
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-semibold text-foreground dark:text-foregroundDark">{user.fullName}</p>
                            <p className="text-sm text-foregroundSecondary dark:text-foregroundSecondaryDark">{user.email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-sm text-foregroundSecondary dark:text-foregroundSecondaryDark">
                            <Phone size={14} />
                            {user.phone}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2 text-sm text-foregroundSecondary dark:text-foregroundSecondaryDark">
                            <Calendar size={14} />
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setDeleteConfirm(user._id)}
                            className="p-2 text-error dark:text-errorDark hover:bg-errorBadge dark:hover:bg-errorDark/20 rounded-lg transition-colors duration-200"
                          >
                            <Trash2 size={18} />
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-6 pt-6 border-t border-border">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>
                  <span className="text-foregroundSecondary">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="btn-secondary flex items-center gap-2"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setDeleteConfirm(null)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-cardDark rounded-2xl p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-foreground dark:text-foregroundDark mb-4">Delete User</h3>
            <p className="text-foregroundSecondary dark:text-foregroundSecondaryDark mb-6">
              Are you sure you want to delete this user? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-input dark:bg-cardDark text-foreground dark:text-foregroundDark rounded-lg hover:bg-border dark:hover:bg-borderDark transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-error dark:bg-errorDark text-white rounded-lg hover:bg-error/90 dark:hover:bg-errorDark/90 transition-colors duration-200"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default AdminUsers;
