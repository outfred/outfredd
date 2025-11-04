import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { TrendingUp, Users, Store, Package, DollarSign, Eye, ShoppingBag, Activity } from 'lucide-react';

export const AdminAnalytics: React.FC = () => {
  const { language } = useLanguage();
  
  const [stats, setStats] = useState({
    totalUsers: 1250,
    totalMerchants: 87,
    totalProducts: 5430,
    totalRevenue: 45680,
    monthlyUsers: 320,
    monthlyMerchants: 15,
    monthlyRevenue: 8920,
    productViews: 18400,
    outfitsGenerated: 4200,
    searchQueries: 12600,
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {language === 'ar' ? 'لوحة التحليلات' : 'Analytics Dashboard'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {language === 'ar' ? 'إحصائيات شاملة عن المنصة' : 'Comprehensive platform statistics'}
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 glass-effect">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              +{stats.monthlyUsers}
            </Badge>
          </div>
          <h3 className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</h3>
          <p className="text-sm text-muted-foreground">
            {language === 'ar' ? 'إجمالي المستخدمين' : 'Total Users'}
          </p>
        </Card>

        <Card className="p-6 glass-effect">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <Store className="w-6 h-6 text-purple-600 dark:text-purple-300" />
            </div>
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              +{stats.monthlyMerchants}
            </Badge>
          </div>
          <h3 className="text-2xl font-bold">{stats.totalMerchants.toLocaleString()}</h3>
          <p className="text-sm text-muted-foreground">
            {language === 'ar' ? 'إجمالي التجار' : 'Total Merchants'}
          </p>
        </Card>

        <Card className="p-6 glass-effect">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-pink-100 dark:bg-pink-900 rounded-lg">
              <Package className="w-6 h-6 text-pink-600 dark:text-pink-300" />
            </div>
          </div>
          <h3 className="text-2xl font-bold">{stats.totalProducts.toLocaleString()}</h3>
          <p className="text-sm text-muted-foreground">
            {language === 'ar' ? 'إجمالي المنتجات' : 'Total Products'}
          </p>
        </Card>

        <Card className="p-6 glass-effect">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-300" />
            </div>
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              +${stats.monthlyRevenue}
            </Badge>
          </div>
          <h3 className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</h3>
          <p className="text-sm text-muted-foreground">
            {language === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}
          </p>
        </Card>
      </div>

      {/* Activity Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 glass-effect">
          <div className="flex items-center gap-3 mb-4">
            <Eye className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">
              {language === 'ar' ? 'مشاهدات المنتجات' : 'Product Views'}
            </h3>
          </div>
          <p className="text-3xl font-bold">{stats.productViews.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {language === 'ar' ? 'هذا الشهر' : 'This month'}
          </p>
        </Card>

        <Card className="p-6 glass-effect">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingBag className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">
              {language === 'ar' ? 'الأزياء المُنشأة' : 'Outfits Generated'}
            </h3>
          </div>
          <p className="text-3xl font-bold">{stats.outfitsGenerated.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {language === 'ar' ? 'هذا الشهر' : 'This month'}
          </p>
        </Card>

        <Card className="p-6 glass-effect">
          <div className="flex items-center gap-3 mb-4">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">
              {language === 'ar' ? 'عمليات البحث' : 'Search Queries'}
            </h3>
          </div>
          <p className="text-3xl font-bold">{stats.searchQueries.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {language === 'ar' ? 'هذا الشهر' : 'This month'}
          </p>
        </Card>
      </div>

      {/* Revenue Chart Placeholder */}
      <Card className="p-6 glass-effect">
        <h3 className="text-xl font-semibold mb-4">
          {language === 'ar' ? 'الإيرادات الشهرية' : 'Monthly Revenue'}
        </h3>
        <div className="h-64 flex items-center justify-center bg-secondary/20 rounded-lg">
          <p className="text-muted-foreground">
            {language === 'ar' ? 'الرسم البياني قريباً' : 'Chart coming soon'}
          </p>
        </div>
      </Card>
    </div>
  );
};
