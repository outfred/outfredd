import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { FileText, Save, Eye } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { cmsApi } from '../utils/adminApi';

export const AdminCMS: React.FC = () => {
  const { language } = useLanguage();
  
  const [pages, setPages] = useState({
    about: {
      title_ar: 'من نحن',
      title_en: 'About Us',
      content_ar: 'نحن منصة Outfred لاكتشاف الأزياء...',
      content_en: 'We are Outfred, a fashion discovery platform...',
    },
    privacy: {
      title_ar: 'سياسة الخصوصية',
      title_en: 'Privacy Policy',
      content_ar: 'سياسة الخصوصية الخاصة بنا...',
      content_en: 'Our privacy policy...',
    },
    contact: {
      title_ar: 'اتصل بنا',
      title_en: 'Contact Us',
      content_ar: 'للتواصل معنا...',
      content_en: 'To contact us...',
      email: 'contact@outfred.com',
      phone: '+1234567890',
      address: '123 Fashion Street',
    },
  });

  const [activeTab, setActiveTab] = useState('about');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      setLoading(true);
      const response = await cmsApi.getAll();
      
      if (response.pages) {
        setPages(response.pages);
      }
    } catch (error) {
      console.error('Failed to load CMS pages:', error);
      toast.error(language === 'ar' ? 'فشل تحميل الصفحات' : 'Failed to load pages');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (pageKey: string) => {
    try {
      setLoading(true);
      await cmsApi.updatePage(pageKey, pages[pageKey as keyof typeof pages]);
      toast.success(language === 'ar' ? 'تم حفظ الصفحة بنجاح' : 'Page saved successfully');
    } catch (error) {
      console.error('Failed to save page:', error);
      toast.error(language === 'ar' ? 'فشل حفظ الصفحة' : 'Failed to save page');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !pages.about.title_ar) {
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
          {language === 'ar' ? 'إدارة محتوى الموقع' : 'Content Management System'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {language === 'ar' ? 'تحرير صفحات الموقع الثابتة' : 'Edit static website pages'}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-2xl grid-cols-3">
          <TabsTrigger value="about">
            {language === 'ar' ? 'من نحن' : 'About Us'}
          </TabsTrigger>
          <TabsTrigger value="privacy">
            {language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
          </TabsTrigger>
          <TabsTrigger value="contact">
            {language === 'ar' ? 'اتصل بنا' : 'Contact Us'}
          </TabsTrigger>
        </TabsList>

        {/* About Page */}
        <TabsContent value="about">
          <Card className="p-6 glass-effect">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>{language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}</Label>
                  <Input
                    value={pages.about.title_ar}
                    onChange={(e) => setPages({
                      ...pages,
                      about: { ...pages.about, title_ar: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label>{language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}</Label>
                  <Input
                    value={pages.about.title_en}
                    onChange={(e) => setPages({
                      ...pages,
                      about: { ...pages.about, title_en: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div>
                <Label>{language === 'ar' ? 'المحتوى (عربي)' : 'Content (Arabic)'}</Label>
                <Textarea
                  value={pages.about.content_ar}
                  onChange={(e) => setPages({
                    ...pages,
                    about: { ...pages.about, content_ar: e.target.value }
                  })}
                  rows={10}
                  className="font-mono"
                />
              </div>

              <div>
                <Label>{language === 'ar' ? 'المحتوى (إنجليزي)' : 'Content (English)'}</Label>
                <Textarea
                  value={pages.about.content_en}
                  onChange={(e) => setPages({
                    ...pages,
                    about: { ...pages.about, content_en: e.target.value }
                  })}
                  rows={10}
                  className="font-mono"
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={() => handleSave('about')} className="flex-1" disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ' : 'Save')}
                </Button>
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  {language === 'ar' ? 'معاينة' : 'Preview'}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Privacy Page */}
        <TabsContent value="privacy">
          <Card className="p-6 glass-effect">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>{language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}</Label>
                  <Input
                    value={pages.privacy.title_ar}
                    onChange={(e) => setPages({
                      ...pages,
                      privacy: { ...pages.privacy, title_ar: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label>{language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}</Label>
                  <Input
                    value={pages.privacy.title_en}
                    onChange={(e) => setPages({
                      ...pages,
                      privacy: { ...pages.privacy, title_en: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div>
                <Label>{language === 'ar' ? 'المحتوى (عربي)' : 'Content (Arabic)'}</Label>
                <Textarea
                  value={pages.privacy.content_ar}
                  onChange={(e) => setPages({
                    ...pages,
                    privacy: { ...pages.privacy, content_ar: e.target.value }
                  })}
                  rows={10}
                  className="font-mono"
                />
              </div>

              <div>
                <Label>{language === 'ar' ? 'المحتوى (إنجليزي)' : 'Content (English)'}</Label>
                <Textarea
                  value={pages.privacy.content_en}
                  onChange={(e) => setPages({
                    ...pages,
                    privacy: { ...pages.privacy, content_en: e.target.value }
                  })}
                  rows={10}
                  className="font-mono"
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={() => handleSave('privacy')} className="flex-1" disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ' : 'Save')}
                </Button>
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  {language === 'ar' ? 'معاينة' : 'Preview'}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Contact Page */}
        <TabsContent value="contact">
          <Card className="p-6 glass-effect">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>{language === 'ar' ? 'العنوان (عربي)' : 'Title (Arabic)'}</Label>
                  <Input
                    value={pages.contact.title_ar}
                    onChange={(e) => setPages({
                      ...pages,
                      contact: { ...pages.contact, title_ar: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label>{language === 'ar' ? 'العنوان (إنجليزي)' : 'Title (English)'}</Label>
                  <Input
                    value={pages.contact.title_en}
                    onChange={(e) => setPages({
                      ...pages,
                      contact: { ...pages.contact, title_en: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</Label>
                  <Input
                    value={pages.contact.email}
                    onChange={(e) => setPages({
                      ...pages,
                      contact: { ...pages.contact, email: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label>{language === 'ar' ? 'الهاتف' : 'Phone'}</Label>
                  <Input
                    value={pages.contact.phone}
                    onChange={(e) => setPages({
                      ...pages,
                      contact: { ...pages.contact, phone: e.target.value }
                    })}
                  />
                </div>
                <div>
                  <Label>{language === 'ar' ? 'العنوان' : 'Address'}</Label>
                  <Input
                    value={pages.contact.address}
                    onChange={(e) => setPages({
                      ...pages,
                      contact: { ...pages.contact, address: e.target.value }
                    })}
                  />
                </div>
              </div>

              <div>
                <Label>{language === 'ar' ? 'المحتوى (عربي)' : 'Content (Arabic)'}</Label>
                <Textarea
                  value={pages.contact.content_ar}
                  onChange={(e) => setPages({
                    ...pages,
                    contact: { ...pages.contact, content_ar: e.target.value }
                  })}
                  rows={10}
                  className="font-mono"
                />
              </div>

              <div>
                <Label>{language === 'ar' ? 'المحتوى (إنجليزي)' : 'Content (English)'}</Label>
                <Textarea
                  value={pages.contact.content_en}
                  onChange={(e) => setPages({
                    ...pages,
                    contact: { ...pages.contact, content_en: e.target.value }
                    })}
                  rows={10}
                  className="font-mono"
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={() => handleSave('contact')} className="flex-1" disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ' : 'Save')}
                </Button>
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  {language === 'ar' ? 'معاينة' : 'Preview'}
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
