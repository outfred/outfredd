import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Slider } from '../components/ui/slider';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { 
  Sparkles, Wand2, TrendingUp, Heart, ShoppingCart, 
  ArrowLeft, Settings, Palette, Users, Clock, Sun,
  Shirt, User, ArrowUpDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { productsApi } from '../utils/api';
import { toast } from 'sonner@2.0.3';

interface OutfitGeneratorProps {
  onNavigate: (page: string, params?: any) => void;
}

export const OutfitGenerator: React.FC<OutfitGeneratorProps> = ({ onNavigate }) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const isRTL = language === 'ar';

  // Form States
  const [gender, setGender] = useState<'male' | 'female' | 'unisex'>('male');
  const [occasion, setOccasion] = useState('casual');
  const [style, setStyle] = useState('modern');
  const [season, setSeason] = useState('summer');
  const [heightCm, setHeightCm] = useState<number>(170);
  const [colorPreference, setColorPreference] = useState('any');
  const [budget, setBudget] = useState('medium');
  
  // Results
  const [generatedOutfit, setGeneratedOutfit] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    
    try {
      // Show loading message
      toast.info(
        isRTL 
          ? 'جاري توليد اللوك المناسب ليك...' 
          : 'Generating your perfect outfit...',
        { duration: 2000 }
      );

      // Get all products
      const { products } = await productsApi.list();
      
      if (!products || products.length === 0) {
        toast.error(
          isRTL 
            ? 'مفيش منتجات متاحة حالياً' 
            : 'No products available currently'
        );
        setLoading(false);
        return;
      }

      // Simulate AI outfit generation
      // In production, this would call an AI API
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Filter products based on preferences (basic filtering)
      let filteredProducts = [...products].filter(p => p.status === 'active');
      
      // Randomly select outfit items
      const categories = {
        top: ['Shirt', 'T-Shirt', 'Blouse', 'Top'],
        bottom: ['Pants', 'Jeans', 'Skirt', 'Shorts'],
        shoes: ['Shoes', 'Sneakers', 'Boots', 'Heels'],
        accessories: ['Bag', 'Watch', 'Jewelry', 'Accessories']
      };

      const outfit = {
        top: filteredProducts.find(p => 
          categories.top.some(cat => p.category?.includes(cat) || p.name?.toLowerCase().includes(cat.toLowerCase()))
        ),
        bottom: filteredProducts.find(p => 
          categories.bottom.some(cat => p.category?.includes(cat) || p.name?.toLowerCase().includes(cat.toLowerCase()))
        ),
        shoes: filteredProducts.find(p => 
          categories.shoes.some(cat => p.category?.includes(cat) || p.name?.toLowerCase().includes(cat.toLowerCase()))
        ),
        accessories: filteredProducts.find(p => 
          categories.accessories.some(cat => p.category?.includes(cat) || p.name?.toLowerCase().includes(cat.toLowerCase()))
        ),
      };

      // Fill missing items with random products
      if (!outfit.top && filteredProducts.length > 0) outfit.top = filteredProducts[Math.floor(Math.random() * filteredProducts.length)];
      if (!outfit.bottom && filteredProducts.length > 1) outfit.bottom = filteredProducts[Math.floor(Math.random() * filteredProducts.length)];
      if (!outfit.shoes && filteredProducts.length > 2) outfit.shoes = filteredProducts[Math.floor(Math.random() * filteredProducts.length)];
      if (!outfit.accessories && filteredProducts.length > 3) outfit.accessories = filteredProducts[Math.floor(Math.random() * filteredProducts.length)];

      setGeneratedOutfit({
        items: [outfit.top, outfit.bottom, outfit.shoes, outfit.accessories].filter(Boolean),
        totalPrice: [outfit.top, outfit.bottom, outfit.shoes, outfit.accessories]
          .filter(Boolean)
          .reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0),
        style: style,
        occasion: occasion,
        heightSuitability: heightCm >= 160 && heightCm <= 180 ? 'perfect' : 'good',
      });

      toast.success(
        isRTL 
          ? 'اتكون اللوك الكامل! شوف النتيجة تحت' 
          : 'Outfit generated! Check the results below'
      );

    } catch (error) {
      console.error('Error generating outfit:', error);
      toast.error(
        isRTL 
          ? 'في مشكلة في توليد اللوك. جرب تاني' 
          : 'Error generating outfit. Please try again'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFavorite = () => {
    toast.success(
      isRTL 
        ? 'اتحفظ اللوك في المفضلة' 
        : 'Outfit saved to favorites'
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background py-12" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => onNavigate('home')}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {isRTL ? 'رجوع' : 'Back'}
          </Button>

          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                {isRTL ? 'كوّن لوك كامل بالذكاء الاصطناعي' : 'AI Outfit Generator'}
              </h1>
              <p className="text-muted-foreground">
                {isRTL 
                  ? 'خلي الذكاء الاصطناعي يختارلك اللوك المناسب حسب ذوقك ومقاسك' 
                  : 'Let AI create the perfect outfit based on your preferences and measurements'}
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="p-6 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-white/20 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <Settings className="w-5 h-5 text-purple-500" />
                <h2 className="text-xl">{isRTL ? 'اختياراتك' : 'Your Preferences'}</h2>
              </div>

              <div className="space-y-6">
                {/* Gender */}
                <div>
                  <Label className="mb-2 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {isRTL ? 'النوع' : 'Gender'}
                  </Label>
                  <Select value={gender} onValueChange={(value: any) => setGender(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">{isRTL ? 'رجالي' : 'Male'}</SelectItem>
                      <SelectItem value="female">{isRTL ? 'حريمي' : 'Female'}</SelectItem>
                      <SelectItem value="unisex">{isRTL ? 'يونيسكس' : 'Unisex'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Occasion */}
                <div>
                  <Label className="mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {isRTL ? 'المناسبة' : 'Occasion'}
                  </Label>
                  <Select value={occasion} onValueChange={setOccasion}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casual">{isRTL ? 'كاجوال' : 'Casual'}</SelectItem>
                      <SelectItem value="formal">{isRTL ? 'رسمي' : 'Formal'}</SelectItem>
                      <SelectItem value="party">{isRTL ? 'حفلة' : 'Party'}</SelectItem>
                      <SelectItem value="sport">{isRTL ? 'رياضة' : 'Sport'}</SelectItem>
                      <SelectItem value="beach">{isRTL ? 'بحر' : 'Beach'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Style */}
                <div>
                  <Label className="mb-2 flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    {isRTL ? 'الستايل' : 'Style'}
                  </Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="modern">{isRTL ? 'مودرن' : 'Modern'}</SelectItem>
                      <SelectItem value="classic">{isRTL ? 'كلاسيك' : 'Classic'}</SelectItem>
                      <SelectItem value="streetwear">{isRTL ? 'ستريت وير' : 'Streetwear'}</SelectItem>
                      <SelectItem value="vintage">{isRTL ? 'فينتج' : 'Vintage'}</SelectItem>
                      <SelectItem value="minimalist">{isRTL ? 'مينيمال' : 'Minimalist'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Season */}
                <div>
                  <Label className="mb-2 flex items-center gap-2">
                    <Sun className="w-4 h-4" />
                    {isRTL ? 'الموسم' : 'Season'}
                  </Label>
                  <Select value={season} onValueChange={setSeason}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="summer">{isRTL ? 'صيف' : 'Summer'}</SelectItem>
                      <SelectItem value="winter">{isRTL ? 'شتا' : 'Winter'}</SelectItem>
                      <SelectItem value="spring">{isRTL ? 'ربيع' : 'Spring'}</SelectItem>
                      <SelectItem value="autumn">{isRTL ? 'خريف' : 'Autumn'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                {/* Height Selector */}
                <div>
                  <Label className="mb-3 flex items-center gap-2">
                    <ArrowUpDown className="w-4 h-4" />
                    {isRTL ? `الطول: ${heightCm} سم` : `Height: ${heightCm} cm`}
                  </Label>
                  <Slider
                    value={[heightCm]}
                    onValueChange={(values) => setHeightCm(values[0])}
                    min={140}
                    max={210}
                    step={1}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>140 {isRTL ? 'سم' : 'cm'}</span>
                    <span>210 {isRTL ? 'سم' : 'cm'}</span>
                  </div>
                  {heightCm >= 160 && heightCm <= 180 && (
                    <Badge variant="outline" className="mt-2 text-green-500 border-green-500">
                      {isRTL ? '✓ مقاس مثالي' : '✓ Perfect range'}
                    </Badge>
                  )}
                </div>

                <Separator />

                {/* Color Preference */}
                <div>
                  <Label className="mb-2">
                    {isRTL ? 'اللون المفضل' : 'Color Preference'}
                  </Label>
                  <Select value={colorPreference} onValueChange={setColorPreference}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">{isRTL ? 'أي لون' : 'Any Color'}</SelectItem>
                      <SelectItem value="neutral">{isRTL ? 'ألوان محايدة' : 'Neutral'}</SelectItem>
                      <SelectItem value="bright">{isRTL ? 'ألوان زاهية' : 'Bright'}</SelectItem>
                      <SelectItem value="dark">{isRTL ? 'ألوان غامقة' : 'Dark'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Budget */}
                <div>
                  <Label className="mb-2">
                    {isRTL ? 'الميزانية' : 'Budget'}
                  </Label>
                  <Select value={budget} onValueChange={setBudget}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">{isRTL ? 'اقتصادي' : 'Budget'}</SelectItem>
                      <SelectItem value="medium">{isRTL ? 'متوسط' : 'Medium'}</SelectItem>
                      <SelectItem value="high">{isRTL ? 'فاخر' : 'Premium'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white gap-2 shadow-lg"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Wand2 className="w-5 h-5 animate-spin" />
                      {isRTL ? 'بيحضّر اللوك...' : 'Generating...'}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      {isRTL ? 'كوّن لوك كامل' : 'Generate Outfit'}
                    </>
                  )}
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Results Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            {!generatedOutfit && !loading && (
              <Card className="p-12 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-white/20 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 flex items-center justify-center">
                    <Shirt className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl mb-3">
                    {isRTL ? 'جاهز تكوّن لوكك؟' : 'Ready to create your outfit?'}
                  </h3>
                  <p className="text-muted-foreground">
                    {isRTL 
                      ? 'اختار التفضيلات بتاعتك على الشمال وبعدين اضغط "كوّن لوك كامل" عشان الذكاء الاصطناعي يقترحلك أحسن تنسيق'
                      : 'Select your preferences on the left and click "Generate Outfit" to let AI suggest the perfect combination for you'}
                  </p>
                </div>
              </Card>
            )}

            {loading && (
              <Card className="p-12 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-white/20 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 flex items-center justify-center animate-pulse">
                    <Wand2 className="w-12 h-12 text-white animate-spin" />
                  </div>
                  <h3 className="text-2xl mb-3">
                    {isRTL ? 'الذكاء الاصطناعي بيشتغل...' : 'AI is working its magic...'}
                  </h3>
                  <p className="text-muted-foreground">
                    {isRTL 
                      ? 'استنى شوية، بنحضرلك أحلى تنسيق يناسب ذوقك ومقاسك'
                      : 'Please wait while we create the perfect outfit for you'}
                  </p>
                </div>
              </Card>
            )}

            <AnimatePresence>
              {generatedOutfit && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Summary Card */}
                  <Card className="p-6 backdrop-blur-xl bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-purple-600/10 border-purple-500/20">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h2 className="text-2xl mb-2">
                          {isRTL ? 'لوكك الجديد جاهز! ✨' : 'Your Perfect Outfit! ✨'}
                        </h2>
                        <p className="text-muted-foreground">
                          {isRTL 
                            ? `${generatedOutfit.items.length} قطعة متناسقة تماماً`
                            : `${generatedOutfit.items.length} perfectly matched items`}
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="text-sm text-muted-foreground mb-1">
                          {isRTL ? 'إجمالي السعر' : 'Total Price'}
                        </p>
                        <p className="text-3xl bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                          {generatedOutfit.totalPrice.toFixed(2)} {isRTL ? 'ج.م' : 'EGP'}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <Badge className="bg-purple-500/20 text-purple-700 dark:text-purple-300">
                        {occasion}
                      </Badge>
                      <Badge className="bg-pink-500/20 text-pink-700 dark:text-pink-300">
                        {style}
                      </Badge>
                      <Badge className="bg-purple-500/20 text-purple-700 dark:text-purple-300">
                        {season}
                      </Badge>
                      <Badge className="bg-green-500/20 text-green-700 dark:text-green-300">
                        {isRTL ? `مناسب للطول ${heightCm} سم` : `Fits ${heightCm} cm`}
                      </Badge>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <Button
                        onClick={handleSaveFavorite}
                        variant="outline"
                        className="gap-2 flex-1"
                      >
                        <Heart className="w-4 h-4" />
                        {isRTL ? 'احفظ في المفضلة' : 'Save to Favorites'}
                      </Button>
                      <Button
                        onClick={handleGenerate}
                        variant="outline"
                        className="gap-2"
                      >
                        <Wand2 className="w-4 h-4" />
                        {isRTL ? 'جرب تاني' : 'Try Again'}
                      </Button>
                    </div>
                  </Card>

                  {/* Outfit Items */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {generatedOutfit.items.map((item: any, index: number) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="overflow-hidden backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-white/20 hover:shadow-xl transition-all group cursor-pointer">
                          {item.imageUrl || item.image ? (
                            <div className="aspect-square relative overflow-hidden bg-gray-100">
                              <img 
                                src={item.imageUrl || item.image} 
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                onError={(e) => {
                                  e.currentTarget.src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600';
                                }}
                              />
                              <div className="absolute top-3 right-3">
                                <Badge className="bg-white/90 dark:bg-gray-900/90">
                                  {item.category || (isRTL ? 'منتج' : 'Item')}
                                </Badge>
                              </div>
                            </div>
                          ) : (
                            <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                              <Shirt className="w-24 h-24 text-gray-400" />
                            </div>
                          )}
                          <div className="p-4">
                            <h3 className="mb-2 line-clamp-2">{item.name}</h3>
                            {item.brand && (
                              <p className="text-xs text-muted-foreground mb-2">
                                {item.brand}
                              </p>
                            )}
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-xl font-semibold text-purple-600 dark:text-purple-400">
                                {item.price ? `${parseFloat(item.price).toFixed(2)} ${isRTL ? 'ج.م' : 'EGP'}` : 'N/A'}
                              </span>
                              <Button 
                                size="sm"
                                onClick={() => onNavigate('product', { productId: item.id })}
                                className="gap-2"
                              >
                                {isRTL ? 'شوف التفاصيل' : 'View Details'}
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
