import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Search, Eye, TrendingUp, Globe, Calendar, Package } from 'lucide-react';
import { motion } from 'motion/react';
import { statsApi } from '../utils/api';
import { toast } from 'sonner@2.0.3';

export const Statistics: React.FC = () => {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const { summary } = await statsApi.getSummary();
      setStats(summary);
    } catch (error) {
      console.error('Error loading statistics:', error);
      toast.error(language === 'ar' ? 'فشل تحميل الإحصائيات' : 'Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-400 animate-pulse" />
          <p className="text-muted-foreground">
            {language === 'ar' ? 'جاري التحميل...' : 'Loading statistics...'}
          </p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl mb-2">
            {language === 'ar' ? 'الإحصائيات' : 'Statistics'}
          </h1>
          <p className="text-muted-foreground mb-8">
            {language === 'ar' 
              ? 'تحليل شامل لنشاط المستخدمين والمنتجات' 
              : 'Comprehensive analysis of user activity and products'}
          </p>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-6 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                    <Search className="w-6 h-6 text-blue-500" />
                  </div>
                  <Badge variant="secondary">{language === 'ar' ? 'إجمالي' : 'Total'}</Badge>
                </div>
                <h3 className="text-3xl mb-1">{stats.totalSearches.toLocaleString()}</h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'عمليات البحث' : 'Searches'}
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <Eye className="w-6 h-6 text-green-500" />
                  </div>
                  <Badge variant="secondary">{language === 'ar' ? 'إجمالي' : 'Total'}</Badge>
                </div>
                <h3 className="text-3xl mb-1">{stats.totalViews.toLocaleString()}</h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'مشاهدات المنتجات' : 'Product Views'}
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <Globe className="w-6 h-6 text-purple-500" />
                  </div>
                  <Badge variant="secondary">{language === 'ar' ? 'اللغات' : 'Languages'}</Badge>
                </div>
                <div className="space-y-2">
                  {stats.languageStats?.map((lang: any) => (
                    <div key={lang.language} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{lang.language === 'ar' ? 'العربية' : 'English'}</span>
                      <Badge variant="outline">{lang.count}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-orange-500" />
                  </div>
                  <Badge variant="secondary">{language === 'ar' ? 'آخر 30 يوم' : 'Last 30 Days'}</Badge>
                </div>
                <h3 className="text-3xl mb-1">
                  {stats.searchesByDate?.length || 0}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' ? 'أيام نشطة' : 'Active Days'}
                </p>
              </Card>
            </motion.div>
          </div>

          {/* Top Searches */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-8"
          >
            <Card className="p-6 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl">
                  {language === 'ar' ? 'أكثر عمليات البحث' : 'Top Searches'}
                </h2>
              </div>
              
              <Separator className="mb-6" />
              
              {stats.topSearches && stats.topSearches.length > 0 ? (
                <div className="space-y-3">
                  {stats.topSearches.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-center gap-3">
                        <Badge className="w-8 h-8 rounded-full flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <span className="text-lg">{item.query}</span>
                      </div>
                      <Badge variant="secondary">
                        {item.count} {language === 'ar' ? 'بحث' : 'searches'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  {language === 'ar' ? 'لا توجد عمليات بحث بعد' : 'No searches yet'}
                </p>
              )}
            </Card>
          </motion.div>

          {/* Top Viewed Products */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8"
          >
            <Card className="p-6 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-green-500" />
                </div>
                <h2 className="text-2xl">
                  {language === 'ar' ? 'أكثر المنتجات مشاهدة' : 'Most Viewed Products'}
                </h2>
              </div>
              
              <Separator className="mb-6" />
              
              {stats.topViewedProducts && stats.topViewedProducts.length > 0 ? (
                <div className="space-y-3">
                  {stats.topViewedProducts.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-center gap-3">
                        <Badge className="w-8 h-8 rounded-full flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {language === 'ar' ? 'معرف المنتج:' : 'Product ID:'}
                          </p>
                          <code className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                            {item.productId.slice(0, 8)}...
                          </code>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        <Eye className="w-3 h-3 mr-1" />
                        {item.count} {language === 'ar' ? 'مشاهدة' : 'views'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  {language === 'ar' ? 'لا توجد مشاهدات بعد' : 'No views yet'}
                </p>
              )}
            </Card>
          </motion.div>

          {/* Activity Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="p-6 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-white/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-500" />
                </div>
                <h2 className="text-2xl">
                  {language === 'ar' ? 'النشاط اليومي (آخر 30 يوم)' : 'Daily Activity (Last 30 Days)'}
                </h2>
              </div>
              
              <Separator className="mb-6" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Searches by Date */}
                <div>
                  <h3 className="mb-4">
                    {language === 'ar' ? 'عمليات البحث' : 'Searches'}
                  </h3>
                  {stats.searchesByDate && stats.searchesByDate.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {stats.searchesByDate.slice(-10).reverse().map((item: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-800/50">
                          <span className="text-sm">{item.date}</span>
                          <Badge variant="outline">{item.count}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      {language === 'ar' ? 'لا توجد بيانات' : 'No data'}
                    </p>
                  )}
                </div>

                {/* Views by Date */}
                <div>
                  <h3 className="mb-4">
                    {language === 'ar' ? 'مشاهدات المنتجات' : 'Product Views'}
                  </h3>
                  {stats.viewsByDate && stats.viewsByDate.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {stats.viewsByDate.slice(-10).reverse().map((item: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded bg-gray-50 dark:bg-gray-800/50">
                          <span className="text-sm">{item.date}</span>
                          <Badge variant="outline">{item.count}</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      {language === 'ar' ? 'لا توجد بيانات' : 'No data'}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
