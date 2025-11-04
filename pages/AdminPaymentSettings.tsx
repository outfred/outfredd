import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { CreditCard, DollarSign, Key } from 'lucide-react';
import { toast } from 'sonner';

export const AdminPaymentSettings: React.FC = () => {
  const { language } = useLanguage();
  
  const [paymobSettings, setPaymobSettings] = useState({
    apiKey: '',
    secretKey: '',
    integrationId: '',
    iframeId: '',
    isEnabled: false,
    isTestMode: true,
  });

  const [smtpSettings, setSmtpSettings] = useState({
    host: '',
    port: '587',
    username: '',
    password: '',
    fromEmail: '',
    fromName: 'Outfred',
    isEnabled: false,
  });

  const handleSavePaymob = () => {
    toast.success(language === 'ar' ? 'تم حفظ إعدادات الدفع' : 'Payment settings saved');
  };

  const handleSaveSMTP = () => {
    toast.success(language === 'ar' ? 'تم حفظ إعدادات البريد' : 'Email settings saved');
  };

  const handleTestSMTP = async () => {
    toast.info(language === 'ar' ? 'جاري إرسال رسالة تجريبية...' : 'Sending test email...');
    // TODO: Implement test email
  };

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
              checked={paymobSettings.isEnabled}
              onCheckedChange={(checked) => setPaymobSettings({ ...paymobSettings, isEnabled: checked })}
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
              checked={paymobSettings.isTestMode}
              onCheckedChange={(checked) => setPaymobSettings({ ...paymobSettings, isTestMode: checked })}
            />
          </div>

          <div>
            <Label>{language === 'ar' ? 'مفتاح API' : 'API Key'}</Label>
            <Input
              type="password"
              value={paymobSettings.apiKey}
              onChange={(e) => setPaymobSettings({ ...paymobSettings, apiKey: e.target.value })}
              placeholder="ZXlKMGVYQWlPaUpL..."
            />
          </div>

          <div>
            <Label>{language === 'ar' ? 'المفتاح السري' : 'Secret Key'}</Label>
            <Input
              type="password"
              value={paymobSettings.secretKey}
              onChange={(e) => setPaymobSettings({ ...paymobSettings, secretKey: e.target.value })}
              placeholder="sk_..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>{language === 'ar' ? 'Integration ID' : 'Integration ID'}</Label>
              <Input
                value={paymobSettings.integrationId}
                onChange={(e) => setPaymobSettings({ ...paymobSettings, integrationId: e.target.value })}
                placeholder="123456"
              />
            </div>
            <div>
              <Label>{language === 'ar' ? 'Iframe ID' : 'Iframe ID'}</Label>
              <Input
                value={paymobSettings.iframeId}
                onChange={(e) => setPaymobSettings({ ...paymobSettings, iframeId: e.target.value })}
                placeholder="654321"
              />
            </div>
          </div>

          <Button onClick={handleSavePaymob} className="w-full">
            {language === 'ar' ? 'حفظ إعدادات Paymob' : 'Save Paymob Settings'}
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
              checked={smtpSettings.isEnabled}
              onCheckedChange={(checked) => setSmtpSettings({ ...smtpSettings, isEnabled: checked })}
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
                value={smtpSettings.port}
                onChange={(e) => setSmtpSettings({ ...smtpSettings, port: e.target.value })}
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
                value={smtpSettings.fromEmail}
                onChange={(e) => setSmtpSettings({ ...smtpSettings, fromEmail: e.target.value })}
                placeholder="noreply@outfred.com"
              />
            </div>
            <div>
              <Label>{language === 'ar' ? 'اسم المُرسل' : 'From Name'}</Label>
              <Input
                value={smtpSettings.fromName}
                onChange={(e) => setSmtpSettings({ ...smtpSettings, fromName: e.target.value })}
                placeholder="Outfred"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSaveSMTP} className="flex-1">
              {language === 'ar' ? 'حفظ إعدادات SMTP' : 'Save SMTP Settings'}
            </Button>
            <Button variant="outline" onClick={handleTestSMTP}>
              {language === 'ar' ? 'إرسال رسالة تجريبية' : 'Send Test Email'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
