import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';
import { Switch } from '../components/ui/switch';
import {
  Upload, FileText, Globe, Code, Play, Clock, CheckCircle, 
  XCircle, AlertCircle, RefreshCw, Trash2, Download, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { productsApi, merchantsApi } from '../utils/api';
import { toast } from 'sonner';

export const MerchantImport: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('import');
  const [loading, setLoading] = useState(false);
  
  // Import Source State
  const [sourceType, setSourceType] = useState<'csv' | 'website' | 'api'>('csv');
  const [csvContent, setCsvContent] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  
  // Import Options
  const [updateExisting, setUpdateExisting] = useState(false);
  const [autoSync, setAutoSync] = useState(false);
  
  // Merchants
  const [merchants, setMerchants] = useState<any[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState('');
  
  // Import Session
  const [currentSession, setCurrentSession] = useState<any>(null);
  const [sessionPolling, setSessionPolling] = useState<any>(null);
  const [toastShown, setToastShown] = useState<Set<string>>(new Set());
  
  // Import History
  const [importHistory, setImportHistory] = useState<any[]>([]);
  
  // Connectors
  const [connectors, setConnectors] = useState<any[]>([]);

  useEffect(() => {
    loadMerchants();
    loadConnectors();
    if (activeTab === 'history') {
      loadImportHistory();
    }
    
    // Auto-set merchant ID for merchant users
    if (user && user.role === 'merchant') {
      loadUserMerchant();
    }
  }, [activeTab, user]);

  useEffect(() => {
    // Cleanup polling on unmount
    return () => {
      if (sessionPolling) {
        clearInterval(sessionPolling);
      }
    };
  }, [sessionPolling]);

  const loadUserMerchant = async () => {
    try {
      const data = await merchantsApi.getUserMerchant();
      if (data.merchant) {
        setSelectedMerchant(data.merchant.id);
      }
    } catch (error) {
      console.error('Error loading user merchant:', error);
    }
  };

  const loadMerchants = async () => {
    try {
      // Only load merchants list for non-merchant users
      if (user?.role === 'merchant') {
        return; // Merchants don't need the full list
      }
      
      const data = await merchantsApi.list();
      setMerchants(data.merchants.filter((m: any) => m.status === 'approved'));
      if (data.merchants.length > 0 && !selectedMerchant) {
        setSelectedMerchant(data.merchants[0].id);
      }
    } catch (error) {
      console.error('Error loading merchants:', error);
    }
  };

  const loadConnectors = async () => {
    try {
      const data = await productsApi.importConnectors();
      setConnectors(data.connectors);
    } catch (error) {
      console.error('Error loading connectors:', error);
    }
  };

  const loadImportHistory = async () => {
    try {
      const data = await productsApi.importHistory();
      setImportHistory(data.sessions);
    } catch (error) {
      console.error('Error loading import history:', error);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setCsvContent(text);
        toast.success('File uploaded successfully');
      };
      reader.readAsText(file);
    }
  };

  const startImport = async () => {
    // For merchant users, force using their own store ID
    let merchantId = selectedMerchant;
    
    if (user?.role === 'merchant') {
      try {
        const data = await merchantsApi.getUserMerchant();
        if (!data.merchant) {
          toast.error(language === 'ar' ? 'لا يمكن العثور على متجرك. يرجى الاتصال بالدعم.' : 'Cannot find your store. Please contact support.');
          return;
        }
        merchantId = data.merchant.id;
      } catch (error) {
        toast.error(language === 'ar' ? 'خطأ في تحميل معلومات متجرك' : 'Error loading your store information');
        return;
      }
    }
    
    if (!merchantId) {
      toast.error(language === 'ar' ? 'الرجاء اختيار متجر' : 'Please select a merchant');
      return;
    }

    let sourceData: any = {};
    
    if (sourceType === 'csv') {
      if (!csvContent) {
        toast.error(language === 'ar' ? 'الرجاء رفع ملف CSV' : 'Please upload a CSV file');
        return;
      }
      sourceData = { csvContent };
    } else if (sourceType === 'website') {
      if (!websiteUrl) {
        toast.error(language === 'ar' ? 'الرجاء إدخال رابط الموقع' : 'Please enter website URL');
        return;
      }
      sourceData = { url: websiteUrl };
    } else if (sourceType === 'api') {
      if (!apiUrl) {
        toast.error(language === 'ar' ? 'الرجاء إدخال رابط API' : 'Please enter API URL');
        return;
      }
      sourceData = { apiUrl, apiKey };
    }

    setLoading(true);
    
    // Reset toast tracking for new import
    setToastShown(new Set());

    try {
      const response = await productsApi.importStart({
        merchantId: merchantId,
        sourceType,
        sourceData,
        options: {
          updateExisting,
          autoSync
        }
      });

      toast.success(response.message || (language === 'ar' ? 'بدأ الاستيراد بنجاح' : 'Import started successfully'));
      
      // Start polling for status
      pollImportStatus(response.sessionId);
      
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(error.message || (language === 'ar' ? 'فشل بدء الاستيراد' : 'Failed to start import'));
      setLoading(false);
    }
  };

  const pollImportStatus = (sessionId: string) => {
    // Initial fetch
    fetchSessionStatus(sessionId);
    
    // Poll every 2 seconds
    const interval = setInterval(() => {
      fetchSessionStatus(sessionId);
    }, 2000);
    
    setSessionPolling(interval);
  };

  const fetchSessionStatus = async (sessionId: string) => {
    try {
      const data = await productsApi.importStatus(sessionId);
      setCurrentSession(data.session);
      
      // Stop polling if completed or failed
      if (data.session.status === 'completed' || data.session.status === 'failed') {
        if (sessionPolling) {
          clearInterval(sessionPolling);
          setSessionPolling(null);
        }
        setLoading(false);
        
        // Show toast only once per session
        const toastKey = `${sessionId}-${data.session.status}`;
        if (!toastShown.has(toastKey)) {
          setToastShown(prev => new Set(prev).add(toastKey));
          
          if (data.session.status === 'completed') {
            const stats = data.session.stats;
            const message = language === 'ar' 
              ? `اكتمل الاستيراد: ${stats.added} مضاف، ${stats.updated} محدث`
              : `Import completed: ${stats.added} added, ${stats.updated} updated`;
            toast.success(message);
          } else {
            const errorMsg = data.session.error || (language === 'ar' ? 'فشل الاستيراد' : 'Import failed');
            toast.error(errorMsg);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching session status:', error);
    }
  };

  const cancelImport = () => {
    if (sessionPolling) {
      clearInterval(sessionPolling);
      setSessionPolling(null);
    }
    setCurrentSession(null);
    setLoading(false);
  };

  const deleteSession = async (sessionId: string) => {
    try {
      await productsApi.importDelete(sessionId);
      toast.success(language === 'ar' ? 'تم حذف الجلسة' : 'Session deleted');
      loadImportHistory();
    } catch (error: any) {
      toast.error(error.message || (language === 'ar' ? 'فشل حذف الجلسة' : 'Failed to delete session'));
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'processing':
        return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      completed: 'default',
      failed: 'destructive',
      processing: 'secondary'
    };
    
    const labels: any = {
      completed: language === 'ar' ? 'مكتمل' : 'Completed',
      failed: language === 'ar' ? 'فشل' : 'Failed',
      processing: language === 'ar' ? 'جاري المعالجة' : 'Processing'
    };
    
    return <Badge variant={variants[status] || 'outline'}>{labels[status] || status}</Badge>;
  };

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50/50 via-white to-pink-50/50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl mb-2">
            {language === 'ar' ? '🔌 استيراد المنتجات' : '🔌 Product Import'}
          </h1>
          <p className="text-gray-600">
            {language === 'ar' 
              ? 'استورد منتجاتك من موقعك الإلكتروني أو ملف CSV أو API'
              : 'Import your products from your website, CSV file, or API'}
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} dir={language === 'ar' ? 'rtl' : 'ltr'}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="import">
              {language === 'ar' ? 'استيراد جديد' : 'New Import'}
            </TabsTrigger>
            <TabsTrigger value="history">
              {language === 'ar' ? 'سجل الاستيراد' : 'Import History'}
            </TabsTrigger>
          </TabsList>

          {/* Import Tab */}
          <TabsContent value="import">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Merchant Info - Hidden for merchant users */}
              {user && user.role !== 'merchant' && (
                <Card className="p-6 backdrop-blur-sm bg-white/80 border-purple-100">
                  <Label className="text-lg mb-3 block">
                    {language === 'ar' ? '1️⃣ اختر المتجر' : '1️⃣ Select Merchant'}
                  </Label>
                  <select
                    value={selectedMerchant}
                    onChange={(e) => setSelectedMerchant(e.target.value)}
                    className="w-full p-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-400 outline-none mb-4"
                    disabled={loading}
                  >
                    <option value="">
                      {language === 'ar' ? 'اختر متجر...' : 'Select a merchant...'}
                    </option>
                    {merchants.map((merchant) => (
                      <option key={merchant.id} value={merchant.id}>
                        {merchant.brandName || merchant.name} {merchant.status === 'approved' ? '✅' : '⏳'}
                      </option>
                    ))}
                  </select>
                </Card>
              )}

              {/* Source Type Selection */}
              <Card className="p-6 backdrop-blur-sm bg-white/80 border-purple-100">
                <Label className="text-lg mb-3 block">
                  {language === 'ar' ? '2️⃣ اختر طريقة الاستيراد' : '2️⃣ Choose Import Method'}
                </Label>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSourceType('csv')}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      sourceType === 'csv'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                    disabled={loading}
                  >
                    <FileText className="w-8 h-8 mb-3 mx-auto text-purple-600" />
                    <div className="font-semibold">CSV / Excel</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {language === 'ar' ? 'رفع ملف' : 'Upload file'}
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSourceType('website')}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      sourceType === 'website'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                    disabled={loading}
                  >
                    <Globe className="w-8 h-8 mb-3 mx-auto text-purple-600" />
                    <div className="font-semibold">{language === 'ar' ? 'موقع ويب' : 'Website'}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {language === 'ar' ? 'استخراج من الموقع' : 'Scrape from site'}
                    </div>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSourceType('api')}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      sourceType === 'api'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                    disabled={loading}
                  >
                    <Code className="w-8 h-8 mb-3 mx-auto text-purple-600" />
                    <div className="font-semibold">API</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {language === 'ar' ? 'اتصال API' : 'API connection'}
                    </div>
                  </motion.button>
                </div>

                <Separator className="my-6" />

                {/* Source-specific inputs */}
                <AnimatePresence mode="wait">
                  {sourceType === 'csv' && (
                    <motion.div
                      key="csv"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <Label>
                        {language === 'ar' ? 'رفع ملف CSV' : 'Upload CSV File'}
                      </Label>
                      <div className="border-2 border-dashed border-purple-300 rounded-lg p-8 text-center">
                        <Upload className="w-12 h-12 mx-auto mb-4 text-purple-400" />
                        <input
                          type="file"
                          accept=".csv,.txt"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="csv-upload"
                          disabled={loading}
                        />
                        <label
                          htmlFor="csv-upload"
                          className="cursor-pointer text-purple-600 hover:text-purple-700 font-medium"
                        >
                          {language === 'ar' ? 'اضغط للرفع أو اسحب الملف' : 'Click to upload or drag file'}
                        </label>
                        {csvContent && (
                          <div className="mt-4 text-sm text-green-600">
                            ✓ {language === 'ar' ? 'تم رفع الملف' : 'File uploaded'}
                          </div>
                        )}
                      </div>
                      
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {language === 'ar'
                            ? 'تأكد أن الملف يحتوي على الأعمدة: name, price, color, size, image_url'
                            : 'Make sure the file contains columns: name, price, color, size, image_url'}
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}

                  {sourceType === 'website' && (
                    <motion.div
                      key="website"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <Label>
                        {language === 'ar' ? 'رابط القسم في الموقع' : 'Collection/Category URL'}
                      </Label>
                      <Input
                        type="url"
                        placeholder="https://your-store.com/collections/all"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        disabled={loading}
                      />
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {language === 'ar'
                            ? '⚠️ مهم: ضع رابط قسم محدد من موقعك (مثل: your-store.com/collections/all) وليس رابط الموقع الرئيسي. هذا يساعد في استخراج المنتجات بدقة.'
                            : '⚠️ Important: Enter a specific collection/category URL (e.g., your-store.com/collections/all) NOT your homepage. This helps extract products accurately.'}
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}

                  {sourceType === 'api' && (
                    <motion.div
                      key="api"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      <div>
                        <Label>
                          {language === 'ar' ? 'رابط API' : 'API URL'}
                        </Label>
                        <Input
                          type="url"
                          placeholder="https://api.example.com/products"
                          value={apiUrl}
                          onChange={(e) => setApiUrl(e.target.value)}
                          disabled={loading}
                        />
                      </div>
                      <div>
                        <Label>
                          {language === 'ar' ? 'مفتاح API (اختياري)' : 'API Key (optional)'}
                        </Label>
                        <Input
                          type="password"
                          placeholder="your-api-key"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          disabled={loading}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>

              {/* Import Options */}
              <Card className="p-6 backdrop-blur-sm bg-white/80 border-purple-100">
                <Label className="text-lg mb-3 block">
                  {language === 'ar' ? '3️⃣ خيارات الاستيراد' : '3️⃣ Import Options'}
                </Label>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {language === 'ar' ? 'تحديث المنتجات الموجودة' : 'Update Existing Products'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {language === 'ar'
                          ? 'إذا وُجد منتج مطابق، سيتم تحديث السعر والمخزون'
                          : 'If a matching product is found, update price and stock'}
                      </div>
                    </div>
                    <Switch
                      checked={updateExisting}
                      onCheckedChange={setUpdateExisting}
                      disabled={loading}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {language === 'ar' ? 'مزامنة تلقائية يومية' : 'Auto-sync Daily'}
                      </div>
                      <div className="text-sm text-gray-600">
                        {language === 'ar'
                          ? 'تحديث المنتجات تلقائياً كل 24 ساعة'
                          : 'Automatically update products every 24 hours'}
                      </div>
                    </div>
                    <Switch
                      checked={autoSync}
                      onCheckedChange={setAutoSync}
                      disabled={loading}
                    />
                  </div>
                </div>
              </Card>

              {/* Start Import Button */}
              <Card className="p-6 backdrop-blur-sm bg-white/80 border-purple-100">
                <Button
                  onClick={startImport}
                  disabled={loading || !selectedMerchant}
                  className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      {language === 'ar' ? 'جاري الاستيراد...' : 'Importing...'}
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      {language === 'ar' ? 'بدء الاستيراد' : 'Start Import'}
                    </>
                  )}
                </Button>
              </Card>

              {/* Current Session Progress */}
              <AnimatePresence>
                {currentSession && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Card className="p-6 backdrop-blur-sm bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(currentSession.status)}
                          <div>
                            <div className="font-semibold">
                              {language === 'ar' ? 'جلسة الاستيراد النشطة' : 'Active Import Session'}
                            </div>
                            <div className="text-sm text-gray-600">
                              ID: {currentSession.id}
                            </div>
                          </div>
                        </div>
                        {currentSession.status === 'processing' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={cancelImport}
                          >
                            {language === 'ar' ? 'إلغاء' : 'Cancel'}
                          </Button>
                        )}
                      </div>

                      {/* Progress Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                        <div className="text-center p-3 bg-white/60 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">{currentSession.stats.total}</div>
                          <div className="text-xs text-gray-600">{language === 'ar' ? 'إجمالي' : 'Total'}</div>
                        </div>
                        <div className="text-center p-3 bg-white/60 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{currentSession.stats.added}</div>
                          <div className="text-xs text-gray-600">{language === 'ar' ? 'مضاف' : 'Added'}</div>
                        </div>
                        <div className="text-center p-3 bg-white/60 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{currentSession.stats.updated}</div>
                          <div className="text-xs text-gray-600">{language === 'ar' ? 'محدث' : 'Updated'}</div>
                        </div>
                        <div className="text-center p-3 bg-white/60 rounded-lg">
                          <div className="text-2xl font-bold text-yellow-600">{currentSession.stats.duplicates}</div>
                          <div className="text-xs text-gray-600">{language === 'ar' ? 'مكرر' : 'Duplicates'}</div>
                        </div>
                        <div className="text-center p-3 bg-white/60 rounded-lg">
                          <div className="text-2xl font-bold text-red-600">{currentSession.stats.failed}</div>
                          <div className="text-xs text-gray-600">{language === 'ar' ? 'فشل' : 'Failed'}</div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {currentSession.status === 'processing' && currentSession.stats.total > 0 && (
                        <div className="mb-6">
                          <Progress 
                            value={(currentSession.stats.added + currentSession.stats.updated + currentSession.stats.duplicates + currentSession.stats.failed) / currentSession.stats.total * 100}
                            className="h-2"
                          />
                          <div className="text-center text-sm text-gray-600 mt-2">
                            {Math.round((currentSession.stats.added + currentSession.stats.updated + currentSession.stats.duplicates + currentSession.stats.failed) / currentSession.stats.total * 100)}%
                          </div>
                        </div>
                      )}

                      {/* Logs */}
                      <div className="bg-black/5 rounded-lg p-4 max-h-64 overflow-y-auto">
                        <div className="font-mono text-xs space-y-1">
                          {currentSession.logs.slice(-10).map((log: any, index: number) => (
                            <div key={index} className="flex gap-2">
                              <span className="text-gray-500">
                                {new Date(log.time).toLocaleTimeString()}
                              </span>
                              <span>{log.message}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {importHistory.length === 0 ? (
                <Card className="p-12 text-center backdrop-blur-sm bg-white/80 border-purple-100">
                  <Clock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">
                    {language === 'ar' ? 'لا يوجد سجل استيراد بعد' : 'No import history yet'}
                  </p>
                </Card>
              ) : (
                importHistory.map((session) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="p-6 backdrop-blur-sm bg-white/80 border-purple-100 hover:border-purple-300 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(session.status)}
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{session.id}</span>
                              {getStatusBadge(session.status)}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {new Date(session.startedAt).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
                              {session.duration && ` • ${formatDuration(session.duration)}`}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSession(session.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center text-sm">
                        <div className="p-2 bg-gray-50 rounded">
                          <div className="font-semibold">{session.stats.total}</div>
                          <div className="text-xs text-gray-600">{language === 'ar' ? 'إجمالي' : 'Total'}</div>
                        </div>
                        <div className="p-2 bg-green-50 rounded">
                          <div className="font-semibold text-green-600">{session.stats.added}</div>
                          <div className="text-xs text-gray-600">{language === 'ar' ? 'مضاف' : 'Added'}</div>
                        </div>
                        <div className="p-2 bg-blue-50 rounded">
                          <div className="font-semibold text-blue-600">{session.stats.updated}</div>
                          <div className="text-xs text-gray-600">{language === 'ar' ? 'محدث' : 'Updated'}</div>
                        </div>
                        <div className="p-2 bg-yellow-50 rounded">
                          <div className="font-semibold text-yellow-600">{session.stats.duplicates}</div>
                          <div className="text-xs text-gray-600">{language === 'ar' ? 'مكرر' : 'Duplicates'}</div>
                        </div>
                        <div className="p-2 bg-red-50 rounded">
                          <div className="font-semibold text-red-600">{session.stats.failed}</div>
                          <div className="text-xs text-gray-600">{language === 'ar' ? 'فشل' : 'Failed'}</div>
                        </div>
                      </div>

                      {/* Source Info */}
                      <div className="mt-4 text-sm text-gray-600">
                        <span className="font-medium">{language === 'ar' ? 'المصدر:' : 'Source:'}</span>
                        {' '}
                        {session.sourceType === 'csv' && 'CSV File'}
                        {session.sourceType === 'website' && `Website (${session.sourceData?.url})`}
                        {session.sourceType === 'api' && 'API'}
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
