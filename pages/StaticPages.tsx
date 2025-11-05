import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Info, Shield, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

interface StaticPageProps {
  page: 'about' | 'privacy' | 'contact';
}

interface CMSPage {
  title_ar?: string;
  title_en?: string;
  content_ar?: string;
  content_en?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export const StaticPages: React.FC<StaticPageProps> = ({ page }) => {
  const { language } = useLanguage();
  const [cmsContent, setCmsContent] = useState<Record<string, CMSPage>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedPages = localStorage.getItem('admin_cms_pages');
      if (storedPages) {
        const parsed = JSON.parse(storedPages);
        setCmsContent(parsed);
      }
    } catch (error) {
      console.error('Failed to load CMS content:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const defaultContent = {
    about: {
      icon: Info,
      title: language === 'ar' ? 'من نحن - Outfred' : 'About Outfred',
      sections: language === 'ar' ? [
        {
          heading: 'مهمتنا',
          text: 'Outfred تحدث ثورة في اكتشاف الأزياء من خلال الجمع بين العلامات التجارية المحلية وتقنيات الذكاء الاصطناعي المتطورة. نحن نؤمن بأن الجميع يستحق الوصول إلى أزياء فريدة وعالية الجودة من علامات تجارية موثوقة.',
        },
        {
          heading: 'ماذا نفعل',
          text: 'نحن نربط عشاق الموضة بعلامات تجارية محلية مختارة بعناية من خلال البحث الذكي والتعرف على الصور وتوصيات الملابس المدعومة بالذكاء الاصطناعي. منصتنا تجعل من السهل اكتشاف واستكشاف والتسوق من أفضل تجار الأزياء المحليين.',
        },
        {
          heading: 'التقنية لدينا',
          text: 'باستخدام الذكاء الاصطناعي والتعلم الآلي المتقدم، نقدم بحثًا ذكيًا مع تصحيح تلقائي، ودعم متعدد اللغات، وقدرات البحث البصري، وتوليد الملابس الشخصية بناءً على تفضيلات أسلوبك.',
        },
        {
          heading: 'للتجار',
          text: 'نوفر لعلامات الأزياء المحلية منصة قوية للوصول إلى عملاء جدد، وعرض منتجاتهم، والاستفادة من التعرض المدعوم بالذكاء الاصطناعي من خلال أنظمة التوصيات الذكية لدينا.',
        },
      ] : [
        {
          heading: 'Our Mission',
          text: 'Outfred is revolutionizing fashion discovery by combining local brands with cutting-edge AI technology. We believe everyone deserves access to unique, quality fashion from brands they can trust.',
        },
        {
          heading: 'What We Do',
          text: 'We connect fashion enthusiasts with carefully curated local brands through intelligent search, image recognition, and AI-powered outfit recommendations. Our platform makes it easy to discover, explore, and shop from the best local fashion merchants.',
        },
        {
          heading: 'Our Technology',
          text: 'Using advanced AI and machine learning, we offer smart search with autocorrect, multilingual support, visual search capabilities, and personalized outfit generation based on your style preferences.',
        },
        {
          heading: 'For Merchants',
          text: 'We provide local fashion brands with a powerful platform to reach new customers, showcase their products, and benefit from AI-driven exposure through our smart recommendation systems.',
        },
      ],
    },
    privacy: {
      icon: Shield,
      title: language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy',
      sections: language === 'ar' ? [
        {
          heading: 'المعلومات التي نجمعها',
          text: 'نقوم بجمع المعلومات التي تقدمها لنا مباشرة، مثل عند إنشاء حساب أو تقديم طلب تاجر أو الاتصال بنا. قد يشمل ذلك اسمك وعنوان بريدك الإلكتروني ورقم هاتفك ومعلومات الاتصال الأخرى.',
        },
        {
          heading: 'كيف نستخدم معلوماتك',
          text: 'نستخدم المعلومات التي نجمعها لتقديم خدماتنا وصيانتها وتحسينها، للتواصل معك، لمراقبة وتحليل الاتجاهات والاستخدام، ولتخصيص تجربتك على منصتنا.',
        },
        {
          heading: 'أمن البيانات',
          text: 'نتخذ تدابير معقولة للمساعدة في حماية معلوماتك الشخصية من الفقدان والسرقة وسوء الاستخدام والوصول غير المصرح به والإفصاح والتعديل والتدمير. ومع ذلك، لا يوجد نقل عبر الإنترنت آمن تمامًا أو خالٍ من الأخطاء.',
        },
        {
          heading: 'حقوقك',
          text: 'لديك الحق في الوصول إلى معلوماتك الشخصية أو تحديثها أو حذفها في أي وقت. يمكنك أيضًا إلغاء الاشتراك في تلقي الاتصالات الترويجية منا باتباع التعليمات في تلك الرسائل.',
        },
        {
          heading: 'اتصل بنا',
          text: 'إذا كان لديك أي أسئلة حول سياسة الخصوصية هذه، يرجى الاتصال بنا على privacy@outfred.com',
        },
      ] : [
        {
          heading: 'Information We Collect',
          text: 'We collect information you provide directly to us, such as when you create an account, submit a merchant application, or contact us. This may include your name, email address, phone number, and other contact information.',
        },
        {
          heading: 'How We Use Your Information',
          text: 'We use the information we collect to provide, maintain, and improve our services, to communicate with you, to monitor and analyze trends and usage, and to personalize your experience on our platform.',
        },
        {
          heading: 'Data Security',
          text: 'We take reasonable measures to help protect your personal information from loss, theft, misuse, unauthorized access, disclosure, alteration, and destruction. However, no internet transmission is ever fully secure or error-free.',
        },
        {
          heading: 'Your Rights',
          text: 'You have the right to access, update, or delete your personal information at any time. You can also opt out of receiving promotional communications from us by following the instructions in those messages.',
        },
        {
          heading: 'Contact Us',
          text: 'If you have any questions about this Privacy Policy, please contact us at privacy@outfred.com',
        },
      ],
    },
    contact: {
      icon: Mail,
      title: language === 'ar' ? 'تواصل معنا' : 'Contact Us',
      sections: language === 'ar' ? [
        {
          heading: 'تواصل معنا',
          text: 'لديك أسئلة أو اقتراحات أو ملاحظات؟ نحن نحب أن نسمع منك. فريقنا هنا للمساعدة ودائمًا حريص على تحسين تجربتك مع Outfred.',
        },
        {
          heading: 'البريد الإلكتروني',
          text: 'للاستفسارات العامة: hello@outfred.com\nلدعم التجار: merchants@outfred.com\nللدعم الفني: support@outfred.com',
        },
        {
          heading: 'وسائل التواصل الاجتماعي',
          text: 'تابعنا على قنواتنا الاجتماعية للحصول على آخر التحديثات واتجاهات الموضة وأخبار المنصة. تواصل معنا على Instagram و Twitter و Facebook @outfred',
        },
        {
          heading: 'وقت الرد',
          text: 'نرد عادةً على جميع الاستفسارات خلال 24-48 ساعة خلال أيام العمل. للأمور العاجلة المتعلقة بحساب التاجر الخاص بك أو المشكلات الفنية، يرجى وضع علامة على رسالتك كعاجلة.',
        },
      ] : [
        {
          heading: 'Get in Touch',
          text: 'Have questions, suggestions, or feedback? We\'d love to hear from you. Our team is here to help and always eager to improve your Outfred experience.',
        },
        {
          heading: 'Email',
          text: 'For general inquiries: hello@outfred.com\nFor merchant support: merchants@outfred.com\nFor technical support: support@outfred.com',
        },
        {
          heading: 'Social Media',
          text: 'Follow us on our social channels for the latest updates, fashion trends, and platform news. Connect with us on Instagram, Twitter, and Facebook @outfred',
        },
        {
          heading: 'Response Time',
          text: 'We typically respond to all inquiries within 24-48 hours during business days. For urgent matters related to your merchant account or technical issues, please mark your message as urgent.',
        },
      ],
    },
  };

  const defaultPageContent = defaultContent[page];
  const Icon = defaultPageContent.icon;

  const cmsPage = cmsContent[page];
  const title = cmsPage
    ? (language === 'ar' ? cmsPage.title_ar : cmsPage.title_en) || defaultPageContent.title
    : defaultPageContent.title;
  
  const contentText = cmsPage
    ? (language === 'ar' ? cmsPage.content_ar : cmsPage.content_en)
    : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground">
          {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center mx-auto mb-6">
            <Icon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl mb-4 bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
            {title}
          </h1>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-white/20 p-8 md:p-12">
            {contentText ? (
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                  {contentText}
                </p>
                {page === 'contact' && cmsPage && (
                  <div className="mt-8 space-y-4">
                    {cmsPage.email && (
                      <div>
                        <h3 className="text-xl mb-2">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</h3>
                        <p className="text-gray-700 dark:text-gray-300">{cmsPage.email}</p>
                      </div>
                    )}
                    {cmsPage.phone && (
                      <div>
                        <h3 className="text-xl mb-2">{language === 'ar' ? 'الهاتف' : 'Phone'}</h3>
                        <p className="text-gray-700 dark:text-gray-300">{cmsPage.phone}</p>
                      </div>
                    )}
                    {cmsPage.address && (
                      <div>
                        <h3 className="text-xl mb-2">{language === 'ar' ? 'العنوان' : 'Address'}</h3>
                        <p className="text-gray-700 dark:text-gray-300">{cmsPage.address}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-8">
                {defaultPageContent.sections.map((section, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <h2 className="text-2xl mb-4 bg-gradient-to-r from-indigo-600 to-pink-600 bg-clip-text text-transparent">
                      {section.heading}
                    </h2>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                      {section.text}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>

        {/* Contact form for contact page */}
        {page === 'contact' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8"
          >
            <Card className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-white/20 p-8">
              <h3 className="text-2xl mb-6">
                {language === 'ar' ? 'أرسل لنا رسالة' : 'Send Us a Message'}
              </h3>
              <form className="space-y-4">
                <div>
                  <label className="block mb-2">
                    {language === 'ar' ? 'الاسم' : 'Name'}
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder={language === 'ar' ? 'اسمك' : 'Your name'}
                  />
                </div>
                <div>
                  <label className="block mb-2">
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder={language === 'ar' ? 'you@example.com' : 'you@example.com'}
                  />
                </div>
                <div>
                  <label className="block mb-2">
                    {language === 'ar' ? 'الرسالة' : 'Message'}
                  </label>
                  <textarea
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder={language === 'ar' ? 'كيف يمكننا مساعدتك؟' : 'How can we help you?'}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-pink-600 text-white hover:shadow-lg transition-all"
                >
                  {language === 'ar' ? 'إرسال الرسالة' : 'Send Message'}
                </button>
              </form>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};
