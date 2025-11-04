import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Brain, Save, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

interface AISettings {
  provider: 'openai' | 'anthropic' | 'custom';
  model: string;
  apiKey: string;
  baseUrl: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

const DEFAULT_SETTINGS: AISettings = {
  provider: 'openai',
  model: 'gpt-4o-mini',
  apiKey: '',
  baseUrl: 'https://openrouter.ai/api/v1',
  temperature: 0.7,
  maxTokens: 2000,
  systemPrompt: 'You are a helpful fashion assistant that helps users find clothing items.',
};

export const AdminAISettings: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const [settings, setSettings] = useState<AISettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    const saved = localStorage.getItem('aiSettings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load AI settings:', error);
      }
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      localStorage.setItem('aiSettings', JSON.stringify(settings));
      toast.success(isRTL ? 'تم حفظ إعدادات الذكاء الاصطناعي' : 'AI settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error(isRTL ? 'فشل حفظ الإعدادات' : 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (confirm(isRTL ? 'هل تريد إعادة تعيين الإعدادات للافتراضية؟' : 'Reset to default settings?')) {
      setSettings(DEFAULT_SETTINGS);
      localStorage.removeItem('aiSettings');
      toast.success(isRTL ? 'تم إعادة التعيين' : 'Settings reset');
    }
  };

  const providerModels = {
    openai: [
      { value: 'gpt-4o', label: 'GPT-4o (Recommended)' },
      { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Fast & Cheap)' },
      { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
      { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Budget)' },
    ],
    anthropic: [
      { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet (Best)' },
      { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
      { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' },
      { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku (Fast)' },
    ],
    custom: [],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-background p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => onNavigate('admin')}
            className="mb-4"
          >
            ← {isRTL ? 'العودة للوحة التحكم' : 'Back to Admin'}
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <Brain className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">
              {isRTL ? 'إعدادات الذكاء الاصطناعي' : 'AI Settings'}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {isRTL 
              ? 'تحكم في إعدادات الذكاء الاصطناعي للبحث الذكي ومولد الأزياء' 
              : 'Configure AI settings for smart search and outfit generator'}
          </p>
        </div>

        <Card className="glass-effect border-border p-6 space-y-6">
          {/* Provider Selection */}
          <div>
            <Label htmlFor="provider">
              {isRTL ? 'مزود الخدمة' : 'AI Provider'}
            </Label>
            <select
              id="provider"
              value={settings.provider}
              onChange={(e) => setSettings({ 
                ...settings, 
                provider: e.target.value as AISettings['provider'],
                model: providerModels[e.target.value as keyof typeof providerModels][0]?.value || '',
              })}
              className="w-full mt-2 px-3 py-2 rounded-md border border-border bg-input-background"
            >
              <option value="openai">OpenAI (ChatGPT)</option>
              <option value="anthropic">Anthropic (Claude)</option>
              <option value="custom">{isRTL ? 'مخصص' : 'Custom'}</option>
            </select>
          </div>

          {/* Model Selection */}
          <div>
            <Label htmlFor="model">
              {isRTL ? 'النموذج' : 'Model'}
            </Label>
            {settings.provider !== 'custom' ? (
              <select
                id="model"
                value={settings.model}
                onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                className="w-full mt-2 px-3 py-2 rounded-md border border-border bg-input-background"
              >
                {providerModels[settings.provider].map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                id="model"
                value={settings.model}
                onChange={(e) => setSettings({ ...settings, model: e.target.value })}
                placeholder="e.g., gpt-4o, claude-3-opus"
                className="mt-2"
              />
            )}
            <p className="text-sm text-muted-foreground mt-1">
              {isRTL 
                ? 'النماذج الأكبر أكثر ذكاءً لكن أبطأ وأغلى' 
                : 'Larger models are smarter but slower and more expensive'}
            </p>
          </div>

          {/* API Key */}
          <div>
            <Label htmlFor="apiKey">
              {isRTL ? 'مفتاح API' : 'API Key'}
            </Label>
            <Input
              id="apiKey"
              type="password"
              value={settings.apiKey}
              onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
              placeholder={isRTL ? 'أدخل مفتاح API' : 'Enter your API key'}
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-1">
              {isRTL 
                ? 'احصل على مفتاحك من ' 
                : 'Get your key from '}
              {settings.provider === 'openai' && 'platform.openai.com'}
              {settings.provider === 'anthropic' && 'console.anthropic.com'}
              {settings.provider === 'custom' && 'your provider'}
            </p>
          </div>

          {/* Base URL (for custom provider) */}
          {settings.provider === 'custom' && (
            <div>
              <Label htmlFor="baseUrl">
                {isRTL ? 'عنوان API' : 'Base URL'}
              </Label>
              <Input
                id="baseUrl"
                value={settings.baseUrl}
                onChange={(e) => setSettings({ ...settings, baseUrl: e.target.value })}
                placeholder="https://api.example.com/v1"
                className="mt-2"
              />
            </div>
          )}

          {/* Temperature */}
          <div>
            <Label htmlFor="temperature">
              {isRTL ? 'الإبداع (Temperature)' : 'Creativity (Temperature)'}: {settings.temperature}
            </Label>
            <input
              id="temperature"
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={settings.temperature}
              onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
              className="w-full mt-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{isRTL ? 'دقيق' : 'Precise'}</span>
              <span>{isRTL ? 'إبداعي' : 'Creative'}</span>
            </div>
          </div>

          {/* Max Tokens */}
          <div>
            <Label htmlFor="maxTokens">
              {isRTL ? 'أقصى طول للنص' : 'Max Response Length'}
            </Label>
            <Input
              id="maxTokens"
              type="number"
              value={settings.maxTokens}
              onChange={(e) => setSettings({ ...settings, maxTokens: parseInt(e.target.value) || 2000 })}
              min="100"
              max="8000"
              className="mt-2"
            />
            <p className="text-sm text-muted-foreground mt-1">
              {isRTL 
                ? 'القيم الأعلى تسمح بردود أطول لكن تكلف أكثر' 
                : 'Higher values allow longer responses but cost more'}
            </p>
          </div>

          {/* System Prompt */}
          <div>
            <Label htmlFor="systemPrompt">
              {isRTL ? 'التوجيهات الأساسية' : 'System Prompt'}
            </Label>
            <Textarea
              id="systemPrompt"
              value={settings.systemPrompt}
              onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
              rows={4}
              className="mt-2"
              placeholder={isRTL 
                ? 'أدخل التوجيهات الأساسية للذكاء الاصطناعي...' 
                : 'Enter instructions for the AI...'}
            />
            <p className="text-sm text-muted-foreground mt-1">
              {isRTL 
                ? 'هذه التوجيهات تحدد سلوك الذكاء الاصطناعي' 
                : 'These instructions define how the AI behaves'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground"
            >
              <Save className="w-4 h-4" />
              {loading ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ' : 'Save Settings')}
            </Button>
            <Button
              onClick={handleReset}
              variant="outline"
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              {isRTL ? 'إعادة تعيين' : 'Reset to Default'}
            </Button>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-muted/20 rounded-lg border border-border">
            <h3 className="font-medium mb-2">
              {isRTL ? 'ℹ️ معلومات مهمة' : 'ℹ️ Important Information'}
            </h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                {isRTL 
                  ? '• يتم تخزين الإعدادات محلياً في متصفحك' 
                  : '• Settings are stored locally in your browser'}
              </li>
              <li>
                {isRTL 
                  ? '• لن يتم مشاركة مفتاح API مع أي شخص' 
                  : '• Your API key is never shared with anyone'}
              </li>
              <li>
                {isRTL 
                  ? '• الاستخدام المفرط قد يؤدي لتكاليف عالية' 
                  : '• Excessive usage may result in high costs'}
              </li>
              <li>
                {isRTL 
                  ? '• تأكد من صلاحيات المفتاح قبل الاستخدام' 
                  : '• Verify API key permissions before use'}
              </li>
            </ul>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
