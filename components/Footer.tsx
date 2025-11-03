import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Facebook, Twitter, Instagram, Mail } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

  return (
    <footer className="mt-20 backdrop-blur-xl bg-white/50 dark:bg-gray-900/50 border-t border-white/20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground">O</span>
              </div>
              <span className="text-xl text-primary">
                Outfred.eg
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Fashion platform with AI-powered search and outfit generation
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4">Quick Links</h3>
            <div className="space-y-2">
              <button
                onClick={() => onNavigate('home')}
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {t('home')}
              </button>
              <button
                onClick={() => onNavigate('merchants')}
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {t('merchants')}
              </button>
              <button
                onClick={() => onNavigate('join')}
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {t('joinAsMerchant')}
              </button>
            </div>
          </div>

          {/* Info */}
          <div>
            <h3 className="mb-4">Information</h3>
            <div className="space-y-2">
              <button
                onClick={() => onNavigate('about')}
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {t('about')}
              </button>
              <button
                onClick={() => onNavigate('privacy')}
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {t('privacy')}
              </button>
              <button
                onClick={() => onNavigate('contact')}
                className="block text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {t('contact')}
              </button>
              <button
                onClick={() => onNavigate('debug')}
                className="block text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
              >
                🔧 Debug Panel
              </button>
            </div>
          </div>

          {/* Social */}
          <div>
            <h3 className="mb-4">Follow Us</h3>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/50 dark:bg-gray-800/50 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/50 dark:bg-gray-800/50 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/50 dark:bg-gray-800/50 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/50 dark:bg-gray-800/50 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition-all"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© 2025 Outfred.eg - All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
