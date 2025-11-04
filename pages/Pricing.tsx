import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Check, Crown, Zap, Star } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = 'https://jnnzjcqaxfxphkdvlxrv.supabase.co/functions/v1/server/make-server-dec0bed9';

export const Pricing: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPlans();
    if (user) {
      loadCurrentPlan();
    }
  }, [user]);

  const loadPlans = async () => {
    try {
      const response = await fetch(`${API_URL}/api/subscriptions/plans`);
      const data = await response.json();
      setPlans(data.plans || []);
    } catch (error) {
      console.error('Failed to load plans:', error);
    }
  };

  const loadCurrentPlan = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/subscriptions/current`, {
        headers: {
          'X-Access-Token': token || '',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`,
        },
      });
      const data = await response.json();
      setCurrentPlan(data.subscription);
    } catch (error) {
      console.error('Failed to load current plan:', error);
    }
  };

  const handleUpgrade = async (planName: string) => {
    if (!user) {
      toast.error(language === 'ar' ? 'يرجى تسجيل الدخول أولاً' : 'Please login first');
      window.location.hash = '#login';
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/subscriptions/upgrade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Token': token || '',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`,
        },
        body: JSON.stringify({ plan: planName }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(language === 'ar' ? 'تم ترقية الباقة بنجاح!' : 'Plan upgraded successfully!');
        await loadCurrentPlan();
        
        // TODO: Integrate Paymob payment for paid plans
        if (planName !== 'free') {
          toast.info(language === 'ar' ? 'سيتم توجيهك لصفحة الدفع قريباً...' : 'Payment integration coming soon...');
        }
      } else {
        toast.error(data.error || (language === 'ar' ? 'فشل الترقية' : 'Upgrade failed'));
      }
    } catch (error) {
      console.error('Upgrade error:', error);
      toast.error(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (planName: string) => {
    switch (planName.toLowerCase()) {
      case 'free': return <Zap className="w-8 h-8" />;
      case 'basic': return <Star className="w-8 h-8" />;
      case 'pro': return <Crown className="w-8 h-8" />;
      default: return <Zap className="w-8 h-8" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {language === 'ar' ? 'اختر الباقة المناسبة لك' : 'Choose Your Plan'}
          </h1>
          <p className="text-xl text-muted-foreground">
            {language === 'ar' ? 'جرّب مجاناً أو اشترك في باقة مميزة للحصول على المزيد' : 'Start free or upgrade for more features'}
          </p>
        </div>

        {/* Current Plan Badge */}
        {currentPlan && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 rounded-full">
              <span className="text-sm font-medium">
                {language === 'ar' ? 'باقتك الحالية:' : 'Current Plan:'}
              </span>
              <span className="text-primary font-bold capitalize">{currentPlan.plan}</span>
              <span className="text-muted-foreground">
                ({currentPlan.searches_count}/{currentPlan.searches_limit === 999999 ? '∞' : currentPlan.searches_limit} {language === 'ar' ? 'بحث' : 'searches'})
              </span>
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlan?.plan === plan.name;
            const isPopular = plan.popular;
            
            return (
              <Card
                key={plan.name}
                className={`relative p-8 glass-effect ${
                  isPopular ? 'border-2 border-primary shadow-xl scale-105' : ''
                } ${isCurrentPlan ? 'ring-2 ring-primary' : ''}`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium">
                    {language === 'ar' ? 'الأكثر شعبية' : 'Most Popular'}
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute -top-4 right-4 px-3 py-1 bg-green-500 text-white rounded-full text-xs font-medium">
                    {language === 'ar' ? 'باقتك الحالية' : 'Current'}
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 text-primary">
                    {getPlanIcon(plan.name)}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">
                    {language === 'ar' ? plan.name_ar : plan.name_en}
                  </h3>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-4xl font-bold">{plan.price === 0 ? language === 'ar' ? 'مجاني' : 'Free' : `$${plan.price}`}</span>
                    {plan.price > 0 && (
                      <span className="text-muted-foreground">/{language === 'ar' ? 'شهر' : 'month'}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  {plan.features.map((feature: any, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{language === 'ar' ? feature.name_ar : feature.name_en}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handleUpgrade(plan.name)}
                  disabled={loading || isCurrentPlan}
                  className="w-full"
                  variant={isPopular ? 'default' : 'outline'}
                >
                  {loading ? (
                    language === 'ar' ? 'جاري الترقية...' : 'Upgrading...'
                  ) : isCurrentPlan ? (
                    language === 'ar' ? 'باقتك الحالية' : 'Current Plan'
                  ) : plan.price === 0 ? (
                    language === 'ar' ? 'الحصول على الباقة' : 'Get Started'
                  ) : (
                    language === 'ar' ? 'ترقية الآن' : 'Upgrade Now'
                  )}
                </Button>
              </Card>
            );
          })}
        </div>

        {/* FAQ or Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            {language === 'ar' 
              ? 'جميع الباقات تشمل دعماً فنياً على مدار الساعة. يمكنك الترقية أو التخفيض في أي وقت.' 
              : 'All plans include 24/7 support. Upgrade or downgrade anytime.'}
          </p>
        </div>
      </div>
    </div>
  );
};
