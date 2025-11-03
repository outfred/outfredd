import React from 'react';
import { Card } from '../components/ui/card';
import { Info, Shield, Mail } from 'lucide-react';
import { motion } from 'motion/react';

interface StaticPageProps {
  page: 'about' | 'privacy' | 'contact';
}

export const StaticPages: React.FC<StaticPageProps> = ({ page }) => {
  const content = {
    about: {
      icon: Info,
      title: 'About Outfred',
      sections: [
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
      title: 'Privacy Policy',
      sections: [
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
      title: 'Contact Us',
      sections: [
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

  const pageContent = content[page];
  const Icon = pageContent.icon;

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
            {pageContent.title}
          </h1>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-white/20 p-8 md:p-12">
            <div className="space-y-8">
              {pageContent.sections.map((section, index) => (
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
              <h3 className="text-2xl mb-6">Send Us a Message</h3>
              <form className="space-y-4">
                <div>
                  <label className="block mb-2">Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block mb-2">Message</label>
                  <textarea
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg bg-white/50 dark:bg-gray-800/50 border border-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="How can we help you?"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-indigo-600 to-pink-600 text-white hover:shadow-lg transition-all"
                >
                  Send Message
                </button>
              </form>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};
