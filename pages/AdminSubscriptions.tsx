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

  // User Plans
  const [userPlans, setUserPlans] = useState([
    {
      id: 'free',
      price: 0,
      outfitsLimit: 1,
      searchesLimit: 5,
      isActive: true,
    },
    {
      id: 'basic',
      price: 99,
      outfitsLimit: 10,
      searchesLimit: 50,
      isActive: true,
    },
    {
      id: 'pro',
      price: 199,
      outfitsLimit: -1,
      searchesLimit: -1,
      isActive: true,
    },
  ]);

  // Merchant Plans
  const [merchantPlans, setMerchantPlans] = useState([
    {
      id: 'basic',
      price: 299,
      promotionLevel: 0,
      productsLimit: 100,
      isActive: true,
    },
    {
      id: 'silver',
      price: 599,
      promotionLevel: 1,
      productsLimit: 500,
      isActive: true,
    },
    {
      id: 'gold',
      price: 999,
      promotionLevel: 2,
      productsLimit: -1,
      isActive: true,
    },
  ]);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [planForm, setPlanForm] = useState({
    name: '',
    price: '',
    outfitsLimit: '',
    searchesLimit: '',
    productsLimit: '',
    promotionLevel: '',
    description: '',
  });

  const handleEditPlan = (plan: any) => {
    setEditingPlan(plan);
    setPlanForm({
      name: getPlanName(plan.id),
      price: plan.price.toString(),
      outfitsLimit: plan.outfitsLimit?.toString() || '',
      searchesLimit: plan.searchesLimit?.toString() || '',
      productsLimit: plan.productsLimit?.toString() || '',
      promotionLevel: plan.promotionLevel?.toString() || '',
      description: getDescription(plan.id) || '',
    });
    setIsEditDialogOpen(true);
  };

  const handleSavePlan = () => {
    toast.success(language === 'ar' ? 'تم حفظ الباقة' : 'Plan saved successfully');
    setIsEditDialogOpen(false);
  };

  const handleTogglePlan = (planId: string, type: 'user' | 'merchant') => {
    if (type === 'user') {
      setUserPlans(userPlans.map(p => 
        p.id === planId ? { ...p, isActive: !p.isActive } : p
      ));
    } else {
      setMerchantPlans(merchantPlans.map(p => 
        p.id === planId ? { ...p, isActive: !p.isActive } : p
      ));
    }
    toast.success(language === 'ar' ? 'تم تحديث حالة الباقة' : 'Plan status updated');
  };

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
                <Card className={`p-6 glass-effect relative ${!plan.isActive ? 'opacity-50' : ''}`}>
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
                        {plan.outfitsLimit === -1 
                          ? (language === 'ar' ? 'أزياء غير محدودة' : 'Unlimited outfits')
                          : `${plan.outfitsLimit} ${language === 'ar' ? 'زي' : 'outfits'}`
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-primary" />
                      <span>
                        {plan.searchesLimit === -1 
                          ? (language === 'ar' ? 'بحث غير محدود' : 'Unlimited searches')
                          : `${plan.searchesLimit} ${language === 'ar' ? 'عملية بحث' : 'searches'}`
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
                        checked={plan.isActive}
                        onCheckedChange={() => handleTogglePlan(plan.id, 'user')}
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
                <Card className={`p-6 glass-effect relative ${!plan.isActive ? 'opacity-50' : ''}`}>
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
                        {plan.productsLimit === -1 
                          ? (language === 'ar' ? 'منتجات غير محدودة' : 'Unlimited products')
                          : `${plan.productsLimit} ${language === 'ar' ? 'منتج' : 'products'}`
                        }
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <span>
                        {language === 'ar' ? 'مستوى الترويج:' : 'Promotion level:'} {plan.promotionLevel}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {language === 'ar' ? 'نشط' : 'Active'}
                      </span>
                      <Switch
                        checked={plan.isActive}
                        onCheckedChange={() => handleTogglePlan(plan.id, 'merchant')}
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
            <Button onClick={handleSavePlan} className="w-full">
              {language === 'ar' ? 'حفظ' : 'Save'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
