import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Mail, Save, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';

interface EmailTemplate {
  id: string;
  name: string;
  subject_ar: string;
  subject_en: string;
  body_ar: string;
  body_en: string;
}

const defaultTemplates: EmailTemplate[] = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    subject_ar: 'مرحباً بك في Outfred! 🎉',
    subject_en: 'Welcome to Outfred! 🎉',
    body_ar: `<div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
  <div style="background: white; padding: 30px; border-radius: 10px;">
    <h1 style="color: #667eea; text-align: center;">مرحباً {{userName}}! 👋</h1>
    <p style="font-size: 16px; line-height: 1.6; color: #333;">
      نحن سعداء بانضمامك إلى <strong>Outfred</strong> - منصة اكتشاف الأزياء بالذكاء الاصطناعي!
    </p>
    <div style="background: #f7f7f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #667eea; margin-top: 0;">ما يمكنك فعله الآن:</h3>
      <ul style="line-height: 1.8;">
        <li>🔍 ابحث عن الأزياء باستخدام AI الذكي</li>
        <li>📸 ارفع صورة واحصل على منتجات مشابهة</li>
        <li>👔 احصل على توصيات أزياء مخصصة</li>
        <li>🛍️ تصفح محلات الماركات المحلية</li>
      </ul>
    </div>
    <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
      شكراً لاختيارك Outfred ❤️
    </p>
  </div>
</div>`,
    body_en: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px;">
  <div style="background: white; padding: 30px; border-radius: 10px;">
    <h1 style="color: #667eea; text-align: center;">Welcome {{userName}}! 👋</h1>
    <p style="font-size: 16px; line-height: 1.6; color: #333;">
      We're excited to have you join <strong>Outfred</strong> - the AI-powered fashion discovery platform!
    </p>
    <div style="background: #f7f7f7; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <h3 style="color: #667eea; margin-top: 0;">What you can do now:</h3>
      <ul style="line-height: 1.8;">
        <li>🔍 Search for fashion using smart AI</li>
        <li>📸 Upload an image and get similar products</li>
        <li>👔 Get personalized outfit recommendations</li>
        <li>🛍️ Browse local brand stores</li>
      </ul>
    </div>
    <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">
      Thank you for choosing Outfred ❤️
    </p>
  </div>
</div>`
  },
  {
    id: 'verification',
    name: 'Email Verification',
    subject_ar: 'تأكيد بريدك الإلكتروني - Outfred',
    subject_en: 'Verify Your Email - Outfred',
    body_ar: `<div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
  <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <h1 style="color: #667eea; text-align: center;">✉️ تأكيد البريد الإلكتروني</h1>
    <p style="font-size: 16px; color: #333;">مرحباً {{userName}}،</p>
    <p style="font-size: 16px; line-height: 1.6; color: #555;">
      شكراً للتسجيل في Outfred! لتفعيل حسابك، يرجى استخدام كود التفعيل التالي:
    </p>
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
      <div style="background: white; padding: 15px; border-radius: 5px; display: inline-block;">
        <h2 style="color: #667eea; margin: 0; font-size: 32px; letter-spacing: 5px; font-family: monospace;">
          {{verificationCode}}
        </h2>
      </div>
    </div>
    <p style="font-size: 14px; color: #666; text-align: center;">
      هذا الكود صالح لمدة <strong>10 دقائق</strong>
    </p>
  </div>
