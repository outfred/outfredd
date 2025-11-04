import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const API_URL = 'https://jnnzjcqaxfxphkdvlxrv.supabase.co/functions/v1/server/make-server-dec0bed9';

interface PaymobCheckoutProps {
  plan: string;
  amount: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const PaymobCheckout: React.FC<PaymobCheckoutProps> = ({
  plan,
  amount,
  onSuccess,
  onCancel
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');

  const initializePayment = async () => {
    if (!user) {
      toast.error(language === 'ar' ? 'يرجى تسجيل الدخول' : 'Please login');
      return;
    }

    setLoading(true);

    try {
      // TODO: Implement Paymob Integration
      // Step 1: Get Payment Settings from Admin
      const settingsResponse = await fetch(`${API_URL}/admin/payment-settings`);
      const settings = await settingsResponse.json();

      const paymobApiKey = settings.settings?.paymob_api_key;
      const paymobIntegrationId = settings.settings?.paymob_integration_id;

      if (!paymobApiKey || !paymobIntegrationId) {
        toast.error(language === 'ar' ? 'إعدادات الدفع غير متوفرة' : 'Payment settings not configured');
        setLoading(false);
        return;
      }

      // TODO: Step 2: Authenticate with Paymob API
      // POST https://accept.paymob.com/api/auth/tokens
      // Body: { api_key: paymobApiKey }
      // Returns: { token: "auth_token" }

      // TODO: Step 3: Create Order on Paymob
      // POST https://accept.paymob.com/api/ecommerce/orders
      // Body: {
      //   auth_token: "token_from_step2",
      //   delivery_needed: false,
      //   amount_cents: amount * 100,
      //   currency: "SAR",
      //   items: [{
      //     name: plan + " Plan",
      //     amount_cents: amount * 100,
      //     quantity: 1
      //   }]
      // }
      // Returns: { id: order_id }

      // TODO: Step 4: Generate Payment Key
      // POST https://accept.paymob.com/api/acceptance/payment_keys
      // Body: {
      //   auth_token: "token_from_step2",
      //   amount_cents: amount * 100,
      //   expiration: 3600,
      //   order_id: order_id_from_step3,
      //   billing_data: {
      //     email: user.email,
      //     first_name: user.name?.split(' ')[0] || 'User',
      //     last_name: user.name?.split(' ')[1] || '',
      //     phone_number: "+966500000000",
      //     country: "SA"
      //   },
      //   currency: "SAR",
      //   integration_id: paymobIntegrationId
      // }
      // Returns: { token: "payment_token" }

      // TODO: Step 5: Redirect to Paymob iframe
      // window.location.href = `https://accept.paymob.com/api/acceptance/iframes/${IFRAME_ID}?payment_token=${payment_token}`

      // TODO: Step 6: Handle webhook callback
      // Create endpoint: POST /api/paymob/webhook
      // Verify HMAC signature
      // Update user subscription on successful payment

      // DEMO MODE: Simulate successful payment after 2 seconds
      setTimeout(() => {
        setPaymentStatus('success');
        setLoading(false);
        toast.success(language === 'ar' ? 'تمت عملية الدفع بنجاح!' : 'Payment successful!');
        
        // Update user subscription
        upgradeSubscription();
      }, 2000);

    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      setLoading(false);
      toast.error(language === 'ar' ? 'فشلت عملية الدفع' : 'Payment failed');
    }
  };

  const upgradeSubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/subscriptions/upgrade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Token': token || '',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY || ''}`,
        },
        body: JSON.stringify({ plan }),
      });

      if (response.ok) {
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Subscription upgrade error:', error);
    }
  };

  useEffect(() => {
    // Auto-initialize payment when component mounts
    initializePayment();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 glass-effect text-center">
        {paymentStatus === 'pending' && (
          <>
            <Loader2 className="w-16 h-16 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">
              {language === 'ar' ? 'جاري معالجة الدفع...' : 'Processing Payment...'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {language === 'ar' ? 'يرجى الانتظار، جاري توجيهك لبوابة الدفع' : 'Please wait, redirecting to payment gateway'}
            </p>
            <div className="bg-primary/10 rounded-lg p-4">
              <p className="text-sm">
                <span className="font-semibold">{language === 'ar' ? 'الباقة:' : 'Plan:'}</span> {plan}
              </p>
              <p className="text-sm mt-2">
                <span className="font-semibold">{language === 'ar' ? 'المبلغ:' : 'Amount:'}</span> ${amount}
              </p>
            </div>
          </>
        )}

        {paymentStatus === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h2 className="text-2xl font-bold mb-2 text-green-600">
              {language === 'ar' ? 'تمت عملية الدفع بنجاح!' : 'Payment Successful!'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {language === 'ar' ? 'تم ترقية باقتك بنجاح' : 'Your subscription has been upgraded'}
            </p>
            <Button onClick={onSuccess} className="w-full">
              {language === 'ar' ? 'العودة للصفحة الرئيسية' : 'Back to Home'}
            </Button>
          </>
        )}

        {paymentStatus === 'failed' && (
          <>
            <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-2xl font-bold mb-2 text-red-600">
              {language === 'ar' ? 'فشلت عملية الدفع' : 'Payment Failed'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {language === 'ar' ? 'حدث خطأ أثناء معالجة الدفع' : 'An error occurred while processing payment'}
            </p>
            <div className="flex gap-4">
              <Button onClick={initializePayment} variant="default" className="flex-1">
                {language === 'ar' ? 'إعادة المحاولة' : 'Retry'}
              </Button>
              <Button onClick={onCancel} variant="outline" className="flex-1">
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};
