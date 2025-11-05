import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Separator } from '../components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { User, Heart, Settings, Mail, Calendar, Save, Edit2, Bell, Lock, Eye, Shield, Store } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export const Account: React.FC<{ onNavigate?: (page: string) => void }> = ({ onNavigate }) => {
  const { t, language } = useLanguage();
  const { user, logout } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  // Dialogs
  const [showAccountSettings, setShowAccountSettings] = useState(false);
  const [showPrivacySettings, setShowPrivacySettings] = useState(false);

  // Account Settings
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Privacy Settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showFavorites: true,
    allowMessaging: true,
    dataSharing: false,
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-12 text-center glass-effect border-border">
          <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="mb-2">Please Log In</h3>
          <p className="text-muted-foreground">
            You need to be logged in to view your account
          </p>
        </Card>
      </div>
    );
  }

  const handleSaveProfile = () => {
    // Simulate saving profile
    toast.success('Profile updated successfully!');
    setIsEditingProfile(false);
  };

  const handleChangePassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error(language === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error(language === 'ar' ? 'كلمة المرور قصيرة جداً' : 'Password too short');
      return;
    }
    toast.success(language === 'ar' ? 'تم تغيير كلمة المرور' : 'Password changed successfully');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setShowAccountSettings(false);
  };

  const handlePrivacyToggle = (key: string) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
    toast.success(language === 'ar' ? 'تم تحديث الخصوصية' : 'Privacy settings updated');
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <User className="w-10 h-10 text-primary-foreground" />
              </div>
              <div>
                <h1 className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {user.name}
                </h1>
                <p className="text-muted-foreground">{user.email}</p>
                <p className="text-sm text-muted-foreground capitalize">
                  {user.role === 'merchant' 
                    ? (language === 'ar' ? '👨‍💼 تاجر' : '👨‍💼 Merchant')
                    : user.role === 'admin'
                    ? (language === 'ar' ? '👑 مدير' : '👑 Admin')
                    : (language === 'ar' ? '👤 مستخدم' : '👤 User')}
                </p>
              </div>
            </div>
            
            {/* Merchant Dashboard Button */}
            {user.role === 'merchant' && onNavigate && (
              <Button
                onClick={() => onNavigate('my-store')}
                className="bg-gradient-to-r from-primary to-accent text-primary-foreground gap-2"
              >
                <Store className="w-4 h-4" />
                {language === 'ar' ? 'لوحة تحكم المتجر' : 'Store Dashboard'}
              </Button>
            )}
          </div>
        </motion.div>

        {/* Merchant Dashboard Card - Full Width */}
        {user.role === 'merchant' && onNavigate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <Card className="p-8 glass-effect border-border bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Store className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                      {language === 'ar' ? 'لوحة تحكم المتجر' : 'Merchant Dashboard'}
                    </h2>
                    <p className="text-muted-foreground">
                      {language === 'ar' 
                        ? 'إدارة متجرك، منتجاتك، وإحصائياتك' 
                        : 'Manage your store, products, and analytics'}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => onNavigate('my-store')}
                  className="bg-gradient-to-r from-primary to-accent text-primary-foreground gap-2 px-8 py-6 text-lg"
                  size="lg"
                >
                  <Store className="w-5 h-5" />
                  {language === 'ar' ? 'افتح لوحة التحكم' : 'Open Dashboard'}
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 glass-effect border-border">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <User className="w-6 h-6 text-primary" />
                  <h2>Profile Information</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingProfile(!isEditingProfile)}
                  className="gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  {isEditingProfile ? 'Cancel' : 'Edit'}
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">Name</label>
                  {isEditingProfile ? (
                    <Input
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="mt-1 bg-input-background"
                    />
                  ) : (
                    <p className="mt-1">{user.name}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-muted-foreground flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  {isEditingProfile ? (
                    <Input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="mt-1 bg-input-background"
                    />
                  ) : (
                    <p className="mt-1">{user.email}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Role</label>
                  <p className="mt-1 capitalize">{user.role}</p>
                </div>

                {isEditingProfile && (
                  <Button 
                    className="w-full mt-4 bg-gradient-to-r from-primary to-accent text-primary-foreground gap-2"
                    onClick={handleSaveProfile}
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Settings */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 glass-effect border-border">
              <div className="flex items-center gap-3 mb-6">
                <Settings className="w-6 h-6 text-primary" />
                <h2>{t('settings')}</h2>
              </div>

              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2 border-border hover:bg-secondary"
                  onClick={() => setShowAccountSettings(true)}
                >
                  <Settings className="w-4 h-4" />
                  {language === 'ar' ? 'إعدادات الحساب' : 'Account Settings'}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2 border-border hover:bg-secondary"
                  onClick={() => setShowPrivacySettings(true)}
                >
                  <Shield className="w-4 h-4" />
                  {language === 'ar' ? 'إعدادات الخصوصية' : 'Privacy Settings'}
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Favorites */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 glass-effect border-border">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-6 h-6 text-accent" />
                <h2>{t('favorites')}</h2>
              </div>

              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No favorite items yet. Start browsing and add products to your favorites!
                </p>
                <Button 
                  className="mt-4 bg-gradient-to-r from-primary to-accent text-primary-foreground"
                  onClick={() => window.location.href = '/merchants'}
                >
                  Browse Merchants
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Account Settings Dialog */}
        <Dialog open={showAccountSettings} onOpenChange={setShowAccountSettings}>
          <DialogContent className="glass-effect border-border">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                {language === 'ar' ? 'إعدادات الحساب' : 'Account Settings'}
              </DialogTitle>
              <DialogDescription>
                {language === 'ar' 
                  ? 'إدارة إعدادات حسابك وكلمة المرور' 
                  : 'Manage your account settings and password'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              <div>
                <h4 className="mb-4 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  {language === 'ar' ? 'تغيير كلمة المرور' : 'Change Password'}
                </h4>
                <div className="space-y-4">
                  <div>
                    <Label>{language === 'ar' ? 'كلمة المرور الحالية' : 'Current Password'}</Label>
                    <Input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="bg-input-background"
                    />
                  </div>
                  <div>
                    <Label>{language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}</Label>
                    <Input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="bg-input-background"
                    />
                  </div>
                  <div>
                    <Label>{language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}</Label>
                    <Input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="bg-input-background"
                    />
                  </div>
                  <Button
                    onClick={handleChangePassword}
                    className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground"
                  >
                    {language === 'ar' ? 'تحديث كلمة المرور' : 'Update Password'}
                  </Button>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="mb-4">{language === 'ar' ? 'الإجراءات الخطرة' : 'Danger Zone'}</h4>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => {
                    if (confirm(language === 'ar' ? 'هل تريد حذف حسابك؟' : 'Delete your account?')) {
                      toast.error(language === 'ar' ? 'ميزة قادمة' : 'Feature coming soon');
                    }
                  }}
                >
                  {language === 'ar' ? 'حذف الحساب' : 'Delete Account'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Privacy Settings Dialog */}
        <Dialog open={showPrivacySettings} onOpenChange={setShowPrivacySettings}>
          <DialogContent className="glass-effect border-border">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {language === 'ar' ? 'إعدادات الخصوصية' : 'Privacy Settings'}
              </DialogTitle>
              <DialogDescription>
                {language === 'ar' 
                  ? 'تحكم في خصوصيتك وما يمكن للآخرين رؤيته' 
                  : 'Control your privacy and what others can see'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4>{language === 'ar' ? 'إظهار البريد الإلكتروني' : 'Show Email'}</h4>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' 
                      ? 'اجعل بريدك مرئياً للآخرين' 
                      : 'Make your email visible to others'}
                  </p>
                </div>
                <Switch
                  checked={privacySettings.showEmail}
                  onCheckedChange={() => handlePrivacyToggle('showEmail')}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4>{language === 'ar' ? 'إظهار المفضلات' : 'Show Favorites'}</h4>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' 
                      ? 'السماح للآخرين برؤية منتجاتك المفضلة' 
                      : 'Let others see your favorite products'}
                  </p>
                </div>
                <Switch
                  checked={privacySettings.showFavorites}
                  onCheckedChange={() => handlePrivacyToggle('showFavorites')}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4>{language === 'ar' ? 'السماح بالرسائل' : 'Allow Messaging'}</h4>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' 
                      ? 'السماح للآخرين بإرسال رسائل لك' 
                      : 'Allow others to send you messages'}
                  </p>
                </div>
                <Switch
                  checked={privacySettings.allowMessaging}
                  onCheckedChange={() => handlePrivacyToggle('allowMessaging')}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <h4>{language === 'ar' ? 'مشاركة البيانات' : 'Data Sharing'}</h4>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' 
                      ? 'مشاركة البيانات لتحسين التجربة' 
                      : 'Share data to improve experience'}
                  </p>
                </div>
                <Switch
                  checked={privacySettings.dataSharing}
                  onCheckedChange={() => handlePrivacyToggle('dataSharing')}
                />
              </div>

              <Separator />

              <div>
                <h4 className="mb-2">{language === 'ar' ? 'رؤية الملف الشخصي' : 'Profile Visibility'}</h4>
                <div className="space-y-2">
                  <Button
                    variant={privacySettings.profileVisibility === 'public' ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => {
                      setPrivacySettings({ ...privacySettings, profileVisibility: 'public' });
                      toast.success(language === 'ar' ? 'ملفك عام' : 'Profile is public');
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    {language === 'ar' ? 'عام' : 'Public'}
                  </Button>
                  <Button
                    variant={privacySettings.profileVisibility === 'private' ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => {
                      setPrivacySettings({ ...privacySettings, profileVisibility: 'private' });
                      toast.success(language === 'ar' ? 'ملفك خاص' : 'Profile is private');
                    }}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    {language === 'ar' ? 'خاص' : 'Private'}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
