import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Separator } from '../components/ui/separator';
import { Settings, Upload, Save, Eye, Globe, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface AdminSiteSettingsProps {
  onNavigate: (page: string) => void;
}

export const AdminSiteSettings: React.FC<AdminSiteSettingsProps> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const [siteLogo, setSiteLogo] = useState('');
  const [siteName, setSiteName] = useState('Outfred');
  const [siteTagline, setSiteTagline] = useState('');
  
  const [headerLinks, setHeaderLinks] = useState([
    { name: 'Home', nameAr: 'الرئيسية', url: '/' },
    { name: 'Products', nameAr: 'المنتجات', url: '/products' },
    { name: 'Merchants', nameAr: 'المتاجر', url: '/merchants' },
  ]);
  
  const [footerText, setFooterText] = useState('© 2024 Outfred. All rights reserved.');
  const [footerTextAr, setFooterTextAr] = useState('© 2024 أوتفريد. جميع الحقوق محفوظة.');
  
  const [footerLinks, setFooterLinks] = useState([
    { name: 'About', nameAr: 'من نحن', url: '/about' },
    { name: 'Contact', nameAr: 'تواصل معنا', url: '/contact' },
    { name: 'Privacy', nameAr: 'سياسة الخصوصية', url: '/privacy' },
  ]);
  
  const [homePageContent, setHomePageContent] = useState({
    hero: 'Discover Fashion with AI',
    heroAr: 'اكتشف الموضة مع الذكاء الاصطناعي',
    subtitle: 'Smart search, image recognition, and AI-powered outfit generation',
    subtitleAr: 'بحث ذكي، تعرف على الصور، وتوليد ملابس بالذكاء الاصطناعي',
  });
  
  const [aboutPageContent, setAboutPageContent] = useState('');
  const [aboutPageContentAr, setAboutPageContentAr] = useState('');
  
  const [contactPageContent, setContactPageContent] = useState('');
  const [contactPageContentAr, setContactPageContentAr] = useState('');
  
  const [privacyPageContent, setPrivacyPageContent] = useState('');
  const [privacyPageContentAr, setPrivacyPageContentAr] = useState('');

  const handleLogoUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e: any) => {
      const file = e.target?.files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setSiteLogo(event.target?.result as string);
        toast.success(isRTL ? 'تم رفع الشعار' : 'Logo uploaded');
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleSave = () => {
    const settings = {
      siteLogo,
      siteName,
      siteTagline,
      headerLinks,
      footerText,
      footerTextAr,
      footerLinks,
      homePageContent,
      aboutPageContent,
      aboutPageContentAr,
      contactPageContent,
      contactPageContentAr,
      privacyPageContent,
      privacyPageContentAr,
    };
    
    localStorage.setItem('siteSettings', JSON.stringify(settings));
    toast.success(isRTL ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully');
  };

  React.useEffect(() => {
    const savedSettings = localStorage.getItem('siteSettings');
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);
      setSiteLogo(parsed.siteLogo || '');
      setSiteName(parsed.siteName || 'Outfred');
      setSiteTagline(parsed.siteTagline || '');
      setHeaderLinks(parsed.headerLinks || headerLinks);
      setFooterText(parsed.footerText || footerText);
      setFooterTextAr(parsed.footerTextAr || footerTextAr);
      setFooterLinks(parsed.footerLinks || footerLinks);
      setHomePageContent(parsed.homePageContent || homePageContent);
      setAboutPageContent(parsed.aboutPageContent || '');
      setAboutPageContentAr(parsed.aboutPageContentAr || '');
      setContactPageContent(parsed.contactPageContent || '');
      setContactPageContentAr(parsed.contactPageContentAr || '');
      setPrivacyPageContent(parsed.privacyPageContent || '');
      setPrivacyPageContentAr(parsed.privacyPageContentAr || '');
    }
  }, []);

  return (
    <div className="min-h-screen bg-background py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 text-primary" />
            <h1 className="text-3xl">{isRTL ? 'إعدادات الموقع' : 'Site Settings'}</h1>
          </div>
          <Button onClick={handleSave} className="gap-2">
            <Save className="w-4 h-4" />
            {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
          </Button>
        </div>

        <Tabs defaultValue="branding" className="w-full">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="branding">{isRTL ? 'العلامة التجارية' : 'Branding'}</TabsTrigger>
            <TabsTrigger value="navigation">{isRTL ? 'التنقل' : 'Navigation'}</TabsTrigger>
            <TabsTrigger value="content">{isRTL ? 'المحتوى' : 'Content'}</TabsTrigger>
            <TabsTrigger value="pages">{isRTL ? 'الصفحات' : 'Pages'}</TabsTrigger>
          </TabsList>

          <TabsContent value="branding" className="mt-6">
            <Card className="p-6">
              <h2 className="text-xl mb-6">{isRTL ? 'العلامة التجارية والشعار' : 'Branding & Logo'}</h2>
              
              <div className="space-y-6">
                <div>
                  <Label className="mb-3 block">{isRTL ? 'شعار الموقع' : 'Site Logo'}</Label>
                  {siteLogo && (
                    <div className="mb-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                      <img src={siteLogo} alt="Site Logo" className="h-16 object-contain" />
                    </div>
                  )}
                  <Button onClick={handleLogoUpload} variant="outline" className="gap-2">
                    <Upload className="w-4 h-4" />
                    {isRTL ? 'رفع شعار جديد' : 'Upload New Logo'}
                  </Button>
                </div>

                <div>
                  <Label>{isRTL ? 'اسم الموقع' : 'Site Name'}</Label>
                  <Input
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    placeholder="Outfred"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>{isRTL ? 'الشعار (إنجليزي)' : 'Tagline (English)'}</Label>
                  <Input
                    value={siteTagline}
                    onChange={(e) => setSiteTagline(e.target.value)}
                    placeholder="Discover Fashion with AI"
                    className="mt-2"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="navigation" className="mt-6">
            <Card className="p-6">
              <h2 className="text-xl mb-6">{isRTL ? 'إعدادات الهيدر والفوتر' : 'Header & Footer Settings'}</h2>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg mb-4">{isRTL ? 'روابط الهيدر' : 'Header Links'}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {isRTL ? 'سيتم تطبيق هذه الروابط في الإصدارات المستقبلية' : 'These links will be applied in future updates'}
                  </p>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg mb-4">{isRTL ? 'الفوتر' : 'Footer'}</h3>
                  <div className="space-y-4">
                    <div>
                      <Label>{isRTL ? 'نص الفوتر (إنجليزي)' : 'Footer Text (English)'}</Label>
                      <Input
                        value={footerText}
                        onChange={(e) => setFooterText(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label>{isRTL ? 'نص الفوتر (عربي)' : 'Footer Text (Arabic)'}</Label>
                      <Input
                        value={footerTextAr}
                        onChange={(e) => setFooterTextAr(e.target.value)}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="mt-6">
            <Card className="p-6">
              <h2 className="text-xl mb-6">{isRTL ? 'محتوى الصفحة الرئيسية' : 'Homepage Content'}</h2>
              
              <div className="space-y-6">
                <div>
                  <Label>{isRTL ? 'العنوان الرئيسي (إنجليزي)' : 'Main Heading (English)'}</Label>
                  <Input
                    value={homePageContent.hero}
                    onChange={(e) => setHomePageContent({...homePageContent, hero: e.target.value})}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>{isRTL ? 'العنوان الرئيسي (عربي)' : 'Main Heading (Arabic)'}</Label>
                  <Input
                    value={homePageContent.heroAr}
                    onChange={(e) => setHomePageContent({...homePageContent, heroAr: e.target.value})}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>{isRTL ? 'العنوان الفرعي (إنجليزي)' : 'Subtitle (English)'}</Label>
                  <Input
                    value={homePageContent.subtitle}
                    onChange={(e) => setHomePageContent({...homePageContent, subtitle: e.target.value})}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>{isRTL ? 'العنوان الفرعي (عربي)' : 'Subtitle (Arabic)'}</Label>
                  <Input
                    value={homePageContent.subtitleAr}
                    onChange={(e) => setHomePageContent({...homePageContent, subtitleAr: e.target.value})}
                    className="mt-2"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="pages" className="mt-6">
            <div className="space-y-6">
              <Card className="p-6">
                <h2 className="text-xl mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {isRTL ? 'صفحة من نحن' : 'About Page'}
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label>{isRTL ? 'المحتوى (إنجليزي)' : 'Content (English)'}</Label>
                    <Textarea
                      value={aboutPageContent}
                      onChange={(e) => setAboutPageContent(e.target.value)}
                      placeholder={isRTL ? 'أدخل محتوى صفحة من نحن...' : 'Enter about page content...'}
                      className="mt-2 min-h-[150px]"
                    />
                  </div>
                  <div>
                    <Label>{isRTL ? 'المحتوى (عربي)' : 'Content (Arabic)'}</Label>
                    <Textarea
                      value={aboutPageContentAr}
                      onChange={(e) => setAboutPageContentAr(e.target.value)}
                      placeholder={isRTL ? 'أدخل محتوى صفحة من نحن...' : 'Enter about page content...'}
                      className="mt-2 min-h-[150px]"
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {isRTL ? 'صفحة تواصل معنا' : 'Contact Page'}
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label>{isRTL ? 'المحتوى (إنجليزي)' : 'Content (English)'}</Label>
                    <Textarea
                      value={contactPageContent}
                      onChange={(e) => setContactPageContent(e.target.value)}
                      placeholder={isRTL ? 'أدخل محتوى صفحة تواصل معنا...' : 'Enter contact page content...'}
                      className="mt-2 min-h-[150px]"
                    />
                  </div>
                  <div>
                    <Label>{isRTL ? 'المحتوى (عربي)' : 'Content (Arabic)'}</Label>
                    <Textarea
                      value={contactPageContentAr}
                      onChange={(e) => setContactPageContentAr(e.target.value)}
                      placeholder={isRTL ? 'أدخل محتوى صفحة تواصل معنا...' : 'Enter contact page content...'}
                      className="mt-2 min-h-[150px]"
                    />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {isRTL ? 'صفحة سياسة الخصوصية' : 'Privacy Policy Page'}
                </h2>
                <div className="space-y-4">
                  <div>
                    <Label>{isRTL ? 'المحتوى (إنجليزي)' : 'Content (English)'}</Label>
                    <Textarea
                      value={privacyPageContent}
                      onChange={(e) => setPrivacyPageContent(e.target.value)}
                      placeholder={isRTL ? 'أدخل محتوى صفحة سياسة الخصوصية...' : 'Enter privacy policy content...'}
                      className="mt-2 min-h-[150px]"
                    />
                  </div>
                  <div>
                    <Label>{isRTL ? 'المحتوى (عربي)' : 'Content (Arabic)'}</Label>
                    <Textarea
                      value={privacyPageContentAr}
                      onChange={(e) => setPrivacyPageContentAr(e.target.value)}
                      placeholder={isRTL ? 'أدخل محتوى صفحة سياسة الخصوصية...' : 'Enter privacy policy content...'}
                      className="mt-2 min-h-[150px]"
                    />
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
