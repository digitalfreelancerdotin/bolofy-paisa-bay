import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Hourglass, Loader2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { authUtils } from '../utils/auth';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: 'test@example.com',
    password: '123456',
    rememberMe: true,
    userType: 'customer'  // Add this default value
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    if (!formData.userType) {
      newErrors.userType = 'Please select a user type';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // In LoginPage.js
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  setIsLoading(true);
  const loadingToast = toast.loading('Logging in...');

  try {
    const { token, user } = await authUtils.login(formData.email, formData.password);
    
    if (formData.rememberMe) {
      localStorage.setItem('authToken', token);
    } else {
      sessionStorage.setItem('authToken', token);
    }
    
    localStorage.setItem('currentUser', JSON.stringify(user));

    toast.dismiss(loadingToast);
    toast.success('Login successful!');
    
    // Navigate back to previous page or chat
    navigate(-1, { fallback: '/chat' });
  } catch (error) {
    toast.dismiss(loadingToast);
    toast.error(error.message);
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
       
        className="w-full max-w-md"
      >
       

        <div className="bg-black/50 backdrop-blur-md rounded-2xl p-7 shadow-xl border border-amber-500/20">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/chat')}
          className=" text-amber-200/80 hover:text-amber-200 flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          <span>Back to Chat</span>
        </motion.button>
          <div className="text-center mb-8">
            <Hourglass className="w-12 h-12 mx-auto mb-4 text-amber-400" />
            <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-amber-200/80">Log in to your account</p>
          </div>



          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-amber-200/80 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full px-4 py-3 bg-black/50 border ${
                  errors.email ? 'border-red-500' : 'border-amber-500/20'
                } rounded-lg text-white placeholder-amber-200/50 focus:outline-none focus:border-amber-500/40`}
                placeholder="Enter your email"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-200/80 mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full px-4 py-3 bg-black/50 border ${
                  errors.password ? 'border-red-500' : 'border-amber-500/20'
                } rounded-lg text-white placeholder-amber-200/50 focus:outline-none focus:border-amber-500/40`}
                placeholder="Enter your password"
                disabled={isLoading}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="mb-8">
  <label className="block text-sm font-medium text-amber-200/80 mb-3">
    I am a...
  </label>
  <div className="grid grid-cols-3 gap-3">
    {[
      { id: 'customer', label: 'Customer', icon: '👤' },
      { id: 'agent', label: 'Agent', icon: '💼' },
      { id: 'influencer', label: 'Influencer', icon: '⭐' }
    ].map(({ id, label, icon }) => (
      <motion.div
        key={id}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input
          type="radio"
          id={id}
          name="userType"
          value={id}
          className="hidden peer"
          checked={formData.userType === id}
          onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
          disabled={isLoading}
        />
        <label
          htmlFor={id}
          className="flex flex-col items-center justify-center p-4 bg-black/30 border-2 
          border-amber-500/20 rounded-xl cursor-pointer transition-all duration-200
          peer-checked:border-amber-500 peer-checked:bg-amber-500/10
          hover:border-amber-500/40 hover:bg-amber-500/5"
        >
          <span className="text-2xl mb-2">{icon}</span>
          <span className="text-sm font-medium text-amber-200/80 peer-checked:text-amber-200">
            {label}
          </span>
        </label>
      </motion.div>
    ))}
  </div>
</div>

<div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={formData.rememberMe}
                onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                className="rounded border-amber-500/20 text-amber-500 focus:ring-amber-500"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-amber-200/80">
                Remember me
              </label>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold 
              rounded-lg hover:from-amber-400 hover:to-yellow-400 transition-all duration-200 
              shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Log In</span>
              )}
            </motion.button>

           
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;