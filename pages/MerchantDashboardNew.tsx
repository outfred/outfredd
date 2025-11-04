import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import {
  Store, Package, TrendingUp, Eye, DollarSign, Plus, Settings, BarChart3
} from 'lucide-react';
import { motion } from 'motion/react';
import { merchantsApi, productsApi } from '../utils/api';
import { toast } from 'sonner';
import svgPaths from '../imports/svg-a6k9z8xwa4';

interface MerchantDashboardNewProps {
  onNavigate: (page: string) => void;
}

export const MerchantDashboardNew: React.FC<MerchantDashboardNewProps> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [merchantData, setMerchantData] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalViews: 0,
    totalSales: 0,
    revenue: 0,
  });
  const [topProducts, setTopProducts] = useState<any[]>([]);

  useEffect(() => {
    if (user?.role === 'merchant') {
      loadMerchantData();
      loadProducts();
    }
  }, [user]);

  const loadMerchantData = async () => {
    try {
      setLoading(true);
      const response = await merchantsApi.list();
      const merchant = response.merchants?.find((m: any) => 
        m.contactEmail === user?.email || m.userId === user?.id
      );
      
      if (merchant) {
        setMerchantData(merchant);
        loadPageViewStats(merchant.id);
      }
    } catch (error) {
      console.error('Failed to load merchant data:', error);
      toast.error(language === 'ar' ? 'فشل تحميل بيانات المتجر' : 'Failed to load store data');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productsApi.list(user?.id);
      setProducts(response.products || []);
      setStats(prev => ({
        ...prev,
        totalProducts: response.products?.length || 0,
      }));
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const loadPageViewStats = async (merchantId: string) => {
    try {
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      const token = localStorage.getItem('outfred_token');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-dec0bed9/merchant-stats/${merchantId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'X-Access-Token': token || '',
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        const pageViews = data.totalPageViews ?? 0;
        const productViews = data.totalProductViews ?? 0;
        
        setStats(prev => ({
          ...prev,
          totalViews: pageViews + productViews,
          totalSales: Math.floor(productViews * 0.15),
          revenue: Math.floor(productViews * 164),
        }));
        setTopProducts(data.topProducts || []);
      }
    } catch (error) {
      console.error('Failed to load merchant stats:', error);
    }
  };

  if (!user || user.role !== 'merchant') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-12 text-center">
          <Store className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="mb-2">{language === 'ar' ? 'غير مصرح' : 'Unauthorized'}</h3>
          <p className="text-muted-foreground mb-6">
            {language === 'ar' ? 'هذه الصفحة متاحة للتجار فقط' : 'This page is only for merchants'}
          </p>
          <Button onClick={() => onNavigate('home')}>
            {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#F5F5F7]">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
        {/* Logo/Brand */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3B1728] to-[#8B4665] flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {merchantData?.brandName?.substring(0, 2).toUpperCase() || 'US'}
              </span>
            </div>
            <div>
              <div className="font-semibold text-gray-900">{merchantData?.brandName || 'Urban Style'}</div>
              <div className="text-xs text-gray-500">{language === 'ar' ? 'تاجر' : 'Merchant'}</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'overview'
                ? 'bg-[#CFD0D2] text-gray-900'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            {language === 'ar' ? 'نظرة عامة' : 'Dashboard'}
          </button>
          
          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'products'
                ? 'bg-[#CFD0D2] text-gray-900'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Package className="w-4 h-4" />
            {language === 'ar' ? 'المنتجات' : 'Products'}
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'analytics'
                ? 'bg-[#CFD0D2] text-gray-900'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            {language === 'ar' ? 'التحليلات' : 'Analytics'}
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'settings'
                ? 'bg-[#CFD0D2] text-gray-900'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Settings className="w-4 h-4" />
            {language === 'ar' ? 'الإعدادات' : 'Settings'}
          </button>
        </nav>

        {/* Premium Card */}
        <div className="p-4 border-t border-gray-200">
          <Card className="p-4 bg-gradient-to-br from-[#3B1728] to-[#8B4665] border-0">
            <h3 className="text-white font-medium mb-2">{language === 'ar' ? 'اشترك الآن' : 'Go Premium'}</h3>
            <p className="text-white/80 text-sm mb-4">
              {language === 'ar' ? 'احصل على تحليلات متقدمة والمزيد' : 'Get advanced analytics & more'}
            </p>
            <Button 
              size="sm" 
              className="w-full bg-white text-[#3B1728] hover:bg-gray-100"
            >
              {language === 'ar' ? 'ترقية الآن' : 'Upgrade Now'}
            </Button>
          </Card>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 mb-2">
                {language === 'ar' ? 'لوحة تحكم التاجر' : 'Merchant Dashboard'}
              </h1>
              <p className="text-gray-500">
                {language === 'ar' 
                  ? 'مرحباً بعودتك! إليك ما يحدث في متجرك.' 
                  : "Welcome back! Here's what's happening with your store."}
              </p>
            </div>
            <Button 
              onClick={() => onNavigate('import')}
              className="bg-gradient-to-r from-[#3B1728] to-[#8B4665] text-white gap-2"
            >
              <Plus className="w-4 h-4" />
              {language === 'ar' ? 'إضافة منتج' : 'Add Product'}
            </Button>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="bg-[#ECECF0] p-1 rounded-full">
              <TabsTrigger 
                value="overview" 
                className="rounded-full data-[state=active]:bg-white"
              >
                {language === 'ar' ? 'نظرة عامة' : 'Overview'}
              </TabsTrigger>
              <TabsTrigger 
                value="products"
                className="rounded-full data-[state=active]:bg-white"
              >
                {language === 'ar' ? 'المنتجات' : 'Products'}
              </TabsTrigger>
              <TabsTrigger 
                value="analytics"
                className="rounded-full data-[state=active]:bg-white"
              >
                {language === 'ar' ? 'التحليلات' : 'Analytics'}
              </TabsTrigger>
              <TabsTrigger 
                value="settings"
                className="rounded-full data-[state=active]:bg-white"
              >
                {language === 'ar' ? 'الإعدادات' : 'Settings'}
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6 bg-white rounded-3xl border border-gray-200">
                  <div className="flex items-center justify-between mb-10">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Package className="w-6 h-6 text-blue-600" />
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-green-200">+12%</Badge>
                  </div>
                  <div className="text-sm text-gray-500 mb-2">{language === 'ar' ? 'إجمالي المنتجات' : 'Total Products'}</div>
                  <div className="text-3xl font-bold text-gray-900">{stats.totalProducts}</div>
                </Card>

                <Card className="p-6 bg-white rounded-3xl border border-gray-200">
                  <div className="flex items-center justify-between mb-10">
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                      <Eye className="w-6 h-6 text-purple-600" />
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-green-200">+24%</Badge>
                  </div>
                  <div className="text-sm text-gray-500 mb-2">{language === 'ar' ? 'إجمالي المشاهدات' : 'Total Views'}</div>
                  <div className="text-3xl font-bold text-gray-900">{(stats.totalViews / 1000).toFixed(1)}K</div>
                </Card>

                <Card className="p-6 bg-white rounded-3xl border border-gray-200">
                  <div className="flex items-center justify-between mb-10">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-green-200">+18%</Badge>
                  </div>
                  <div className="text-sm text-gray-500 mb-2">{language === 'ar' ? 'إجمالي المبيعات' : 'Total Sales'}</div>
                  <div className="text-3xl font-bold text-gray-900">{stats.totalSales}</div>
                </Card>

                <Card className="p-6 bg-white rounded-3xl border border-gray-200">
                  <div className="flex items-center justify-between mb-10">
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-orange-600" />
                    </div>
                    <Badge className="bg-green-100 text-green-700 border-green-200">+32%</Badge>
                  </div>
                  <div className="text-sm text-gray-500 mb-2">{language === 'ar' ? 'الإيرادات' : 'Revenue'}</div>
                  <div className="text-3xl font-bold text-gray-900">{(stats.revenue / 1000).toFixed(0)}K</div>
                </Card>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 bg-white rounded-3xl border border-gray-200">
                  <h3 className="font-medium mb-6">{language === 'ar' ? 'المشاهدات والنقرات' : 'Views & Clicks'}</h3>
                  <div className="h-64 flex items-end justify-center">
                    <div className="text-center text-gray-400">
                      <BarChart3 className="w-16 h-16 mx-auto mb-2" />
                      <p className="text-sm">{language === 'ar' ? 'رسم بياني قادم' : 'Chart Coming Soon'}</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 bg-white rounded-3xl border border-gray-200">
                  <h3 className="font-medium mb-6">{language === 'ar' ? 'المبيعات حسب اليوم' : 'Sales by Day'}</h3>
                  <div className="h-64 flex items-end justify-center">
                    <div className="text-center text-gray-400">
                      <BarChart3 className="w-16 h-16 mx-auto mb-2" />
                      <p className="text-sm">{language === 'ar' ? 'رسم بياني قادم' : 'Chart Coming Soon'}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Top Products Section */}
              {topProducts.length > 0 && (
                <Card className="p-6 bg-white rounded-3xl border border-gray-200">
                  <h3 className="font-medium mb-6">{language === 'ar' ? 'أكثر المنتجات مشاهدة' : 'Top Viewed Products'}</h3>
                  <div className="space-y-4">
                    {topProducts.map((product, index) => (
                      <div key={product.productId} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#3B1728] to-[#8B4665] flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{product.productName}</div>
                            <div className="text-sm text-gray-500">{product.views} {language === 'ar' ? 'مشاهدة' : 'views'}</div>
                          </div>
                        </div>
                        <Eye className="w-5 h-5 text-gray-400" />
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products">
              <Card className="p-6 bg-white rounded-3xl border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">{language === 'ar' ? 'إدارة المنتجات' : 'Product Management'}</h2>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => onNavigate('import')}
                      className="bg-gradient-to-r from-[#3B1728] to-[#8B4665] text-white gap-2"
                    >
                      <Package className="w-4 h-4" />
                      {language === 'ar' ? 'استيراد منتجات' : 'Import Products'}
                    </Button>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">{language === 'ar' ? 'لا توجد منتجات' : 'No Products Yet'}</h3>
                    <p className="text-gray-500 mb-4">
                      {language === 'ar' 
                        ? 'أضف منتجات يدوياً أو استوردها من موقع الويب' 
                        : 'Add products manually or import them from your website'}
                    </p>
                    <Button 
                      onClick={() => onNavigate('import')}
                      className="bg-gradient-to-r from-[#3B1728] to-[#8B4665] text-white"
                    >
                      {language === 'ar' ? 'أضف منتجك الأول' : 'Add Your First Product'}
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {products.map((product) => (
                      <Card key={product.id} className="p-4 border border-gray-200 rounded-xl">
                        {product.imageUrl && (
                          <img 
                            src={product.imageUrl} 
                            alt={product.name}
                            className="w-full h-48 object-cover rounded-lg mb-4"
                          />
                        )}
                        <h3 className="font-medium mb-2 line-clamp-2">{product.name}</h3>
                        <p className="text-sm text-gray-500 mb-2 line-clamp-2">{product.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-primary">EGP {product.price}</span>
                          <Button size="sm" variant="outline" onClick={() => onNavigate('product', product.id)}>
                            {language === 'ar' ? 'عرض' : 'View'}
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics">
              <Card className="p-12 text-center bg-white rounded-3xl border border-gray-200">
                <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">{language === 'ar' ? 'التحليلات المتقدمة' : 'Advanced Analytics'}</h3>
                <p className="text-gray-500">
                  {language === 'ar' 
                    ? 'احصل على تحليلات مفصلة حول أداء متجرك' 
                    : 'Get detailed analytics about your store performance'}
                </p>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings">
              <Card className="p-6 bg-white rounded-3xl border border-gray-200">
                <h2 className="text-xl font-semibold mb-6">{language === 'ar' ? 'إعدادات المتجر' : 'Store Settings'}</h2>
                <div className="space-y-4">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => onNavigate('account')}
                  >
                    {language === 'ar' ? 'تعديل معلومات المتجر' : 'Edit Store Information'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => onNavigate('account')}
                  >
                    {language === 'ar' ? 'إعدادات الحساب' : 'Account Settings'}
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
