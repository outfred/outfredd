import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Globe, Menu, X, User, LogOut, ShieldCheck, Store, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import defaultLogo from '../assets/dc93d49ca6f110dfea003149eea06295a54cf5b2.png';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
  const { language, toggleLanguage, t } = useLanguage();
  const { user, logout, isAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logo, setLogo] = useState(defaultLogo);

  useEffect(() => {
    const updateLogo = () => {
      try {
        const settings = localStorage.getItem('admin_site_settings');
        if (settings) {
          const parsed = JSON.parse(settings);
          if (parsed.branding?.logo) {
            setLogo(parsed.branding.logo);
          } else {
            setLogo(defaultLogo);
          }
        }
      } catch (error) {
        console.error('Error loading logo:', error);
        setLogo(defaultLogo);
      }
    };

    updateLogo();
    
    window.addEventListener('storage', updateLogo);
    const interval = setInterval(updateLogo, 1000);
    
    return () => {
      window.removeEventListener('storage', updateLogo);
      clearInterval(interval);
    };
  }, []);

  const navItems = [
    { key: 'home', label: t('home') },
    { key: 'merchants', label: t('merchants') },
    { key: 'pricing', label: language === 'ar' ? '💎 الباقات' : '💎 Pricing' },
    ...(user ? [{ key: 'account', label: t('account') }] : []),
    ...(user && user.role === 'merchant' ? [{ key: 'my-store', label: language === 'ar' ? '🏪 متجري' : '🏪 My Store' }] : []),
    // Only show "Join as Merchant" if user is not already a merchant
    ...(user?.role !== 'merchant' ? [{ key: 'join', label: t('joinAsMerchant') }] : []),
    ...(user && (isAdmin || user.role === 'merchant') ? [{ key: 'import', label: language === 'ar' ? '🔌 استيراد' : '🔌 Import' }] : []),
    ...(process.env.NODE_ENV === 'development' || isAdmin ? [{ key: 'debug', label: '🔧 Debug' }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            <img src={logo} alt="Outfred Logo" className="h-8 w-auto" />
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  currentPage === item.key
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-primary/5 text-foreground'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="gap-2"
            >
              <Globe className="w-4 h-4" />
              {language === 'ar' ? 'EN' : 'ع'}
            </Button>

            {/* User Menu */}
            {user ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onNavigate('admin')}
                    className="gap-2 hidden md:flex"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    {t('adminPanel')}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate('notifications')}
                  className="gap-2 relative"
                  title={language === 'ar' ? 'الإشعارات' : 'Notifications'}
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="gap-2 hidden md:flex"
                >
                  <LogOut className="w-4 h-4" />
                  {t('logout')}
                </Button>
                <button 
                  className="w-8 h-8 rounded-full bg-primary flex items-center justify-center hover:ring-2 hover:ring-primary/50 transition-all cursor-pointer"
                  onClick={() => onNavigate('account')}
                  title={t('account')}
                >
                  <User className="w-4 h-4 text-primary-foreground" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate('login')}
                >
                  {t('login')}
                </Button>
                <Button
                  size="sm"
                  onClick={() => onNavigate('register')}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {t('register')}
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pb-4 space-y-2"
            >
              {navItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    onNavigate(item.key);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full px-4 py-3 rounded-lg text-left transition-all ${
                    currentPage === item.key
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-primary/5'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              
              {user ? (
                <>
                  {isAdmin && (
                    <button
                      onClick={() => {
                        onNavigate('admin');
                        setMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 rounded-lg text-left hover:bg-primary/5 flex items-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      {t('adminPanel')}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 rounded-lg text-left hover:bg-primary/5 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('logout')}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      onNavigate('login');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 rounded-lg text-left hover:bg-primary/5"
                  >
                    {t('login')}
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('register');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 rounded-lg bg-primary text-primary-foreground"
                  >
                    {t('register')}
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
