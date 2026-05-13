import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { request } from '../api/client';
import { Plus, Search, Edit2, Trash2, X, CheckCircle, DollarSign } from 'lucide-react';

export default function ServicesPage() {
  const queryClient = useQueryClient();
  const { data: session } = useAuth();
  const role = session?.user?.role;
  const canManage = ['admin', 'staff', 'receptionist'].includes(role);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', capacity: '' });

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['services'],
    queryFn: () => request('/api/services', { method: 'GET' }),
  });

  const createMutation = useMutation({
    mutationFn: (data) =>
      request('/api/services', {
        method: 'POST',
        body: JSON.stringify({
          ...data,
          price: parseFloat(data.price),
          capacity: parseInt(data.capacity),
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service created');
      resetForm();
    },
    onError: () => toast.error('Failed to create service'),
  });

  const updateMutation = useMutation({
    mutationFn: (data) =>
      request(`/api/services/${editingId}`, {
        method: 'PUT',
        body: JSON.stringify({
          ...data,
          price: parseFloat(data.price),
          capacity: parseInt(data.capacity),
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service updated');
      resetForm();
    },
    onError: () => toast.error('Failed to update service'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => request(`/api/services/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service deleted');
    },
    onError: () => toast.error('Failed to delete service'),
  });

  const filteredServices = useMemo(
    () =>
      services.filter(
        (s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.description.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [services, searchTerm]
  );

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', capacity: '' });
    setEditingId(null);
    setShowModal(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.capacity) {
      toast.error('Name, price, and capacity are required');
      return;
    }
    if (editingId) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const openEdit = (service) => {
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      capacity: service.capacity.toString(),
    });
    setEditingId(service._id);
    setShowModal(true);
  };

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Services</h1>
            <p className="text-slate-400">Manage offerings and pricing</p>
          </div>
          {canManage && (
            <button
              onClick={() => setShowModal(true)}
              className="glass-button px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition hover:bg-brand-500/20"
            >
              <Plus className="w-4 h-4" />
              Add Service
            </button>
          )}
        </div>
      </motion.div>

      {/* Search */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="glass-input w-full pl-10 pr-4 py-2 rounded-lg border border-white/10"
          />
        </div>
      </motion.div>

      {/* Grid of Service Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <AnimatePresence>
          {isLoading ? (
            <div className="col-span-full text-center py-8 text-slate-400">
              Loading services...
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="col-span-full text-center py-8 text-slate-400">
              {services.length === 0 ? 'No services yet' : 'No services matching search'}
            </div>
          ) : (
            filteredServices.map((service, idx) => (
              <motion.div
                key={service._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
                className="glass-panel p-6 rounded-lg border border-white/10 hover:border-brand-400/30 transition"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{service.name}</h3>
                    <p className="text-sm text-slate-700 dark:text-slate-400">{service.description}</p>
                  </div>
                  <div className="flex gap-2 ml-2">
                    {canManage && (
                      <>
                        <button
                          onClick={() => openEdit(service)}
                          className="text-blue-400 hover:text-blue-300 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(service._id)}
                          className="text-rose-400 hover:text-rose-300 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 dark:text-slate-400">Price</span>
                    <div className="flex items-center gap-1 font-semibold text-brand-400">
                      <DollarSign className="w-4 h-4" />
                      {service.price.toFixed(2)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700 dark:text-slate-400">Capacity</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{service.capacity}</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={resetForm}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-panel p-6 rounded-lg max-w-md w-full mx-4 border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">
                  {editingId ? 'Edit Service' : 'Add Service'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-slate-400 hover:text-slate-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Service Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="glass-input w-full px-4 py-2 rounded-lg border border-white/10"
                />
                <textarea
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="glass-input w-full px-4 py-2 rounded-lg border border-white/10 resize-none"
                  rows={3}
                />
                <input
                  type="number"
                  step="0.01"
                  placeholder="Price ($)"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="glass-input w-full px-4 py-2 rounded-lg border border-white/10"
                />
                <input
                  type="number"
                  placeholder="Capacity (people)"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  className="glass-input w-full px-4 py-2 rounded-lg border border-white/10"
                />
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="flex-1 glass-button px-4 py-2 rounded-lg font-medium transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    {editingId ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
