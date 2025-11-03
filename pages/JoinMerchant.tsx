import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Store, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { merchantsApi } from '../utils/api';
import { toast } from 'sonner@2.0.3';

export const JoinMerchant: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    brandName: '',
    email: '',
    phone: '',
    website: '',
    description: '',
    logo: '',
  });

  // Update email when user is available
  React.useEffect(() => {
    if (user?.email && !formData.email) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.brandName || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // Include userId if user is logged in
      const submitData = {
        ...formData,
        userId: user?.id || null,
      };
      
      console.log('📝 Submitting merchant application:', submitData);
      await merchantsApi.create(submitData);
      setSubmitted(true);
      toast.success('Application submitted successfully!');
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Card className="p-12 text-center glass-effect border-border">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Application Submitted!
              </h2>
              <p className="text-muted-foreground mb-8">
                Thank you for applying to join Outfred. Our team will review your application and get back to you within 3-5 business days.
              </p>
              <Button
                onClick={() => setSubmitted(false)}
                className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
              >
                Submit Another Application
              </Button>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto mb-6">
            <Store className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {t('joinAsMerchant')}
          </h1>
          <p className="text-muted-foreground">
            Become part of Outfred's curated fashion marketplace
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-8 glass-effect border-border">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2">
                    {t('contactName')} <span className="text-destructive">*</span>
                  </label>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="bg-input-background border-border"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block mb-2">
                    {t('brandName')} <span className="text-destructive">*</span>
                  </label>
                  <Input
                    name="brandName"
                    value={formData.brandName}
                    onChange={handleChange}
                    required
                    className="bg-input-background border-border"
                    placeholder="Your Brand"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2">
                    {t('email')} <span className="text-destructive">*</span>
                  </label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="bg-input-background border-border"
                    placeholder="contact@yourbrand.com"
                  />
                </div>

                <div>
                  <label className="block mb-2">{t('phone')}</label>
                  <Input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="bg-input-background border-border"
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2">{t('website')}</label>
                <Input
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleChange}
                  className="bg-input-background border-border"
                  placeholder="https://yourbrand.com"
                />
              </div>

              <div>
                <label className="block mb-2">{t('logo')}</label>
                <Input
                  name="logo"
                  type="url"
                  value={formData.logo}
                  onChange={handleChange}
                  className="bg-input-background border-border"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div>
                <label className="block mb-2">{t('description')}</label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  className="bg-input-background border-border"
                  placeholder="Tell us about your brand, products, and what makes you unique..."
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-primary to-accent text-primary-foreground"
              >
                {loading ? t('loading') : t('submit')}
              </Button>
            </form>
          </Card>
        </motion.div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Card className="p-6 glass-effect border-border text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center mx-auto mb-4">
              <Store className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="mb-2">Reach More Customers</h3>
            <p className="text-sm text-muted-foreground">
              Access thousands of fashion enthusiasts looking for unique brands
            </p>
          </Card>

          <Card className="p-6 glass-effect border-border text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="mb-2">Easy Integration</h3>
            <p className="text-sm text-muted-foreground">
              Simple setup process with automated product importing
            </p>
          </Card>

          <Card className="p-6 glass-effect border-border text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-lighter to-accent flex items-center justify-center mx-auto mb-4">
              <Store className="w-6 h-6 text-primary-foreground" />
            </div>
            <h3 className="mb-2">AI-Powered Exposure</h3>
            <p className="text-sm text-muted-foreground">
              Get featured in AI outfit suggestions and smart search results
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
