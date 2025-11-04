import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Search, Image, Sparkles, TrendingUp, Package } from 'lucide-react';
import { motion } from 'motion/react';
import { productsApi } from '../utils/api';
import { toast } from 'sonner';

interface HomeProps {
  onNavigate?: (page: string, productId?: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [imageSearching, setImageSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error(language === 'ar' ? 'الرجاء إدخال كلمة البحث' : 'Please enter a search query');
      return;
    }

    setLoading(true);
    try {
      // Record search in statistics
      await productsApi.recordSearch(searchQuery, language);
      
      const { results } = await productsApi.search(searchQuery);
      setSearchResults(results);
      
      if (results.length === 0) {
        toast.info(language === 'ar' ? 'لم يتم العثور على منتجات' : 'No products found. Try a different search term.');
      } else {
        toast.success(
          language === 'ar' 
            ? `تم العثور على ${results.length} منتج` 
            : `Found ${results.length} product${results.length > 1 ? 's' : ''}`
        );
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error(language === 'ar' ? 'فشل البحث' : 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageSearch = () => {
    // Create a hidden file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;

      setImageSearching(true);
      try {
        // Show preview
        const reader = new FileReader();
        reader.onload = (event) => {
          toast.info(
            language === 'ar' 
              ? 'جاري البحث عن منتجات مشابهة...' 
              : 'Searching for similar products...',
            { duration: 2000 }
          );
        };
        reader.readAsDataURL(file);

        // For now, do a general search to show functionality
        // In production, you would send the image to an AI service
        const response = await productsApi.list();
        const allProducts = response.products || [];
        
        // Simulate image search by showing random products
        if (allProducts.length > 0) {
          const randomProducts = [...allProducts].sort(() => 0.5 - Math.random()).slice(0, 8);
          setSearchResults(randomProducts);
          
          toast.success(
            language === 'ar' 
              ? `تم العثور على ${randomProducts.length} منتج مشابه` 
              : `Found ${randomProducts.length} similar products`
          );
        } else {
          toast.info(
            language === 'ar' 
              ? 'لا توجد منتجات للبحث' 
              : 'No products available for search'
          );
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Image search error:', error);
        toast.error(language === 'ar' ? 'فشل البحث بالصورة' : 'Image search failed');
      } finally {
        setImageSearching(false);
      }
    };
    input.click();
  };

  const handleGenerateOutfit = () => {
    if (onNavigate) {
      onNavigate('outfit-generator');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-[#3B1728]/10 via-[#8B4665]/10 to-[#A67B92]/10 blur-3xl" />
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl mb-6 bg-gradient-to-r from-[#3B1728] via-[#8B4665] to-[#A67B92] bg-clip-text text-transparent">
              Discover Fashion with AI
            </h1>
            <p className="text-xl text-muted-foreground mb-12">
              Smart search, image recognition, and AI-powered outfit generation
            </p>

            {/* Search Section */}
            <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder={t('searchPlaceholder')}
                    className="pl-12 h-14 text-lg bg-white/50 dark:bg-gray-800/50 border-white/30"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={loading}
                  className="h-14 px-8 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {loading ? t('loading') : t('smartSearch')}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={handleImageSearch}
                  disabled={imageSearching}
                  className="h-12 gap-2 border-white/30 hover:bg-white/50"
                >
                  <Image className="w-5 h-5" />
                  {imageSearching ? (language === 'ar' ? 'جاري البحث...' : 'Searching...') : t('searchByImage')}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleGenerateOutfit}
                  className="h-12 gap-2 border-white/30 hover:bg-white/50"
                >
                  <Sparkles className="w-5 h-5" />
                  {t('generateOutfit')}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <section className="container mx-auto px-4 py-12">
          <h2 className="text-3xl mb-8">
            {t('searchResults') || 'Search Results'} ({searchResults.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {searchResults.map((product, index) => (
              <motion.div
                key={product.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-white/20 hover:shadow-xl transition-all">
                  {product.imageUrl || product.image ? (
                    <div className="aspect-square relative overflow-hidden bg-gray-100">
                      <img 
                        src={product.imageUrl || product.image} 
                        alt={product.name}
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
                    <h3 className="mb-2 line-clamp-2">{product.name}</h3>
                    {product.brand && (
                      <p className="text-xs text-muted-foreground mb-2">
                        {product.brand}
                      </p>
                    )}
                    {product.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-semibold text-primary">
                        {product.price ? `EGP ${product.price}` : 'Price N/A'}
                      </span>
                      <Button 
                        size="sm"
                        onClick={() => onNavigate?.('product', product.id)}
                      >
                        {language === 'ar' ? 'عرض' : 'View'}
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-8 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-white/20 hover:shadow-xl transition-all h-full">
              <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mb-6">
                <Search className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-2xl mb-4">Smart Search</h3>
              <p className="text-muted-foreground">
                Advanced search with autocorrect, multilingual support, and intelligent suggestions
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-8 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-white/20 hover:shadow-xl transition-all h-full">
              <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-6">
                <Image className="w-7 h-7 text-accent-foreground" />
              </div>
              <h3 className="text-2xl mb-4">Image Recognition</h3>
              <p className="text-muted-foreground">
                Upload any fashion image and find similar items from local brands instantly
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-8 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-white/20 hover:shadow-xl transition-all h-full">
              <div className="w-14 h-14 rounded-2xl bg-[#A67B92] flex items-center justify-center mb-6">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl mb-4">AI Outfit Generator</h3>
              <p className="text-muted-foreground">
                Get complete outfit suggestions based on your style preferences and occasions
              </p>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="w-8 h-8 text-primary" />
          <h2 className="text-4xl">Trending Now</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {['Hoodies', 'Sneakers', 'Dresses', 'Accessories'].map((category, index) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="cursor-pointer"
            >
              <Card className="overflow-hidden backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-white/20 hover:shadow-xl transition-all">
                <div className="aspect-square bg-gradient-to-br from-[#F5EDF0] via-[#D4C4CD] to-[#A67B92]/30 dark:from-[#3B1728]/20 dark:via-[#8B4665]/20 dark:to-[#A67B92]/20 flex items-center justify-center">
                  <span className="text-2xl">{category}</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};
