import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Store, ExternalLink, MapPin, Globe } from 'lucide-react';
import { motion } from 'motion/react';
import { merchantsApi } from '../utils/api';
import { toast } from 'sonner@2.0.3';

interface MerchantsProps {
  onNavigate: (page: string, params?: any) => void;
}

export const Merchants: React.FC<MerchantsProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const [merchants, setMerchants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMerchants();
  }, []);

  const loadMerchants = async () => {
    setLoading(true);
    try {
      const { merchants } = await merchantsApi.list('approved');
      setMerchants(merchants);
    } catch (error) {
      console.error('Error loading merchants:', error);
      toast.error('Failed to load merchants');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <Store className="w-10 h-10 text-primary" />
            <h1 className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t('allMerchants')}
            </h1>
          </div>
          <p className="text-muted-foreground">
            Discover local fashion brands and boutiques
          </p>
        </motion.div>

        {/* Merchants Grid */}
        {merchants.length === 0 ? (
          <Card className="p-12 text-center glass-effect border-border">
            <Store className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="mb-2">No Merchants Yet</h3>
            <p className="text-muted-foreground">
              Check back soon for approved merchants
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {merchants.map((merchant, index) => (
              <motion.div
                key={merchant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden glass-effect border-border hover:shadow-xl transition-all h-full">
                  {/* Logo/Header */}
                  <div className="h-32 bg-gradient-to-br from-primary via-accent to-primary-light relative">
                    {merchant.logo ? (
                      <img
                        src={merchant.logo}
                        alt={merchant.brandName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Store className="w-12 h-12 text-primary-foreground" />
                      </div>
                    )}
                    <Badge className="absolute top-4 right-4 bg-card/90 text-primary border-primary">
                      Verified
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="mb-2">{merchant.name || merchant.brandName}</h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                      {merchant.description || 'Fashion brand offering quality products'}
                    </p>

                    <div className="space-y-2 mb-6">
                      {merchant.website && (
                        <a
                          href={merchant.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-primary hover:text-accent transition-colors"
                        >
                          <Globe className="w-4 h-4" />
                          {merchant.website.replace(/^https?:\/\//, '')}
                        </a>
                      )}
                      {merchant.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          {merchant.phone}
                        </div>
                      )}
                      {merchant.address && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          {merchant.address}
                        </div>
                      )}
                    </div>

                    <Button 
                      className="w-full gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground"
                      onClick={() => onNavigate('merchant-store', { merchantId: merchant.id })}
                    >
                      <ExternalLink className="w-4 h-4" />
                      {t('viewProducts')}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