</div>`,
    body_en: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
  <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <h1 style="color: #667eea; text-align: center;">✉️ Email Verification</h1>
    <p style="font-size: 16px; color: #333;">Hello {{userName}},</p>
    <p style="font-size: 16px; line-height: 1.6; color: #555;">
      Thank you for registering with Outfred! To activate your account, please use the following verification code:
    </p>
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
      <div style="background: white; padding: 15px; border-radius: 5px; display: inline-block;">
        <h2 style="color: #667eea; margin: 0; font-size: 32px; letter-spacing: 5px; font-family: monospace;">
          {{verificationCode}}
        </h2>
      </div>
    </div>
    <p style="font-size: 14px; color: #666; text-align: center;">
      This code is valid for <strong>10 minutes</strong>
    </p>
  </div>
</div>`
  },
  {
    id: 'password_reset',
    name: 'Password Reset',
    subject_ar: 'إعادة تعيين كلمة المرور - Outfred',
    subject_en: 'Reset Your Password - Outfred',
    body_ar: `<div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
  <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <h1 style="color: #e74c3c; text-align: center;">🔐 إعادة تعيين كلمة المرور</h1>
    <p style="font-size: 16px; color: #333;">مرحباً {{userName}}،</p>
    <p style="font-size: 16px; line-height: 1.6; color: #555;">
      تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك. استخدم الكود التالي:
    </p>
    <div style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
      <div style="background: white; padding: 15px; border-radius: 5px; display: inline-block;">
        <h2 style="color: #e74c3c; margin: 0; font-size: 32px; letter-spacing: 5px; font-family: monospace;">
          {{resetCode}}
        </h2>
      </div>
    </div>
    <p style="font-size: 14px; color: #666; text-align: center;">
      هذا الكود صالح لمدة <strong>15 دقيقة</strong>
    </p>
  </div>
</div>`,
    body_en: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f5f5;">
  <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <h1 style="color: #e74c3c; text-align: center;">🔐 Password Reset</h1>
    <p style="font-size: 16px; color: #333;">Hello {{userName}},</p>
    <p style="font-size: 16px; line-height: 1.6; color: #555;">
      We received a request to reset your password. Use the following code:
    </p>
    <div style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
      <div style="background: white; padding: 15px; border-radius: 5px; display: inline-block;">
        <h2 style="color: #e74c3c; margin: 0; font-size: 32px; letter-spacing: 5px; font-family: monospace;">
          {{resetCode}}
        </h2>
      </div>
    </div>
    <p style="font-size: 14px; color: #666; text-align: center;">
      This code is valid for <strong>15 minutes</strong>
    </p>
  </div>
</div>`
  }
];

export const AdminEmailTemplates: React.FC = () => {
  const { language } = useLanguage();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('welcome');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHtml, setPreviewHtml] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = () => {
    const stored = localStorage.getItem('admin_email_templates');
    if (stored) {
      setTemplates(JSON.parse(stored));
    } else {
      setTemplates(defaultTemplates);
      localStorage.setItem('admin_email_templates', JSON.stringify(defaultTemplates));
    }
  };

  const currentTemplate = templates.find(t => t.id === selectedTemplate) || templates[0];

  const handleSave = () => {
    localStorage.setItem('admin_email_templates', JSON.stringify(templates));
    toast.success(language === 'ar' ? '✅ تم حفظ القوالب' : '✅ Templates saved');
  };

  const handlePreview = (lang: 'ar' | 'en') => {
    const html = lang === 'ar' ? currentTemplate.body_ar : currentTemplate.body_en;
    const replaced = html
      .replace(/\{\{userName\}\}/g, 'أحمد محمد')
      .replace(/\{\{verificationCode\}\}/g, '123456')
      .replace(/\{\{resetCode\}\}/g, '987654');
    setPreviewHtml(replaced);
    setPreviewOpen(true);
  };

  const updateTemplate = (field: keyof EmailTemplate, value: string) => {
    setTemplates(templates.map(t => 
      t.id === selectedTemplate ? { ...t, [field]: value } : t
    ));
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {language === 'ar' ? 'قوالب البريد الإلكتروني' : 'Email Templates'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {language === 'ar' ? 'تعديل قوالب الإيميلات المرسلة للمستخدمين' : 'Edit email templates sent to users'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {templates.map(template => (
          <Card
            key={template.id}
            className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
              selectedTemplate === template.id ? 'border-primary bg-primary/5' : ''
            }`}
            onClick={() => setSelectedTemplate(template.id)}
          >
            <div className="flex items-center gap-3">
              <Mail className="w-8 h-8 text-primary" />
              <div>
                <h3 className="font-semibold">{template.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {template.id}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {currentTemplate && (
        <Card className="p-6 glass-effect">
          <Tabs defaultValue="ar">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="ar">عربي</TabsTrigger>
              <TabsTrigger value="en">English</TabsTrigger>
            </TabsList>

            <TabsContent value="ar" className="space-y-4">
              <div>
                <Label>{language === 'ar' ? 'عنوان الإيميل (عربي)' : 'Subject (Arabic)'}</Label>
                <Input
                  value={currentTemplate.subject_ar}
                  onChange={(e) => updateTemplate('subject_ar', e.target.value)}
                  placeholder="عنوان الرسالة"
                />
              </div>

              <div>
                <Label>{language === 'ar' ? 'محتوى الإيميل (HTML - عربي)' : 'Body (HTML - Arabic)'}</Label>
                <Textarea
                  value={currentTemplate.body_ar}
                  onChange={(e) => updateTemplate('body_ar', e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                  placeholder="HTML content..."
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {language === 'ar' 
                    ? 'استخدم {{userName}} و {{verificationCode}} و {{resetCode}} كمتغيرات'
                    : 'Use {{userName}}, {{verificationCode}}, {{resetCode}} as variables'}
                </p>
              </div>

              <Button onClick={() => handlePreview('ar')} variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'معاينة' : 'Preview'}
              </Button>
            </TabsContent>

            <TabsContent value="en" className="space-y-4">
              <div>
                <Label>{language === 'ar' ? 'عنوان الإيميل (إنجليزي)' : 'Subject (English)'}</Label>
                <Input
                  value={currentTemplate.subject_en}
                  onChange={(e) => updateTemplate('subject_en', e.target.value)}
                  placeholder="Email subject"
                />
              </div>

              <div>
                <Label>{language === 'ar' ? 'محتوى الإيميل (HTML - إنجليزي)' : 'Body (HTML - English)'}</Label>
                <Textarea
                  value={currentTemplate.body_en}
                  onChange={(e) => updateTemplate('body_en', e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                  placeholder="HTML content..."
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {language === 'ar' 
                    ? 'استخدم {{userName}} و {{verificationCode}} و {{resetCode}} كمتغيرات'
                    : 'Use {{userName}}, {{verificationCode}}, {{resetCode}} as variables'}
                </p>
              </div>

              <Button onClick={() => handlePreview('en')} variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                {language === 'ar' ? 'معاينة' : 'Preview'}
              </Button>
            </TabsContent>
          </Tabs>

          <div className="mt-6 pt-6 border-t flex gap-3">
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" />
              {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
            </Button>
            <Button variant="outline" onClick={() => {
              setTemplates(defaultTemplates);
              toast.success(language === 'ar' ? 'تم استعادة القيم الافتراضية' : 'Reset to defaults');
            }}>
              {language === 'ar' ? 'استعادة الافتراضي' : 'Reset to Default'}
            </Button>
          </div>
        </Card>
      )}

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{language === 'ar' ? 'معاينة الإيميل' : 'Email Preview'}</DialogTitle>
          </DialogHeader>
          <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
        </DialogContent>
      </Dialog>
    </div>
  );
};
