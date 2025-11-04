import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Switch } from '../components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Package, Users, Store, Plus, Edit, Trash2, Crown, Zap, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { subscriptionsApi } from '../utils/adminApi';

export const AdminSubscriptions: React.FC = () => {
  const { language } = useLanguage();
  
  const getPlanName = (id: string) => {
    const names: Record<string, { ar: string; en: string }> = {
      free: { ar: 'مجاني', en: 'Free' },
      basic: { ar: 'أساسي', en: 'Basic' },
      pro: { ar: 'احترافي', en: 'Pro' },
      silver: { ar: 'فضي', en: 'Silver' },
      gold: { ar: 'ذهبي', en: 'Gold' },
    };
    return language === 'ar' ? names[id]?.ar : names[id]?.en;
  };

  const getDescription = (id: string) => {
    const descriptions: Record<string, { ar: string; en: string }> = {
      basic: { ar: 'بدون ترويج إضافي', en: 'No additional promotion' },
      silver: { ar: 'ترويج متوسط', en: 'Medium promotion' },
      gold: { ar: 'ترويج متقدم', en: 'Advanced promotion' },
    };
    return language === 'ar' ? descriptions[id]?.ar : descriptions[id]?.en;
  };

  const [userPlans, setUserPlans] = useState([
    {
      id: 'free',
      price: 0,
      outfits_limit: 1,
      searches_limit: 5,
      is_active: true,
    },
    {
      id: 'basic',
      price: 99,
      outfits_limit: 10,
      searches_limit: 50,
      is_active: true,
    },
    {
      id: 'pro',
      price: 199,
      outfits_limit: -1,
      searches_limit: -1,
      is_active: true,
    },
  ]);

  const [merchantPlans, setMerchantPlans] = useState([
    {
      id: 'basic',
      price: 299,
      promotion_level: 0,
      products_limit: 100,
      is_active: true,
    },
    {
      id: 'silver',
      price: 599,
      promotion_level: 1,
      products_limit: 500,
      is_active: true,
    },
    {
      id: 'gold',
      price: 999,
      promotion_level: 2,
      products_limit: -1,
      is_active: true,
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [planForm, setPlanForm] = useState({
    name: '',
    price: '',
    outfits_limit: '',
    searches_limit: '',
    products_limit: '',
    promotion_level: '',
    description: '',
  });

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const response = await subscriptionsApi.getAll();
      
      if (response.subscriptions) {
        const userSubs = response.subscriptions.filter((s: any) => s.type === 'user');
        const merchantSubs = response.subscriptions.filter((s: any) => s.type === 'merchant');
        
        if (userSubs.length > 0) {
          setUserPlans(userSubs);
        }
        if (merchantSubs.length > 0) {
          setMerchantPlans(merchantSubs);
        }
      }
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
      toast.error(language === 'ar' ? 'فشل تحميل الباقات' : 'Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPlan = (plan: any) => {
    setEditingPlan(plan);
    setPlanForm({
      name: getPlanName(plan.id),
      price: plan.price.toString(),
      outfits_limit: plan.outfits_limit?.toString() || '',
      searches_limit: plan.searches_limit?.toString() || '',
      products_limit: plan.products_limit?.toString() || '',
      promotion_level: plan.promotion_level?.toString() || '',
      description: getDescription(plan.id) || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleSavePlan = async () => {
    if (!editingPlan) return;
    
    try {
      setLoading(true);
      const updatedData: any = {
        price: parseInt(planForm.price),
      };
      
      if (planForm.outfits_limit) {
        updatedData.outfits_limit = parseInt(planForm.outfits_limit);
      }
      if (planForm.searches_limit) {
        updatedData.searches_limit = parseInt(planForm.searches_limit);
      }
      if (planForm.products_limit) {
        updatedData.products_limit = parseInt(planForm.products_limit);
      }
      if (planForm.promotion_level) {
        updatedData.promotion_level = parseInt(planForm.promotion_level);
      }
      
      await subscriptionsApi.update(editingPlan.id, updatedData);
      toast.success(language === 'ar' ? 'تم حفظ الباقة' : 'Plan saved successfully');
      setIsEditDialogOpen(false);
      await loadSubscriptions();
    } catch (error) {
      console.error('Failed to save plan:', error);
      toast.error(language === 'ar' ? 'فشل حفظ الباقة' : 'Failed to save plan');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePlan = async (planId: string, type: 'user' | 'merchant') => {
    try {
      setLoading(true);
      const plans = type === 'user' ? userPlans : merchantPlans;
      const plan = plans.find(p => p.id === planId);
      
      if (!plan) return;
      
      await subscriptionsApi.update(planId, { is_active: !plan.is_active });
      
      if (type === 'user') {
        setUserPlans(userPlans.map(p => 
          p.id === planId ? { ...p, is_active: !p.is_active } : p
        ));
      } else {
        setMerchantPlans(merchantPlans.map(p => 
          p.id === planId ? { ...p, is_active: !p.is_active } : p
        ));
      }
      
      toast.success(language === 'ar' ? 'تم تحديث حالة الباقة' : 'Plan status updated');
    } catch (error) {
      console.error('Failed to toggle plan:', error);
      toast.error(language === 'ar' ? 'فشل تحديث حالة الباقة' : 'Failed to update plan status');
    } finally {
      setLoading(false);
    }
  };

  if (loading && userPlans.length === 0) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-muted-foreground">
          {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {language === 'ar' ? 'إدارة الباقات' : 'Subscription Management'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {language === 'ar' ? 'إدارة باقات المستخدمين والتجار' : 'Manage user and merchant subscription plans'}
          </p>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="users">
            <Users className="w-4 h-4 mr-2" />
            {language === 'ar' ? 'باقات المستخدمين' : 'User Plans'}
          </TabsTrigger>
          <TabsTrigger value="merchants">
            <Store className="w-4 h-4 mr-2" />
            {language === 'ar' ? 'باقات التجار' : 'Merchant Plans'}
          </TabsTrigger>
        </TabsList>

        {/* User Plans */}
        <TabsContent value="users" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {userPlans.map((plan) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={`p-6 glass-effect relative ${!plan.is_active ? 'opacity-50' : ''}`}>
                  {plan.id === 'pro' && (
                    <div className="absolute -top-3 right-6">
                      <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">
                        <Crown className="w-3 h-3 mr-1" />
                        {language === 'ar' ? 'موصى به' : 'Popular'}
                      </Badge>
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">{getPlanName(plan.id)}</h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">
                        {language === 'ar' ? '/شهر' : '/month'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <span>
                        {plan.outfits_limit === -1 
                          ? (language === 'ar' ? 'أزياء غير محدودة' : 'Unlimited outfits')
                          : `${plan.outfits_limit} ${language === 'ar' ? 'زي' : 'outfits'}`
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-primary" />
                      <span>
                        {plan.searches_limit === -1 
                          ? (language === 'ar' ? 'بحث غير محدود' : 'Unlimited searches')
                          : `${plan.searches_limit} ${language === 'ar' ? 'عملية بحث' : 'searches'}`
                        }
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {language === 'ar' ? 'نشط' : 'Active'}
                      </span>
                      <Switch
                        checked={plan.is_active}
                        onCheckedChange={() => handleTogglePlan(plan.id, 'user')}
                        disabled={loading}
                      />
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleEditPlan(plan)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      {language === 'ar' ? 'تعديل' : 'Edit'}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        {/* Merchant Plans */}
        <TabsContent value="merchants" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {merchantPlans.map((plan) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={`p-6 glass-effect relative ${!plan.is_active ? 'opacity-50' : ''}`}>
                  {plan.id === 'gold' && (
                    <div className="absolute -top-3 right-6">
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
                        <Crown className="w-3 h-3 mr-1" />
                        {language === 'ar' ? 'الأفضل' : 'Best'}
                      </Badge>
                    </div>
                  )}
                  
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">{getPlanName(plan.id)}</h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">
                        {language === 'ar' ? '/شهر' : '/month'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {getDescription(plan.id)}
                    </p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-primary" />
                      <span>
                        {plan.products_limit === -1 
                          ? (language === 'ar' ? 'منتجات غير محدودة' : 'Unlimited products')
                          : `${plan.products_limit} ${language === 'ar' ? 'منتج' : 'products'}`
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <span>
                        {language === 'ar' ? 'مستوى الترويج:' : 'Promotion level:'} {plan.promotion_level}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {language === 'ar' ? 'نشط' : 'Active'}
                      </span>
                      <Switch
                        checked={plan.is_active}
                        onCheckedChange={() => handleTogglePlan(plan.id, 'merchant')}
                        disabled={loading}
                      />
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleEditPlan(plan)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      {language === 'ar' ? 'تعديل' : 'Edit'}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Plan Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'ar' ? 'تعديل الباقة' : 'Edit Plan'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{language === 'ar' ? 'اسم الباقة' : 'Plan Name'}</Label>
              <Input
                value={planForm.name}
                onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label>{language === 'ar' ? 'السعر (شهري)' : 'Price (Monthly)'}</Label>
              <Input
                type="number"
                value={planForm.price}
                onChange={(e) => setPlanForm({ ...planForm, price: e.target.value })}
              />
            </div>
            <Button onClick={handleSavePlan} className="w-full" disabled={loading}>
              {loading ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ' : 'Save')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
