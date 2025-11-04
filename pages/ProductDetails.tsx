import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { ArrowLeft, Package, Store, Heart, Share2, ShoppingCart } from 'lucide-react';
import { motion } from 'motion/react';
import { productsApi, merchantsApi } from '../utils/api';
import { toast } from 'sonner';

interface ProductDetailsProps {
  productId: string;
  onNavigate: (page: string) => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ productId, onNavigate }) => {
  const { t, language } = useLanguage();
  const [product, setProduct] = useState<any>(null);
  const [merchant, setMerchant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  useEffect(() => {
    loadProduct();
  }, [productId]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      
      // Get all products and find the specific one
      const { products } = await productsApi.list();
      const foundProduct = products.find((p: any) => p.id === productId);
      
      if (!foundProduct) {
        toast.error(language === 'ar' ? 'المنتج غير موجود' : 'Product not found');
        onNavigate('home');
        return;
      }
      
      setProduct(foundProduct);
      
      // Load merchant data
      if (foundProduct.merchantId) {
        try {
          const { merchants } = await merchantsApi.list();
          const foundMerchant = merchants.find((m: any) => m.id === foundProduct.merchantId);
          if (foundMerchant) {
            setMerchant(foundMerchant);
          }
        } catch (err) {
          console.error('Error loading merchant:', err);
        }
      }
      
      // Record product view
      await productsApi.recordView(productId);
      
      // Get related products (same category or merchant)
      const related = products
        .filter((p: any) => 
          p.id !== productId && 
          (p.category === foundProduct.category || p.merchantId === foundProduct.merchantId)
        )
        .slice(0, 4);
      setRelatedProducts(related);
      
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error(language === 'ar' ? 'حدث خطأ في تحميل المنتج' : 'Error loading product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    // Open product in original store website
    const url = product.productUrl || product.originalUrl || product.url;
    
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      toast.success(
        language === 'ar' 
          ? 'يتم فتح المنتج في موقع المتجر...' 
          : 'Opening product in store website...'
      );
    } else {
      // Try to construct URL from merchant website
      if (merchant?.website) {
        window.open(merchant.website, '_blank', 'noopener,noreferrer');
        toast.info(
          language === 'ar' 
            ? 'لم يتم العثور على رابط المنتج، يتم فتح موقع المتجر...' 
            : 'Product link not found, opening store website...'
        );
      } else {
        toast.warning(
          language === 'ar' 
            ? 'رابط المنتج غير متوفر حالياً. يرجى التواصل مع المتجر مباشرة.' 
            : 'Product link not available. Please contact the store directly.',
          { duration: 4000 }
        );
      }
    }
  };

  const handleAddToFavorites = () => {
    toast.success(
      language === 'ar' 
        ? 'تم إضافة المنتج إلى المفضلة' 
        : 'Product added to favorites',
      { description: product.name }
    );
  };

  const handleShare = async () => {
    try {
      // Check if Web Share API is available and supported
      if (navigator.share && navigator.canShare) {
        const shareData = {
          title: product.name,
          text: product.description || product.name,
          url: window.location.href,
        };
        
        // Check if the data can be shared
        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          toast.success(language === 'ar' ? 'تم المشاركة بنجاح' : 'Shared successfully');
          return;
        }
      }
      
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href);
      toast.success(
        language === 'ar' ? 'تم نسخ رابط المنتج' : 'Product link copied to clipboard',
        { 
          description: language === 'ar' ? 'يمكنك مشاركته الآن' : 'You can now share it',
          duration: 3000 
        }
      );
    } catch (error: any) {
      console.error('Error sharing:', error);
      
      // If clipboard also fails, show manual copy option
      if (error.name === 'NotAllowedError' || error.name === 'SecurityError') {
        toast.info(
          language === 'ar' 
            ? 'لنسخ الرابط، استخدم Ctrl+C أو انقر بزر الماوس الأيمن' 
            : 'To copy the link, use Ctrl+C or right-click',
          { duration: 4000 }
        );
      } else {
        // Try one more time with just the URL
        try {
          await navigator.clipboard.writeText(window.location.href);
          toast.success(language === 'ar' ? 'تم نسخ الرابط' : 'Link copied');
        } catch {
          toast.error(
            language === 'ar' 
              ? 'تعذر المشاركة. يرجى نسخ الرابط يدوياً' 
              : 'Could not share. Please copy the link manually'
          );
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-400 animate-pulse" />
          <p className="text-muted-foreground">
            {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => onNavigate('home')}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {language === 'ar' ? 'العودة' : 'Back'}
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="overflow-hidden backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-white/20">
              {product.imageUrl || product.image ? (
                <div className="aspect-square relative overflow-hidden bg-gray-100">
                  <img 
                    src={product.imageUrl || product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800';
                    }}
                  />
                </div>
              ) : (
                <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                  <Package className="w-24 h-24 text-gray-400" />
                </div>
              )}
            </Card>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div>
              {product.category && (
                <Badge className="mb-3">{product.category}</Badge>
              )}
              <h1 className="text-4xl mb-4">{product.name}</h1>
              {product.brand && (
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                  <Store className="w-4 h-4" />
                  <span>{product.brand}</span>
                </div>
              )}
            </div>

            <Separator />

            <div>
              <p className="text-5xl bg-gradient-to-r from-[#3B1728] via-[#8B4665] to-[#A67B92] bg-clip-text text-transparent">
                {product.price ? `EGP ${product.price}` : language === 'ar' ? 'السعر غير متوفر' : 'Price N/A'}
              </p>
            </div>

            <Separator />

            {product.description && (
              <div>
                <h2 className="text-xl mb-3">
                  {language === 'ar' ? 'الوصف' : 'Description'}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            <Separator />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleAddToCart}
                size="lg"
                className="flex-1 gap-2"
              >
                <ShoppingCart className="w-5 h-5" />
                {language === 'ar' ? 'استمر في موقع المتجر' : 'Continue to Store'}
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={handleAddToFavorites}
                className="gap-2"
              >
                <Heart className="w-5 h-5" />
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                onClick={handleShare}
                className="gap-2"
              >
                <Share2 className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h2 className="text-3xl mb-6">
              {language === 'ar' ? 'منتجات مشابهة' : 'Related Products'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Card
                  key={relatedProduct.id}
                  className="overflow-hidden backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-white/20 hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    // Navigate to product details page
                    onNavigate('product', { productId: relatedProduct.id });
                  }}
                >
                  {relatedProduct.imageUrl || relatedProduct.image ? (
                    <div className="aspect-square relative overflow-hidden bg-gray-100">
                      <img 
                        src={relatedProduct.imageUrl || relatedProduct.image} 
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                      <Package className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="mb-2 line-clamp-2">{relatedProduct.name}</h3>
                    {relatedProduct.brand && (
                      <p className="text-xs text-muted-foreground mb-2">
                        {relatedProduct.brand}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-semibold text-primary">
                        {relatedProduct.price ? `EGP ${relatedProduct.price}` : 'Price N/A'}
                      </span>
                      <Button size="sm">
                        {language === 'ar' ? 'عرض' : 'View'}
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
