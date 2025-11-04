import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';
import { Alert, AlertDescription } from '../components/ui/alert';
import { User, Mail, Lock, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export const AccountSettings: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [emailVerified, setEmailVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(language === 'ar' ? 'تم تحديث الملف الشخصي' : 'Profile updated successfully');
    } catch (error) {
      toast.error(language === 'ar' ? 'فشل التحديث' : 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error(language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(language === 'ar' ? 'تم تغيير كلمة المرور' : 'Password changed successfully');
      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(language === 'ar' ? 'فشل تغيير كلمة المرور' : 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleSendVerificationEmail = async () => {
    setLoading(true);
    try {
      // TODO: Implement actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(language === 'ar' ? 'تم إرسال رسالة التحقق' : 'Verification email sent');
    } catch (error) {
      toast.error(language === 'ar' ? 'فشل إرسال رسالة التحقق' : 'Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">
            {language === 'ar' ? 'إعدادات الحساب' : 'Account Settings'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ar' ? 'إدارة معلومات حسابك وإعدادات الأمان' : 'Manage your account information and security settings'}
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Profile Information */}
          <Card className="p-6 glass-effect">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold">
                {language === 'ar' ? 'المعلومات الشخصية' : 'Profile Information'}
              </h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>{language === 'ar' ? 'الاسم' : 'Name'}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={language === 'ar' ? 'أدخل اسمك' : 'Enter your name'}
                />
              </div>
              
              <div>
                <Label>{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                />
              </div>

              {!emailVerified && (
                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>
                      {language === 'ar' ? 'البريد الإلكتروني غير مفعّل' : 'Email not verified'}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleSendVerificationEmail}
                      disabled={loading}
                    >
                      {language === 'ar' ? 'إرسال رسالة التفعيل' : 'Send Verification Email'}
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
              
              <Button onClick={handleUpdateProfile} disabled={loading} className="w-full">
                {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
              </Button>
            </div>
          </Card>

          {/* Password Change */}
          <Card className="p-6 glass-effect">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold">
                {language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
              </h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>{language === 'ar' ? 'كلمة المرور الحالية' : 'Current Password'}</Label>
                <Input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              
              <div>
                <Label>{language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}</Label>
                <Input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              
              <div>
                <Label>{language === 'ar' ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'}</Label>
                <Input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              
              <Button onClick={handleChangePassword} disabled={loading} className="w-full">
                {language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
              </Button>
            </div>
          </Card>

          {/* Social Accounts */}
          <Card className="p-6 glass-effect">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold">
                {language === 'ar' ? 'الحسابات الاجتماعية' : 'Social Accounts'}
              </h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-red-600 dark:text-red-300" />
                  </div>
                  <div>
                    <p className="font-medium">Google</p>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' ? 'غير متصل' : 'Not connected'}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  {language === 'ar' ? 'ربط الحساب' : 'Connect'}
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div>
                    <p className="font-medium">Facebook</p>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' ? 'غير متصل' : 'Not connected'}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  {language === 'ar' ? 'ربط الحساب' : 'Connect'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
