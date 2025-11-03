import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { LogIn, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner@2.0.3';

interface AuthProps {
  mode: 'login' | 'register';
  onSuccess: () => void;
}

export const Auth: React.FC<AuthProps> = ({ mode, onSuccess }) => {
  const { t } = useLanguage();
  const { login, register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (mode === 'register' && !formData.name) {
      toast.error('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        console.log('🔐 Starting login process...');
        await login(formData.email, formData.password);
        console.log('✅ Login successful');
        toast.success('Welcome back!');
      } else {
        await register(formData.email, formData.password, formData.name);
        toast.success('Account created successfully!');
      }
      onSuccess();
    } catch (error: any) {
      console.error('Auth error:', error);
      
      // Show error toast with helpful message
      const errorMessage = error.message || 'Authentication failed. Please try again.';
      toast.error(errorMessage, {
        duration: 5000,
        description: mode === 'login' 
          ? 'Having trouble? Try opening the Debug Panel from the top menu.' 
          : undefined
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12">
      <div className="container mx-auto px-4 max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-8 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-white/20">
            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
              {mode === 'login' ? (
                <LogIn className="w-8 h-8 text-white" />
              ) : (
                <UserPlus className="w-8 h-8 text-white" />
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl text-center mb-2 bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
              {mode === 'login' ? t('login') : t('register')}
            </h1>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8">
              {mode === 'login'
                ? 'Welcome back to Outfred'
                : 'Join Outfred today'}
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block mb-2">Name</label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="bg-white/50 dark:bg-gray-800/50 border-white/30"
                    placeholder="John Doe"
                  />
                </div>
              )}

              <div>
                <label className="block mb-2">Email</label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-white/50 dark:bg-gray-800/50 border-white/30"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block mb-2">Password</label>
                <Input
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="bg-white/50 dark:bg-gray-800/50 border-white/30"
                  placeholder="••••••••"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-pink-600 text-white"
              >
                {loading
                  ? t('loading')
                  : mode === 'login'
                  ? t('login')
                  : t('register')}
              </Button>
            </form>

            {/* Demo Account Info */}
            {mode === 'login' && (
              <>
                <div className="mt-6 p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800">
                  <p className="text-sm text-indigo-900 dark:text-indigo-100 mb-2">
                    <strong>Demo Admin Account:</strong>
                  </p>
                  <p className="text-xs text-indigo-700 dark:text-indigo-300">
                    Email: admin@outfred.com
                    <br />
                    Password: admin123
                  </p>
                </div>
                
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Having trouble logging in?{' '}
                    <a 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.hash = 'debug';
                        window.location.reload();
                      }}
                      className="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 underline"
                    >
                      Open Debug Panel
                    </a>
                  </p>
                </div>
              </>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
