import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { CreditCard, Key, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { paymentApi, smtpApi } from '../utils/adminApi';

export const AdminPaymentSettings: React.FC = () => {
  const { language } = useLanguage();
  
  const [paymobSettings, setPaymobSettings] = useState({
    api_key: '',
    secret_key: '',
    integration_id: '',
    hmac_secret: '',
    iframe_id: '',
    is_enabled: false,
    is_test_mode: true,
  });

  const [smtpSettings, setSmtpSettings] = useState({
    host: '',
    port: 587,
    username: '',
    password: '',
    from_email: '',
    from_name: 'Outfred',
    encryption: 'tls',
    is_enabled: false,
  });

  const [loading, setLoading] = useState(false);
  const [showTestEmailDialog, setShowTestEmailDialog] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      const [paymentRes, smtpRes] = await Promise.all([
        paymentApi.get(),
        smtpApi.get()
      ]);
      
      if (paymentRes.settings) {
        setPaymobSettings({
          api_key: paymentRes.settings.api_key || '',
          secret_key: paymentRes.settings.secret_key || '',
          integration_id: paymentRes.settings.integration_id || '',
          hmac_secret: paymentRes.settings.hmac_secret || '',
          iframe_id: paymentRes.settings.iframe_id || '',
          is_enabled: paymentRes.settings.is_enabled || false,
          is_test_mode: paymentRes.settings.is_test_mode !== false,
        });
      }
      
      if (smtpRes.settings) {
        setSmtpSettings({
          host: smtpRes.settings.host || '',
          port: smtpRes.settings.port || 587,
          username: smtpRes.settings.username || '',
          password: smtpRes.settings.password || '',
          from_email: smtpRes.settings.from_email || '',
          from_name: smtpRes.settings.from_name || 'Outfred',
          encryption: smtpRes.settings.encryption || 'tls',
          is_enabled: smtpRes.settings.is_enabled || false,
        });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error(language === 'ar' ? 'فشل تحميل الإعدادات' : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePaymob = async () => {
    try {
      setLoading(true);
      await paymentApi.update(paymobSettings);
      toast.success(language === 'ar' ? 'تم حفظ إعدادات الدفع' : 'Payment settings saved');
    } catch (error) {
      console.error('Failed to save payment settings:', error);
      toast.error(language === 'ar' ? 'فشل حفظ إعدادات الدفع' : 'Failed to save payment settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSMTP = async () => {
    try {
      setLoading(true);
      await smtpApi.update(smtpSettings);
      toast.success(language === 'ar' ? 'تم حفظ إعدادات البريد' : 'Email settings saved');
    } catch (error) {
      console.error('Failed to save SMTP settings:', error);
      toast.error(language === 'ar' ? 'فشل حفظ إعدادات البريد' : 'Failed to save email settings');
    } finally {
      setLoading(false);
    }
  };

  const handleTestSMTP = async () => {
    if (!testEmail) {
      toast.error(language === 'ar' ? 'الرجاء إدخال البريد الإلكتروني' : 'Please enter email address');
      return;
    }
    
    try {
      setLoading(true);
      const result = await smtpApi.sendTest(testEmail);
      toast.success(result.message || (language === 'ar' ? 'تم إرسال رسالة تجريبية' : 'Test email sent'));
      setShowTestEmailDialog(false);
      setTestEmail('');
    } catch (error) {
      console.error('Failed to send test email:', error);
      toast.error(language === 'ar' ? 'فشل إرسال الرسالة' : 'Failed to send test email');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !paymobSettings.api_key && !smtpSettings.host) {
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
      <div>
        <h1 className="text-3xl font-bold">
          {language === 'ar' ? 'إعدادات الدفع والبريد' : 'Payment & Email Settings'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {language === 'ar' ? 'إدارة بوابة الدفع وإعدادات SMTP' : 'Manage payment gateway and SMTP settings'}
        </p>
      </div>

      {/* Paymob Settings */}
      <Card className="p-6 glass-effect">
        <div className="flex items-center gap-3 mb-6">
          <CreditCard className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold">
            {language === 'ar' ? 'إعدادات Paymob' : 'Paymob Settings'}
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
            <div>
              <Label className="text-base font-medium">
                {language === 'ar' ? 'تفعيل Paymob' : 'Enable Paymob'}
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                {language === 'ar' ? 'تفعيل بوابة الدفع Paymob' : 'Enable Paymob payment gateway'}
              </p>
            </div>
            <Switch
              checked={paymobSettings.is_enabled}
              onCheckedChange={(checked) => setPaymobSettings({ ...paymobSettings, is_enabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
            <div>
              <Label className="text-base font-medium">
                {language === 'ar' ? 'الوضع التجريبي' : 'Test Mode'}
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                {language === 'ar' ? 'استخدام بيانات تجريبية' : 'Use test credentials'}
              </p>
            </div>
            <Switch
              checked={paymobSettings.is_test_mode}
              onCheckedChange={(checked) => setPaymobSettings({ ...paymobSettings, is_test_mode: checked })}
            />
          </div>

          <div>
            <Label>{language === 'ar' ? 'مفتاح API' : 'API Key'}</Label>
            <Input
              type="password"
              value={paymobSettings.api_key}
              onChange={(e) => setPaymobSettings({ ...paymobSettings, api_key: e.target.value })}
              placeholder="ZXlKMGVYQWlPaUpL..."
            />
          </div>

          <div>
            <Label>{language === 'ar' ? 'المفتاح السري' : 'Secret Key'}</Label>
            <Input
              type="password"
              value={paymobSettings.secret_key}
              onChange={(e) => setPaymobSettings({ ...paymobSettings, secret_key: e.target.value })}
              placeholder="sk_..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>{language === 'ar' ? 'Integration ID' : 'Integration ID'}</Label>
              <Input
                value={paymobSettings.integration_id}
                onChange={(e) => setPaymobSettings({ ...paymobSettings, integration_id: e.target.value })}
                placeholder="123456"
              />
            </div>
            <div>
              <Label>{language === 'ar' ? 'Iframe ID' : 'Iframe ID'}</Label>
              <Input
                value={paymobSettings.iframe_id}
                onChange={(e) => setPaymobSettings({ ...paymobSettings, iframe_id: e.target.value })}
                placeholder="654321"
              />
            </div>
          </div>

          <div>
            <Label>{language === 'ar' ? 'HMAC Secret' : 'HMAC Secret'}</Label>
            <Input
              type="password"
              value={paymobSettings.hmac_secret}
              onChange={(e) => setPaymobSettings({ ...paymobSettings, hmac_secret: e.target.value })}
              placeholder="hmac_..."
            />
          </div>

          <Button onClick={handleSavePaymob} className="w-full" disabled={loading}>
            {loading ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ إعدادات Paymob' : 'Save Paymob Settings')}
          </Button>
        </div>
      </Card>

      {/* SMTP Settings */}
      <Card className="p-6 glass-effect">
        <div className="flex items-center gap-3 mb-6">
          <Key className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-semibold">
            {language === 'ar' ? 'إعدادات SMTP' : 'SMTP Settings'}
          </h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
            <div>
              <Label className="text-base font-medium">
                {language === 'ar' ? 'تفعيل البريد' : 'Enable Email'}
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                {language === 'ar' ? 'تفعيل إرسال الإيميلات' : 'Enable email sending'}
              </p>
            </div>
            <Switch
              checked={smtpSettings.is_enabled}
              onCheckedChange={(checked) => setSmtpSettings({ ...smtpSettings, is_enabled: checked })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>{language === 'ar' ? 'خادم SMTP' : 'SMTP Host'}</Label>
              <Input
                value={smtpSettings.host}
                onChange={(e) => setSmtpSettings({ ...smtpSettings, host: e.target.value })}
                placeholder="smtp.gmail.com"
              />
            </div>
            <div>
              <Label>{language === 'ar' ? 'المنفذ' : 'Port'}</Label>
              <Input
                type="number"
                value={smtpSettings.port}
                onChange={(e) => setSmtpSettings({ ...smtpSettings, port: parseInt(e.target.value) || 587 })}
                placeholder="587"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>{language === 'ar' ? 'اسم المستخدم' : 'Username'}</Label>
              <Input
                value={smtpSettings.username}
                onChange={(e) => setSmtpSettings({ ...smtpSettings, username: e.target.value })}
                placeholder="user@gmail.com"
              />
            </div>
            <div>
              <Label>{language === 'ar' ? 'كلمة المرور' : 'Password'}</Label>
              <Input
                type="password"
                value={smtpSettings.password}
                onChange={(e) => setSmtpSettings({ ...smtpSettings, password: e.target.value })}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>{language === 'ar' ? 'البريد المُرسل' : 'From Email'}</Label>
              <Input
                value={smtpSettings.from_email}
                onChange={(e) => setSmtpSettings({ ...smtpSettings, from_email: e.target.value })}
                placeholder="noreply@outfred.com"
              />
            </div>
            <div>
              <Label>{language === 'ar' ? 'اسم المُرسل' : 'From Name'}</Label>
              <Input
                value={smtpSettings.from_name}
                onChange={(e) => setSmtpSettings({ ...smtpSettings, from_name: e.target.value })}
                placeholder="Outfred"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSaveSMTP} className="flex-1" disabled={loading}>
              {loading ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ إعدادات SMTP' : 'Save SMTP Settings')}
            </Button>
            <Button variant="outline" onClick={() => setShowTestEmailDialog(true)} disabled={loading}>
              <Mail className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'إرسال رسالة تجريبية' : 'Send Test Email'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Test Email Dialog */}
      <Dialog open={showTestEmailDialog} onOpenChange={setShowTestEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {language === 'ar' ? 'إرسال رسالة تجريبية' : 'Send Test Email'}
            </DialogTitle>
            <DialogDescription>
              {language === 'ar' ? 'أدخل البريد الإلكتروني الذي تريد إرسال الرسالة التجريبية إليه' : 'Enter the email address where you want to send the test email'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label>{language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}</Label>
              <Input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleTestSMTP();
                  }
                }}
              />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setShowTestEmailDialog(false)}>
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button className="flex-1" onClick={handleTestSMTP} disabled={loading || !testEmail}>
                {loading ? (language === 'ar' ? 'جاري الإرسال...' : 'Sending...') : (language === 'ar' ? 'إرسال' : 'Send')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
