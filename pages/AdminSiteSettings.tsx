import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Settings, Globe, Image as ImageIcon, Link as LinkIcon, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export const AdminSiteSettings: React.FC = () => {
  const { language } = useLanguage();
  
  const [seoSettings, setSeoSettings] = useState(() => {
    const saved = localStorage.getItem('siteSettings_seo');
    return saved ? JSON.parse(saved) : {
      titleAr: 'Outfred - اكتشف الأزياء بالذكاء الاصطناعي',
      titleEn: 'Outfred - Discover Fashion with AI',
      descriptionAr: 'منصة اكتشاف الأزياء المدعومة بالذكاء الاصطناعي للبحث الذكي والتسوق',
      descriptionEn: 'AI-powered fashion discovery platform for smart search and shopping',
      keywords: 'fashion, AI, discovery, outfits, shopping, تسوق, أزياء',
      faviconUrl: '',
      logoUrl: '',
    };
  });

  const [socialLinks, setSocialLinks] = useState(() => {
    const saved = localStorage.getItem('siteSettings_social');
    return saved ? JSON.parse(saved) : {
      facebook: 'https://facebook.com/outfred',
      instagram: 'https://instagram.com/outfred',
      twitter: 'https://twitter.com/outfred',
      linkedin: 'https://linkedin.com/company/outfred',
      youtube: '',
      tiktok: '',
    };
  });

  const [contactInfo, setContactInfo] = useState(() => {
    const saved = localStorage.getItem('siteSettings_contact');
    return saved ? JSON.parse(saved) : {
      email: 'contact@outfred.com',
      phone: '+1 (555) 123-4567',
      addressAr: 'شارع الموضة 123، الرياض، السعودية',
      addressEn: '123 Fashion Street, Riyadh, Saudi Arabia',
    };
  });

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSeoSettings({ ...seoSettings, logoUrl: reader.result as string });
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
        setSeoSettings({ ...seoSettings, faviconUrl: reader.result as string });
        toast.success(language === 'ar' ? 'تم رفع Favicon' : 'Favicon uploaded');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSEO = () => {
    localStorage.setItem('siteSettings_seo', JSON.stringify(seoSettings));
    toast.success(language === 'ar' ? 'تم حفظ إعدادات SEO' : 'SEO settings saved');
  };

  const handleSaveSocial = () => {
    localStorage.setItem('siteSettings_social', JSON.stringify(socialLinks));
    toast.success(language === 'ar' ? 'تم حفظ الروابط الاجتماعية' : 'Social links saved');
  };

  const handleSaveContact = () => {
    localStorage.setItem('siteSettings_contact', JSON.stringify(contactInfo));
    toast.success(language === 'ar' ? 'تم حفظ معلومات التواصل' : 'Contact info saved');
  };

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
                      value={seoSettings.titleAr}
                      onChange={(e) => setSeoSettings({ ...seoSettings, titleAr: e.target.value })}
                      placeholder="Outfred - اكتشف الأزياء"
                      className="glass-effect"
                    />
                  </div>
                  <div>
                    <Label className="text-base font-semibold mb-2 block">
                      {language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}
                    </Label>
                    <Input
                      value={seoSettings.titleEn}
                      onChange={(e) => setSeoSettings({ ...seoSettings, titleEn: e.target.value })}
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
                      value={seoSettings.descriptionAr}
                      onChange={(e) => setSeoSettings({ ...seoSettings, descriptionAr: e.target.value })}
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
                      value={seoSettings.descriptionEn}
                      onChange={(e) => setSeoSettings({ ...seoSettings, descriptionEn: e.target.value })}
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

                <Button onClick={handleSaveSEO} className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white">
                  {language === 'ar' ? 'حفظ إعدادات SEO' : 'Save SEO Settings'}
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
                  {seoSettings.logoUrl && (
                    <div className="mt-4">
                      <img src={seoSettings.logoUrl} alt="Logo" className="h-16 object-contain" />
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
                  {seoSettings.faviconUrl && (
                    <div className="mt-4">
                      <img src={seoSettings.faviconUrl} alt="Favicon" className="w-8 h-8" />
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    {language === 'ar' ? 'الحجم الموصى به: 32x32 بكسل' : 'Recommended size: 32x32px'}
                  </p>
                </div>

                <Button onClick={handleSaveSEO} className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white">
                  {language === 'ar' ? 'حفظ الشعار' : 'Save Branding'}
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

                <Button onClick={handleSaveSocial} className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white">
                  {language === 'ar' ? 'حفظ الروابط الاجتماعية' : 'Save Social Links'}
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
                      value={contactInfo.addressAr}
                      onChange={(e) => setContactInfo({ ...contactInfo, addressAr: e.target.value })}
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
                      value={contactInfo.addressEn}
                      onChange={(e) => setContactInfo({ ...contactInfo, addressEn: e.target.value })}
                      placeholder="123 Fashion Street, Riyadh, Saudi Arabia"
                      className="glass-effect"
                      rows={3}
                    />
                  </div>
                </div>

                <Button onClick={handleSaveContact} className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white">
                  {language === 'ar' ? 'حفظ معلومات التواصل' : 'Save Contact Info'}
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
