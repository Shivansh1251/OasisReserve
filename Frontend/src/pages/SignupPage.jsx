import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { signup } from '../api/auth';
import { ArrowRight, Shield, Users, Headset } from 'lucide-react';

const ROLE_DESCRIPTIONS = {
  admin: { title: 'Administrator', desc: 'Full system access, user/role management, analytics' },
  staff: { title: 'Staff', desc: 'Manage reservations, customers, services, view analytics' },
  receptionist: { title: 'Receptionist', desc: 'Create reservations, manage customer check-ins/outs' },
  customer: { title: 'Customer', desc: 'Browse services and create a guest account' },
};

const ROLE_ICONS = {
  admin: <Shield className="w-5 h-5" />,
  staff: <Users className="w-5 h-5" />,
  receptionist: <Headset className="w-5 h-5" />,
  customer: <Users className="w-5 h-5" />,
};

export default function SignupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const signupMutation = useMutation({
    mutationFn: signup,
    onSuccess: () => {
      toast.success('Signup successful! Redirecting...');
      navigate(from, { replace: true });
    },
    onError: (error) => {
      const message = error.message || 'Signup failed';
      toast.error(message);
      setErrors({ submit: message });
    },
  });

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    signupMutation.mutate(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-brand-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-brand-400 to-emerald-400 bg-clip-text text-transparent mb-2">
            OasisReserve
          </h1>
          <p className="text-slate-400">Join our hospitality platform</p>
        </motion.div>

        {/* Main Form Card */}
        <motion.div
          variants={itemVariants}
          className="glass-panel p-8 rounded-2xl border border-white/10 mb-6"
        >
          <h2 className="text-2xl font-semibold text-white mb-6">Create Account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`glass-input w-full px-4 py-2 rounded-lg border transition ${
                  errors.name
                    ? 'border-rose-500/50 bg-rose-500/5'
                    : 'border-white/10'
                }`}
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="text-rose-400 text-sm mt-1">{errors.name}</p>
              )}
            </motion.div>

            {/* Email */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`glass-input w-full px-4 py-2 rounded-lg border transition ${
                  errors.email
                    ? 'border-rose-500/50 bg-rose-500/5'
                    : 'border-white/10'
                }`}
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="text-rose-400 text-sm mt-1">{errors.email}</p>
              )}
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`glass-input w-full px-4 py-2 rounded-lg border transition ${
                    errors.password
                      ? 'border-rose-500/50 bg-rose-500/5'
                      : 'border-white/10'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 text-sm"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && (
                <p className="text-rose-400 text-sm mt-1">{errors.password}</p>
              )}
            </motion.div>

            {/* Role Selection: public signup fixed to Customer only */}
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Role
              </label>
              <div className="p-3 rounded-lg border border-white/10 bg-slate-800">
                <div className="flex items-center gap-3">
                  <div className="text-brand-400">{ROLE_ICONS['customer']}</div>
                  <div>
                    <div className="text-sm font-semibold text-slate-100">{ROLE_DESCRIPTIONS['customer'].title}</div>
                    <div className="text-xs text-slate-400">{ROLE_DESCRIPTIONS['customer'].desc}</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Error Message */}
            {errors.submit && (
              <motion.div
                variants={itemVariants}
                className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm"
              >
                {errors.submit}
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.button
              variants={itemVariants}
              type="submit"
              disabled={signupMutation.isPending}
              className="glass-button w-full py-2 px-4 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {signupMutation.isPending ? 'Creating account...' : 'Create Account'}
              {!signupMutation.isPending && <ArrowRight className="w-4 h-4" />}
            </motion.button>
          </form>
        </motion.div>

        {/* Login Link */}
        <motion.div variants={itemVariants} className="text-center">
          <p className="text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">
              Login here
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
