import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Settings, Globe, Image as ImageIcon, Link as LinkIcon, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { siteSettingsApi } from '../utils/adminApi';

export const AdminSiteSettings: React.FC = () => {
  const { language } = useLanguage();
  
  const [seoSettings, setSeoSettings] = useState({
    title_ar: 'Outfred - اكتشف الأزياء بالذكاء الاصطناعي',
    title_en: 'Outfred - Discover Fashion with AI',
    description_ar: 'منصة اكتشاف الأزياء المدعومة بالذكاء الاصطناعي للبحث الذكي والتسوق',
    description_en: 'AI-powered fashion discovery platform for smart search and shopping',
    keywords: 'fashion, AI, discovery, outfits, shopping, تسوق, أزياء',
    favicon_url: '',
    logo_url: '',
  });

  const [socialLinks, setSocialLinks] = useState({
    facebook: 'https://facebook.com/outfred',
    instagram: 'https://instagram.com/outfred',
    twitter: 'https://twitter.com/outfred',
    linkedin: 'https://linkedin.com/company/outfred',
    youtube: '',
    tiktok: '',
  });

  const [contactInfo, setContactInfo] = useState({
    email: 'contact@outfred.com',
    phone: '+1 (555) 123-4567',
    address_ar: 'شارع الموضة 123، الرياض، السعودية',
    address_en: '123 Fashion Street, Riyadh, Saudi Arabia',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await siteSettingsApi.getAll();
      
      if (response.settings) {
        const settings = response.settings;
        
        if (settings.seo) {
          setSeoSettings(settings.seo);
        }
        if (settings.social) {
          setSocialLinks(settings.social);
        }
        if (settings.contact) {
          setContactInfo(settings.contact);
        }
      }
    } catch (error) {
      console.error('Failed to load site settings:', error);
      toast.error(language === 'ar' ? 'فشل تحميل الإعدادات' : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSeoSettings({ ...seoSettings, logo_url: reader.result as string });
        toast.success(language === 'ar' ? 'تم رفع اللوجو' : 'Logo uploaded');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSeoSettings({ ...seoSettings, favicon_url: reader.result as string });
        toast.success(language === 'ar' ? 'تم رفع Favicon' : 'Favicon uploaded');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSEO = async () => {
    try {
      setLoading(true);
      await siteSettingsApi.update('seo', seoSettings);
      toast.success(language === 'ar' ? 'تم حفظ إعدادات SEO' : 'SEO settings saved');
    } catch (error) {
      console.error('Failed to save SEO settings:', error);
      toast.error(language === 'ar' ? 'فشل حفظ إعدادات SEO' : 'Failed to save SEO settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSocial = async () => {
    try {
      setLoading(true);
      await siteSettingsApi.update('social', socialLinks);
      toast.success(language === 'ar' ? 'تم حفظ الروابط الاجتماعية' : 'Social links saved');
    } catch (error) {
      console.error('Failed to save social links:', error);
      toast.error(language === 'ar' ? 'فشل حفظ الروابط الاجتماعية' : 'Failed to save social links');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContact = async () => {
    try {
      setLoading(true);
      await siteSettingsApi.update('contact', contactInfo);
      toast.success(language === 'ar' ? 'تم حفظ معلومات التواصل' : 'Contact info saved');
    } catch (error) {
      console.error('Failed to save contact info:', error);
      toast.error(language === 'ar' ? 'فشل حفظ معلومات التواصل' : 'Failed to save contact info');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !seoSettings.title_ar) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-muted-foreground">
          {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => window.location.hash = 'admin'}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === 'ar' ? 'العودة للوحة التحكم' : 'Back to Dashboard'}
          </Button>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                {language === 'ar' ? 'إعدادات الموقع' : 'Site Settings'}
              </h1>
              <p className="text-muted-foreground">
                {language === 'ar' ? 'إدارة SEO، اللوجو، والروابط الاجتماعية' : 'Manage SEO, logo, and social links'}
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="seo" className="space-y-6">
          <TabsList className="glass-effect border-border p-2">
            <TabsTrigger value="seo" className="gap-2">
              <Globe className="w-4 h-4" />
              {language === 'ar' ? 'SEO' : 'SEO'}
            </TabsTrigger>
            <TabsTrigger value="branding" className="gap-2">
              <ImageIcon className="w-4 h-4" />
              {language === 'ar' ? 'الشعار' : 'Branding'}
            </TabsTrigger>
            <TabsTrigger value="social" className="gap-2">
              <LinkIcon className="w-4 h-4" />
              {language === 'ar' ? 'روابط التواصل' : 'Social Links'}
            </TabsTrigger>
            <TabsTrigger value="contact" className="gap-2">
              <Settings className="w-4 h-4" />
              {language === 'ar' ? 'معلومات التواصل' : 'Contact Info'}
            </TabsTrigger>
          </TabsList>

          {/* SEO Settings */}
          <TabsContent value="seo">
            <Card className="p-6 glass-effect border-border">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-base font-semibold mb-2 block">
                      {language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}
                    </Label>
                    <Input
                      value={seoSettings.title_ar}
                      onChange={(e) => setSeoSettings({ ...seoSettings, title_ar: e.target.value })}
                      placeholder="Outfred - اكتشف الأزياء"
                      className="glass-effect"
                    />
                  </div>
                  <div>
                    <Label className="text-base font-semibold mb-2 block">
                      {language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}
                    </Label>
                    <Input
                      value={seoSettings.title_en}
                      onChange={(e) => setSeoSettings({ ...seoSettings, title_en: e.target.value })}
                      placeholder="Outfred - Discover Fashion"
                      className="glass-effect"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-base font-semibold mb-2 block">
                      {language === 'ar' ? 'الوصف (عربي)' : 'Description (Arabic)'}
                    </Label>
                    <Textarea
                      value={seoSettings.description_ar}
                      onChange={(e) => setSeoSettings({ ...seoSettings, description_ar: e.target.value })}
                      rows={4}
                      placeholder="منصة اكتشاف الأزياء المدعومة بالذكاء الاصطناعي..."
                      className="glass-effect"
                    />
                  </div>
                  <div>
                    <Label className="text-base font-semibold mb-2 block">
                      {language === 'ar' ? 'الوصف (إنجليزي)' : 'Description (English)'}
                    </Label>
                    <Textarea
                      value={seoSettings.description_en}
                      onChange={(e) => setSeoSettings({ ...seoSettings, description_en: e.target.value })}
                      rows={4}
                      placeholder="AI-powered fashion discovery platform..."
                      className="glass-effect"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-base font-semibold mb-2 block">
                    {language === 'ar' ? 'الكلمات المفتاحية' : 'Keywords'}
                  </Label>
                  <Input
                    value={seoSettings.keywords}
                    onChange={(e) => setSeoSettings({ ...seoSettings, keywords: e.target.value })}
                    placeholder="fashion, AI, shopping, تسوق, أزياء"
                    className="glass-effect"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {language === 'ar' ? 'افصل بفواصل' : 'Separate with commas'}
                  </p>
                </div>

                <Button onClick={handleSaveSEO} className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white" disabled={loading}>
                  {loading ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ إعدادات SEO' : 'Save SEO Settings')}
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Branding */}
          <TabsContent value="branding">
            <Card className="p-6 glass-effect border-border">
              <div className="space-y-6">
                <div>
                  <Label className="text-base font-semibold mb-2 block">
                    {language === 'ar' ? 'رفع اللوجو' : 'Upload Logo'}
                  </Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="glass-effect"
                  />
                  {seoSettings.logo_url && (
                    <div className="mt-4">
                      <img src={seoSettings.logo_url} alt="Logo" className="h-16 object-contain" />
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {language === 'ar' ? 'الحجم الموصى به: 200x60 بكسل' : 'Recommended size: 200x60px'}
                  </p>
                </div>

                <div>
                  <Label className="text-base font-semibold mb-2 block">
                    {language === 'ar' ? 'رفع Favicon' : 'Upload Favicon'}
                  </Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleFaviconUpload}
                    className="glass-effect"
                  />
                  {seoSettings.favicon_url && (
                    <div className="mt-4">
                      <img src={seoSettings.favicon_url} alt="Favicon" className="w-8 h-8" />
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {language === 'ar' ? 'الحجم الموصى به: 32x32 بكسل' : 'Recommended size: 32x32px'}
                  </p>
                </div>

                <Button onClick={handleSaveSEO} className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white" disabled={loading}>
                  {loading ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ الشعار' : 'Save Branding')}
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Social Links */}
          <TabsContent value="social">
            <Card className="p-6 glass-effect border-border">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-base font-semibold mb-2 block">Facebook</Label>
                    <Input
                      value={socialLinks.facebook}
                      onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                      placeholder="https://facebook.com/outfred"
                      className="glass-effect"
                    />
                  </div>
                  <div>
                    <Label className="text-base font-semibold mb-2 block">Instagram</Label>
                    <Input
                      value={socialLinks.instagram}
                      onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                      placeholder="https://instagram.com/outfred"
                      className="glass-effect"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-base font-semibold mb-2 block">Twitter</Label>
                    <Input
                      value={socialLinks.twitter}
                      onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                      placeholder="https://twitter.com/outfred"
                      className="glass-effect"
                    />
                  </div>
                  <div>
                    <Label className="text-base font-semibold mb-2 block">LinkedIn</Label>
                    <Input
                      value={socialLinks.linkedin}
                      onChange={(e) => setSocialLinks({ ...socialLinks, linkedin: e.target.value })}
                      placeholder="https://linkedin.com/company/outfred"
                      className="glass-effect"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-base font-semibold mb-2 block">YouTube</Label>
                    <Input
                      value={socialLinks.youtube}
                      onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                      placeholder="https://youtube.com/outfred"
                      className="glass-effect"
                    />
                  </div>
                  <div>
                    <Label className="text-base font-semibold mb-2 block">TikTok</Label>
                    <Input
                      value={socialLinks.tiktok}
                      onChange={(e) => setSocialLinks({ ...socialLinks, tiktok: e.target.value })}
                      placeholder="https://tiktok.com/@outfred"
                      className="glass-effect"
                    />
                  </div>
                </div>

                <Button onClick={handleSaveSocial} className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white" disabled={loading}>
                  {loading ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ الروابط الاجتماعية' : 'Save Social Links')}
                </Button>
              </div>
            </Card>
          </TabsContent>

          {/* Contact Info */}
          <TabsContent value="contact">
            <Card className="p-6 glass-effect border-border">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-base font-semibold mb-2 block">
                      {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                    </Label>
                    <Input
                      value={contactInfo.email}
                      onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                      placeholder="contact@outfred.com"
                      className="glass-effect"
                    />
                  </div>
                  <div>
                    <Label className="text-base font-semibold mb-2 block">
                      {language === 'ar' ? 'رقم الهاتف' : 'Phone'}
                    </Label>
                    <Input
                      value={contactInfo.phone}
                      onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                      className="glass-effect"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-base font-semibold mb-2 block">
                      {language === 'ar' ? 'العنوان (عربي)' : 'Address (Arabic)'}
                    </Label>
                    <Textarea
                      value={contactInfo.address_ar}
                      onChange={(e) => setContactInfo({ ...contactInfo, address_ar: e.target.value })}
                      placeholder="شارع الموضة 123، الرياض، السعودية"
                      className="glass-effect"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label className="text-base font-semibold mb-2 block">
                      {language === 'ar' ? 'العنوان (إنجليزي)' : 'Address (English)'}
                    </Label>
                    <Textarea
                      value={contactInfo.address_en}
                      onChange={(e) => setContactInfo({ ...contactInfo, address_en: e.target.value })}
                      placeholder="123 Fashion Street, Riyadh, Saudi Arabia"
                      className="glass-effect"
                      rows={3}
                    />
                  </div>
                </div>

                <Button onClick={handleSaveContact} className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white" disabled={loading}>
                  {loading ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ معلومات التواصل' : 'Save Contact Info')}
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
