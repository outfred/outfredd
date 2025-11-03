import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { 
  Store, MapPin, Phone, Mail, Globe, Clock, Calendar, 
  ExternalLink, Package, ArrowLeft, Eye, Instagram, Facebook
} from 'lucide-react';
import { motion } from 'motion/react';
import { merchantsApi, productsApi } from '../utils/api';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface MerchantStorePageProps {
  merchantId: string;
  onNavigate: (page: string, params?: any) => void;
}

export const MerchantStorePage: React.FC<MerchantStorePageProps> = ({ merchantId, onNavigate }) => {
  const { language } = useLanguage();
  const [merchant, setMerchant] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [showrooms, setShowrooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isRTL = language === 'ar';

  useEffect(() => {
    loadMerchantData();
    recordPageView();
  }, [merchantId]);

  const recordPageView = async () => {
    try {
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-dec0bed9/merchant-page-view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ merchantId }),
      });
    } catch (error) {
      console.error('Failed to record page view:', error);
    }
  };

  const loadMerchantData = async () => {
    try {
      setLoading(true);
      
      // Load merchant data
      const { merchants } = await merchantsApi.list();
      const foundMerchant = merchants.find((m: any) => m.id === merchantId);
      
      if (!foundMerchant) {
        toast.error(language === 'ar' ? 'المتجر غير موجود' : 'Merchant not found');
        onNavigate('merchants');
        return;
      }
      
      setMerchant(foundMerchant);
      
      // Load merchant's products - using merchant.id
      const { products: merchantProducts } = await productsApi.list(foundMerchant.id);
      setProducts(merchantProducts || []);
      
      // Load showrooms
      if (foundMerchant.showrooms) {
        setShowrooms(foundMerchant.showrooms);
      }
      
    } catch (error) {
      console.error('Error loading merchant data:', error);
      toast.error(language === 'ar' ? 'حدث خطأ في تحميل البيانات' : 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Store className="w-16 h-16 mx-auto mb-4 text-gray-400 animate-pulse" />
          <p className="text-muted-foreground">
            {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (!merchant) {
    return null;
  }

  const getProductImage = (product: any) => {
    return product.image || product.imageUrl || product.img || '';
  };

  return (
    <div className={`min-h-screen py-12 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => onNavigate('merchants')}
          className="mb-6 gap-2"
        >
          {isRTL ? (
            <>
              {language === 'ar' ? 'العودة للمتاجر' : 'Back to Merchants'}
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </>
          ) : (
            <>
              <ArrowLeft className="w-4 h-4" />
              {language === 'ar' ? 'العودة للمتاجر' : 'Back to Merchants'}
            </>
          )}
        </Button>

        {/* Store Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <Card className="overflow-hidden glass-effect border-border">
            {/* Cover Image */}
            <div className="h-48 bg-gradient-to-br from-primary via-accent to-primary-light relative">
              {merchant.coverImage ? (
                <ImageWithFallback
                  src={merchant.coverImage}
                  alt={merchant.name || merchant.brandName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Store className="w-24 h-24 text-primary-foreground opacity-50" />
                </div>
              )}
              <Badge className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} bg-card/90 text-primary border-primary`}>
                {language === 'ar' ? 'موثق' : 'Verified'}
              </Badge>
            </div>

            {/* Store Info */}
            <div className="p-8">
              <div className="flex items-start gap-6 mb-6 flex-col md:flex-row">
                {merchant.logo && (
                  <div className="w-24 h-24 rounded-lg border-4 border-background shadow-lg overflow-hidden md:-mt-16 bg-white flex-shrink-0">
                    <ImageWithFallback
                      src={merchant.logo}
                      alt={merchant.name || merchant.brandName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 w-full">
                  <h1 className="mb-3">{merchant.name || merchant.brandName}</h1>
                  <p className="text-muted-foreground mb-4">
                    {merchant.description || (language === 'ar' ? 'متجر أزياء' : 'Fashion Store')}
                  </p>

                  {/* Contact Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {merchant.website && (
                      <a
                        href={merchant.website.startsWith('http') ? merchant.website : `https://${merchant.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-primary hover:text-accent transition-colors"
                      >
                        <Globe className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{merchant.website.replace(/^https?:\/\//, '')}</span>
                      </a>
                    )}
                    {merchant.phone && (
                      <a
                        href={`tel:${merchant.phone}`}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Phone className="w-4 h-4 flex-shrink-0" />
                        <span>{merchant.phone}</span>
                      </a>
                    )}
                    {merchant.contactEmail && (
                      <a
                        href={`mailto:${merchant.contactEmail}`}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{merchant.contactEmail}</span>
                      </a>
                    )}
                    {merchant.address && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span>{merchant.address}</span>
                      </div>
                    )}
                    {merchant.workingHours && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span>{merchant.workingHours}</span>
                      </div>
                    )}
                  </div>

                  {/* Social Media Links */}
                  {(merchant.instagram || merchant.facebook) && (
                    <div className="flex gap-3 mt-4">
                      {merchant.instagram && (
                        <a
                          href={merchant.instagram.startsWith('http') ? merchant.instagram : `https://instagram.com/${merchant.instagram}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Instagram className="w-5 h-5" />
                        </a>
                      )}
                      {merchant.facebook && (
                        <a
                          href={merchant.facebook.startsWith('http') ? merchant.facebook : `https://facebook.com/${merchant.facebook}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Facebook className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Showrooms Section */}
        {showrooms && showrooms.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <h2 className="mb-6 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-primary" />
              {language === 'ar' ? 'الشورومات' : 'Showrooms'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {showrooms.map((showroom: any, index: number) => (
                <Card key={index} className="p-6 glass-effect border-border hover:shadow-lg transition-shadow">
                  <h3 className="mb-4">{showroom.name}</h3>
                  <div className="space-y-3">
                    {showroom.location && (
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{showroom.location}</span>
                      </div>
                    )}
                    {showroom.startDate && showroom.endDate && (
                      <div className="flex items-start gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">
                          {language === 'ar' ? 'من' : 'From'} {new Date(showroom.startDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                          {' '}
                          {language === 'ar' ? 'إلى' : 'to'} {new Date(showroom.endDate).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                        </span>
                      </div>
                    )}
                    {showroom.hours && (
                      <div className="flex items-start gap-2 text-sm">
                        <Clock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{showroom.hours}</span>
                      </div>
                    )}
                  </div>
                  {showroom.mapUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-4 gap-2"
                      onClick={() => window.open(showroom.mapUrl, '_blank', 'noopener,noreferrer')}
                    >
                      <ExternalLink className="w-4 h-4" />
                      {language === 'ar' ? 'عرض على الخريطة' : 'View on Map'}
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        <Separator className="my-12" />

        {/* Products Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="flex items-center gap-2">
              <Package className="w-6 h-6 text-primary" />
              {language === 'ar' ? 'المنتجات' : 'Products'}
            </h2>
            {products.length > 0 && (
              <Badge variant="secondary">
                {products.length} {language === 'ar' ? 'منتج' : 'products'}
              </Badge>
            )}
          </div>

          {products.length === 0 ? (
            <Card className="p-12 text-center glass-effect border-border">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="mb-2">{language === 'ar' ? 'لا توجد منتجات' : 'No Products'}</h3>
              <p className="text-muted-foreground">
                {language === 'ar' 
                  ? 'لم يضف هذا المتجر منتجات بعد' 
                  : 'This store hasn\'t added products yet'}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product: any) => {
                const productImage = getProductImage(product);
                
                return (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card
                      className="overflow-hidden glass-effect border-border hover:shadow-xl transition-all cursor-pointer group h-full flex flex-col"
                      onClick={() => onNavigate('product', product.id)}
                    >
                      {productImage ? (
                        <div className="aspect-square relative overflow-hidden bg-gray-100">
                          <ImageWithFallback 
                            src={productImage}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {product.stock !== undefined && product.stock <= 0 && (
                            <Badge className="absolute top-2 left-2 bg-red-500">
                              {language === 'ar' ? 'نفذت الكمية' : 'Out of Stock'}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                          <Package className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="mb-2 line-clamp-2 flex-1">{product.name}</h3>
                        {product.brand && (
                          <p className="text-xs text-muted-foreground mb-2">
                            {product.brand}
                          </p>
                        )}
                        {product.category && (
                          <Badge variant="outline" className="mb-2 w-fit">
                            {product.category}
                          </Badge>
                        )}
                        <div className="flex items-center justify-between mt-auto pt-3">
                          <span className="font-semibold text-primary">
                            {product.price ? `${product.price} ${language === 'ar' ? 'ج.م' : 'EGP'}` : (language === 'ar' ? 'السعر غير متوفر' : 'Price N/A')}
                          </span>
                          <Eye className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
