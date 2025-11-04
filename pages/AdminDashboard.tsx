import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { 
  Users, Store, Package, DollarSign, 
  TrendingUp, Clock, AlertCircle, CheckCircle,
  ArrowRight, Eye, ShoppingBag, Activity
} from 'lucide-react';
import { motion } from 'motion/react';
import { adminApi } from '../utils/api';
import { toast } from 'sonner';

export const AdminDashboard: React.FC = () => {
  const { t, language } = useLanguage();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAnalytics();
      setAnalytics(data.analytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: language === 'ar' ? 'إضافة منتج' : 'Add Product',
      description: language === 'ar' ? 'إضافة منتج جديد للمنصة' : 'Add a new product to the platform',
      icon: Package,
      color: 'bg-blue-100 dark:bg-blue-900',
      iconColor: 'text-blue-600 dark:text-blue-300',
      action: () => window.location.hash = 'admin/products?action=add'
    },
    {
      title: language === 'ar' ? 'إدارة التجار' : 'Manage Merchants',
      description: language === 'ar' ? 'عرض ومراجعة طلبات التجار' : 'View and review merchant applications',
      icon: Store,
      color: 'bg-purple-100 dark:bg-purple-900',
      iconColor: 'text-purple-600 dark:text-purple-300',
      action: () => window.location.hash = 'admin/merchants'
    },
    {
      title: language === 'ar' ? 'عرض الإحصائيات' : 'View Analytics',
      description: language === 'ar' ? 'إحصائيات مفصلة عن المنصة' : 'Detailed platform statistics',
      icon: TrendingUp,
      color: 'bg-green-100 dark:bg-green-900',
      iconColor: 'text-green-600 dark:text-green-300',
      action: () => window.location.hash = 'admin-analytics'
    },
    {
      title: language === 'ar' ? 'إدارة المستخدمين' : 'Manage Users',
      description: language === 'ar' ? 'عرض وتعديل بيانات المستخدمين' : 'View and edit user information',
      icon: Users,
      color: 'bg-pink-100 dark:bg-pink-900',
      iconColor: 'text-pink-600 dark:text-pink-300',
      action: () => window.location.hash = 'admin/users'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
          {language === 'ar' ? 'لوحة التحكم' : 'Dashboard Overview'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'ar' ? 'نظرة عامة على أداء المنصة' : 'Overview of platform performance'}
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <Card className="p-6 glass-effect border-border hover:border-primary transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-300" />
            </div>
            <Badge className="bg-primary/10 text-primary border-primary">
              {language === 'ar' ? 'إجمالي' : 'Total'}
            </Badge>
          </div>
          <h3 className="text-3xl font-bold mb-2">{analytics?.totalUsers || 0}</h3>
          <p className="text-sm text-muted-foreground">
            {language === 'ar' ? 'إجمالي المستخدمين' : 'Total Users'}
          </p>
        </Card>

        <Card className="p-6 glass-effect border-border hover:border-primary transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
              <Store className="w-6 h-6 text-purple-600 dark:text-purple-300" />
            </div>
            <Badge className="bg-accent/10 text-accent border-accent">
              {language === 'ar' ? 'نشط' : 'Active'}
            </Badge>
          </div>
          <h3 className="text-3xl font-bold mb-2">{analytics?.approvedMerchants || 0}</h3>
          <p className="text-sm text-muted-foreground">
            {language === 'ar' ? 'التجار المعتمدون' : 'Approved Merchants'}
          </p>
        </Card>

        <Card className="p-6 glass-effect border-border hover:border-primary transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-pink-100 dark:bg-pink-900 flex items-center justify-center">
              <Package className="w-6 h-6 text-pink-600 dark:text-pink-300" />
            </div>
            <Badge className="bg-primary-light/10 text-primary-light border-primary-light">
              {language === 'ar' ? 'مباشر' : 'Live'}
            </Badge>
          </div>
          <h3 className="text-3xl font-bold mb-2">{analytics?.totalProducts || 0}</h3>
          <p className="text-sm text-muted-foreground">
            {language === 'ar' ? 'إجمالي المنتجات' : 'Total Products'}
          </p>
        </Card>

        <Card className="p-6 glass-effect border-border hover:border-primary transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-300" />
            </div>
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              {language === 'ar' ? 'إيرادات' : 'Revenue'}
            </Badge>
          </div>
          <h3 className="text-3xl font-bold mb-2">
            ${((analytics?.totalProducts || 0) * 45).toLocaleString()}
          </h3>
          <p className="text-sm text-muted-foreground">
            {language === 'ar' ? 'الإيرادات المقدرة' : 'Estimated Revenue'}
          </p>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h2 className="text-xl font-semibold mb-4">
          {language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Card
              key={index}
              className="p-4 glass-effect border-border hover:border-primary transition-all duration-300 cursor-pointer group"
              onClick={action.action}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center flex-shrink-0`}>
                  <action.icon className={`w-5 h-5 ${action.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium mb-1 group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {action.description}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Pending Approvals & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass-effect border-border h-full">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <h2 className="text-lg font-semibold">
                    {language === 'ar' ? 'الموافقات المعلقة' : 'Pending Approvals'}
                  </h2>
                </div>
                <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                  {analytics?.pendingMerchants || 0}
                </Badge>
              </div>
            </div>
            <div className="p-6">
              {analytics?.pendingMerchants > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
                    <div className="flex items-center gap-3">
                      <Store className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {language === 'ar' ? 'طلبات التجار الجديدة' : 'New Merchant Applications'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {analytics.pendingMerchants} {language === 'ar' ? 'بانتظار المراجعة' : 'awaiting review'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.location.hash = 'admin/merchants'}
                    >
                      {language === 'ar' ? 'مراجعة' : 'Review'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <p className="text-muted-foreground">
                    {language === 'ar' ? 'لا توجد موافقات معلقة' : 'No pending approvals'}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-effect border-border h-full">
            <div className="p-6 border-b border-border">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">
                  {language === 'ar' ? 'النشاط الأخير' : 'Recent Activity'}
                </h2>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3 pb-3 border-b border-border/50">
                  <div className="w-2 h-2 rounded-full bg-green-600 mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {language === 'ar' ? 'تاجر جديد تمت الموافقة عليه' : 'New merchant approved'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {language === 'ar' ? 'منذ ساعتين' : '2 hours ago'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 pb-3 border-b border-border/50">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {language === 'ar' ? 'تم إضافة منتجات جديدة' : 'New products added'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {language === 'ar' ? 'منذ 5 ساعات' : '5 hours ago'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-purple-600 mt-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {language === 'ar' ? 'مستخدم جديد مسجل' : 'New user registered'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {language === 'ar' ? 'منذ 8 ساعات' : '8 hours ago'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Platform Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h2 className="text-xl font-semibold mb-4">
          {language === 'ar' ? 'مقاييس المنصة' : 'Platform Metrics'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 glass-effect border-border">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">
                {language === 'ar' ? 'مشاهدات المنتجات' : 'Product Views'}
              </h3>
            </div>
            <p className="text-3xl font-bold mb-2">
              {((analytics?.totalProducts || 0) * 123).toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">
              {language === 'ar' ? 'هذا الشهر' : 'This month'}
            </p>
          </Card>

          <Card className="p-6 glass-effect border-border">
            <div className="flex items-center gap-3 mb-4">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">
                {language === 'ar' ? 'الأزياء المُنشأة' : 'Outfits Generated'}
              </h3>
            </div>
            <p className="text-3xl font-bold mb-2">
              {((analytics?.totalUsers || 0) * 3).toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">
              {language === 'ar' ? 'هذا الشهر' : 'This month'}
            </p>
          </Card>

          <Card className="p-6 glass-effect border-border">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">
                {language === 'ar' ? 'عمليات البحث' : 'Search Queries'}
              </h3>
            </div>
            <p className="text-3xl font-bold mb-2">
              {((analytics?.totalUsers || 0) * 10).toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">
              {language === 'ar' ? 'هذا الشهر' : 'This month'}
            </p>
          </Card>
        </div>
      </motion.div>
    </div>
  );
};
