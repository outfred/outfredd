import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../utils/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'merchant' | 'admin';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          const { user } = await authApi.getCurrentUser();
          setUser(user);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('accessToken');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Attempting login for:', email);
      const response = await authApi.login({ email, password });
      console.log('📥 Login response:', response);
      
      const { accessToken, user } = response;
      
      if (!accessToken) {
        console.error('❌ No access token in response');
        throw new Error('No access token received from server');
      }
      
      console.log('💾 Storing access token');
      localStorage.setItem('accessToken', accessToken);
      
      console.log('✅ User logged in:', user);
      setUser(user);
    } catch (error: any) {
      console.error('❌ Login failed:', error);
      // Provide more detailed error messages
      if (error.message.includes('credentials')) {
        throw new Error('Invalid email or password. Please check your credentials and try again.');
      } else if (error.message.includes('network') || error.message.includes('fetch')) {
        throw new Error('Network error. Please check your internet connection and try again.');
      } else {
        throw new Error(error.message || 'Login failed. Please try again later.');
      }
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const response = await authApi.register({ email, password, name });
      
      const { generateVerificationCode, sendEmail, emailTemplates } = await import('../utils/emailTemplates');
      const { notificationService } = await import('../utils/notificationService');
      const verificationCode = generateVerificationCode();
      
      localStorage.setItem(`verification_code_${email}`, JSON.stringify({
        code: verificationCode,
        timestamp: Date.now(),
        expires: Date.now() + 10 * 60 * 1000,
        userId: response.user?.id
      }));

      const currentLang = (localStorage.getItem('language') || 'ar') as 'ar' | 'en';
      const welcomeTemplate = emailTemplates.welcome(name, currentLang);
      const verifyTemplate = emailTemplates.verification(name, verificationCode, currentLang);
      
      await sendEmail(email, welcomeTemplate.subject, welcomeTemplate.body);
      await sendEmail(email, verifyTemplate.subject, verifyTemplate.body);
      
      console.log('📧 Welcome & verification emails sent (code:', verificationCode, ')');
      
      await login(email, password);
      
      if (response.user?.id) {
        notificationService.sendWelcomeNotification(response.user.id, name, currentLang);
        notificationService.sendVerificationNotification(response.user.id, currentLang, verificationCode);
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated,
      isAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
