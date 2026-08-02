import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, DollarSign, Percent, Clock } from 'lucide-react';
import api from '../../services/api';
import { pageVariants, cardVariants } from '../../animations/variants';
import { useToast } from '../../hooks/useToast.jsx';

const AdminLoanTypes = () => {
  const [loanTypes, setLoanTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    minAmount: 100000,
    maxAmount: 5000000,
    interestRate: 10,
    processingFeePercent: 1,
    minTenureMonths: 12,
    maxTenureMonths: 60,
    icon: 'home',
  });

  useEffect(() => {
    fetchLoanTypes();
  }, []);

  const fetchLoanTypes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/loan-types');
      // Safely extract array from response - handle both response structures
      const data = response.data?.data || response.data || [];
      setLoanTypes(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch loan types:', error);
      showToast('Failed to load loan types', 'error');
      setLoanTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingType) {
        await api.put(`/admin/loan-types/${editingType._id}`, formData);
        showToast('Loan type updated successfully', 'success');
      } else {
        await api.post('/admin/loan-types', formData);
        showToast('Loan type created successfully', 'success');
      }
      fetchLoanTypes();
      setShowModal(false);
      setEditingType(null);
      resetForm();
    } catch (error) {
      console.error('Failed to save loan type:', error);
      showToast('Failed to save loan type', 'error');
    }
  };

  const handleEdit = (type) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      description: type.description || '',
      minAmount: type.minAmount,
      maxAmount: type.maxAmount,
      interestRate: type.interestRate,
      processingFeePercent: type.processingFeePercent,
      minTenureMonths: type.minTenureMonths,
      maxTenureMonths: type.maxTenureMonths,
      icon: type.icon || 'home',
    });
    setShowModal(true);
  };

  const handleDelete = async (typeId) => {
    try {
      await api.delete(`/admin/loan-types/${typeId}`);
      setLoanTypes(loanTypes.filter((type) => type._id !== typeId));
      showToast('Loan type deleted successfully', 'success');
    } catch (error) {
      console.error('Failed to delete loan type:', error);
      showToast('Failed to delete loan type', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      minAmount: 100000,
      maxAmount: 5000000,
      interestRate: 10,
      processingFeePercent: 1,
      minTenureMonths: 12,
      maxTenureMonths: 60,
      icon: 'home',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      className="min-h-screen bg-primary py-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-heading mb-2">Loan Types</h1>
            <p className="text-secondary">Manage available loan products</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              resetForm();
              setEditingType(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors"
          >
            <Plus size={16} />
            Add Loan Type
          </motion.button>
        </div>

        {/* Loan Types Grid */}
        {loanTypes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loanTypes.map((type, index) => (
            <motion.div
              key={type._id}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              custom={index}
              className="card"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="text-accent-600" size={24} />
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleEdit(type)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit size={18} />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDelete(type._id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </motion.button>
                </div>
              </div>

              <h3 className="text-xl font-bold text-navy-900 mb-2">{type.name}</h3>
              {type.description && (
                <p className="text-sm text-gray-600 mb-4">{type.description}</p>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Interest Rate</span>
                  <span className="font-semibold text-navy-900">{type.interestRate}% p.a.</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Amount Range</span>
                  <span className="font-semibold text-navy-900">
                    ₹{(type.minAmount / 100000).toFixed(0)}L - ₹{(type.maxAmount / 100000).toFixed(0)}L
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Tenure</span>
                  <span className="font-semibold text-navy-900">
                    {type.minTenureMonths} - {type.maxTenureMonths} months
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Processing Fee</span>
                  <span className="font-semibold text-navy-900">{type.processingFeePercent}%</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <DollarSign className="mx-auto text-navy-300 mb-4" size={48} />
            <p className="text-navy-600">No loan types configured</p>
            <p className="text-sm text-gray-500 mt-2">Add your first loan type to get started</p>
          </motion.div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-navy-900 mb-6">
                {editingType ? 'Edit Loan Type' : 'Add Loan Type'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="label mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    rows="2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label mb-2">Min Amount (₹)</label>
                    <input
                      type="number"
                      value={formData.minAmount}
                      onChange={(e) => setFormData({ ...formData, minAmount: Number(e.target.value) })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="label mb-2">Max Amount (₹)</label>
                    <input
                      type="number"
                      value={formData.maxAmount}
                      onChange={(e) => setFormData({ ...formData, maxAmount: Number(e.target.value) })}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label mb-2">Interest Rate (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.interestRate}
                      onChange={(e) => setFormData({ ...formData, interestRate: Number(e.target.value) })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="label mb-2">Processing Fee (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.processingFeePercent}
                      onChange={(e) => setFormData({ ...formData, processingFeePercent: Number(e.target.value) })}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label mb-2">Min Tenure (months)</label>
                    <input
                      type="number"
                      value={formData.minTenureMonths}
                      onChange={(e) => setFormData({ ...formData, minTenureMonths: Number(e.target.value) })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="label mb-2">Max Tenure (months)</label>
                    <input
                      type="number"
                      value={formData.maxTenureMonths}
                      onChange={(e) => setFormData({ ...formData, maxTenureMonths: Number(e.target.value) })}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors"
                  >
                    {editingType ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminLoanTypes;
