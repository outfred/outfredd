import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Mail, ArrowLeft, Key, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'motion/react';

interface ForgotPasswordProps {
  onNavigate: (page: string) => void;
}

export const ForgotPassword: React.FC<ForgotPasswordProps> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const [step, setStep] = useState<'email' | 'code' | 'newpassword'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast.error(language === 'ar' ? 'الرجاء إدخال بريد إلكتروني صحيح' : 'Please enter a valid email');
      return;
    }

    try {
      setLoading(true);

      const { generateVerificationCode, sendEmail, emailTemplates } = await import('../utils/emailTemplates');
      const resetCode = generateVerificationCode();
      
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: any) => u.email === email);

      if (!user) {
        toast.error(language === 'ar' ? 'البريد الإلكتروني غير مسجل' : 'Email not registered');
        return;
      }

      localStorage.setItem(`reset_code_${email}`, JSON.stringify({
        code: resetCode,
        timestamp: Date.now(),
        expires: Date.now() + 15 * 60 * 1000
      }));

      const template = emailTemplates.passwordReset(user.name, resetCode, language);
      const result = await sendEmail(email, template.subject, template.body);

      if (result.success) {
        toast.success(language === 'ar' ? '✉️ تم إرسال كود التفعيل إلى بريدك' : '✉️ Verification code sent to your email');
        setStep('code');
      } else {
        toast.warning(language === 'ar' ? `⚠️ فشل إرسال البريد (${result.error}) - استخدم كود: ${resetCode}` : `⚠️ Email failed (${result.error}) - Use code: ${resetCode}`);
        console.log('🔐 Reset Code:', resetCode);
        setStep('code');
      }
    } catch (error) {
      console.error('Error sending reset code:', error);
      toast.error(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code || code.length !== 6) {
      toast.error(language === 'ar' ? 'الرجاء إدخال الكود المكون من 6 أرقام' : 'Please enter the 6-digit code');
      return;
    }

    try {
      const stored = JSON.parse(localStorage.getItem(`reset_code_${email}`) || '{}');

      if (!stored.code) {
        toast.error(language === 'ar' ? 'لم يتم إرسال كود' : 'No code was sent');
        return;
      }

      if (Date.now() > stored.expires) {
        toast.error(language === 'ar' ? 'انتهت صلاحية الكود' : 'Code expired');
        localStorage.removeItem(`reset_code_${email}`);
        setStep('email');
        return;
      }

      if (code !== stored.code) {
        toast.error(language === 'ar' ? 'الكود غير صحيح' : 'Invalid code');
        return;
      }

      toast.success(language === 'ar' ? '✅ تم التحقق بنجاح' : '✅ Verified successfully');
      setStep('newpassword');
    } catch (error) {
      console.error('Error verifying code:', error);
      toast.error(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      toast.error(language === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
      return;
    }

    try {
      setLoading(true);

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u: any) => u.email === email);

      if (userIndex === -1) {
        toast.error(language === 'ar' ? 'المستخدم غير موجود' : 'User not found');
        return;
      }

      users[userIndex].password = newPassword;
      localStorage.setItem('users', JSON.stringify(users));
      
      const userId = users[userIndex].id;
      const userData = JSON.parse(localStorage.getItem(`user_${userId}`) || '{}');
      userData.password = newPassword;
      localStorage.setItem(`user_${userId}`, JSON.stringify(userData));

      localStorage.removeItem(`reset_code_${email}`);

      toast.success(language === 'ar' ? '🎉 تم تغيير كلمة المرور بنجاح!' : '🎉 Password reset successfully!');
      
      setTimeout(() => {
        onNavigate('login');
      }, 1500);
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error(language === 'ar' ? 'حدث خطأ' : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Button
          variant="ghost"
          onClick={() => onNavigate('login')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Login'}
        </Button>

        <Card className="p-8 glass-effect border-border">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
              {step === 'email' && <Mail className="w-8 h-8 text-white" />}
              {step === 'code' && <Key className="w-8 h-8 text-white" />}
              {step === 'newpassword' && <CheckCircle className="w-8 h-8 text-white" />}
            </div>
            <h1 className="text-2xl font-bold">
              {step === 'email' && (language === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot Password?')}
              {step === 'code' && (language === 'ar' ? 'أدخل الكود' : 'Enter Code')}
              {step === 'newpassword' && (language === 'ar' ? 'كلمة مرور جديدة' : 'New Password')}
            </h1>
            <p className="text-muted-foreground mt-2">
              {step === 'email' && (language === 'ar' ? 'سنرسل لك كود لإعادة تعيين كلمة المرور' : "We'll send you a code to reset your password")}
              {step === 'code' && (language === 'ar' ? 'أدخل الكود المرسل إلى بريدك' : 'Enter the code sent to your email')}
              {step === 'newpassword' && (language === 'ar' ? 'أدخل كلمة المرور الجديدة' : 'Enter your new password')}
            </p>
          </div>

          {step === 'email' && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <Label>{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={language === 'ar' ? 'you@example.com' : 'you@example.com'}
                  required
                  className="glass-effect"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (language === 'ar' ? 'جاري الإرسال...' : 'Sending...') : (language === 'ar' ? 'إرسال الكود' : 'Send Code')}
              </Button>
            </form>
          )}

          {step === 'code' && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <Label>{language === 'ar' ? 'كود التفعيل' : 'Verification Code'}</Label>
                <Input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  maxLength={6}
                  required
                  className="glass-effect text-center text-2xl tracking-widest font-mono"
                />
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  {language === 'ar' ? 'الكود صالح لمدة 15 دقيقة' : 'Code valid for 15 minutes'}
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {language === 'ar' ? 'تحقق' : 'Verify'}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep('email')}
              >
                {language === 'ar' ? 'إرسال كود جديد' : 'Resend Code'}
              </Button>
            </form>
          )}

          {step === 'newpassword' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <Label>{language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={language === 'ar' ? '6+ أحرف' : '6+ characters'}
                  required
                  className="glass-effect"
                />
              </div>

              <div>
                <Label>{language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={language === 'ar' ? 'أعد كتابة كلمة المرور' : 'Re-enter password'}
                  required
                  className="glass-effect"
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'تغيير كلمة المرور' : 'Reset Password')}
              </Button>
            </form>
          )}
        </Card>
      </motion.div>
    </div>
  );
};
