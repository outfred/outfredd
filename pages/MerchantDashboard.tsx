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
import { Alert, AlertDescription } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';
import { Switch } from '../components/ui/switch';
import {
  Store, Package, Upload, Settings, BarChart3, Edit2, Save,
  Eye, Trash2, Plus, ArrowLeft, Users, TrendingUp, DollarSign,
  ShoppingBag, Calendar, MapPin, Phone, Mail, Globe, Clock,
  CheckCircle, XCircle, AlertCircle, ExternalLink
} from 'lucide-react';
import { motion } from 'motion/react';
import { merchantsApi, productsApi } from '../utils/api';
import { toast } from 'sonner';

export const MerchantDashboard: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  
  // Merchant Data
  const [merchantData, setMerchantData] = useState<any>(null);
  const [isEditingStore, setIsEditingStore] = useState(false);
  const [storeForm, setStoreForm] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    workingHours: '',
  });

  // Products
  const [products, setProducts] = useState<any[]>([]);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
  });

  // Stats
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    views: 0,
    orders: 0,
    pageViews: 0,
  });

  // Showrooms
  const [showrooms, setShowrooms] = useState<any[]>([]);
  const [isAddingShowroom, setIsAddingShowroom] = useState(false);
  const [showroomForm, setShowroomForm] = useState({
    name: '',
    location: '',
    startDate: '',
    endDate: '',
    hours: '',
    mapUrl: '',
  });

  useEffect(() => {
    if (user?.role === 'merchant') {
      loadMerchantData();
      loadProducts();
    }
  }, [user]);

  const loadMerchantData = async () => {
    try {
      setLoading(true);
      const response = await merchantsApi.list();
      // Find merchant by user email/id
      const merchant = response.merchants?.find((m: any) => 
        m.contactEmail === user?.email || m.userId === user?.id
      );
      
      if (merchant) {
        setMerchantData(merchant);
        setStoreForm({
          name: merchant.name || '',
          description: merchant.description || '',
          address: merchant.address || '',
          phone: merchant.phone || '',
          email: merchant.contactEmail || '',
          website: merchant.website || '',
          workingHours: merchant.workingHours || '9 AM - 9 PM',
        });
        setShowrooms(merchant.showrooms || []);
        
        // Load page views stats
        loadPageViewStats(merchant.id);
      }
    } catch (error: any) {
      console.error('Failed to load merchant data:', error);
      toast.error(language === 'ar' ? 'فشل تحميل بيانات المتجر' : 'Failed to load store data');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productsApi.list(user?.id);
      const productsList = response.products || [];
      setProducts(productsList);
      
      // Calculate real statistics
      const totalViews = productsList.reduce((sum: number, product: any) => 
        sum + (product.views || 0), 0
      );
      
      setStats(prev => ({
        ...prev,
        totalProducts: productsList.length,
        activeProducts: productsList.filter((p: any) => p.isActive !== false && p.status !== 'inactive').length,
        views: totalViews,
        orders: 0, // Will be added when order system is implemented
      }));
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const loadPageViewStats = async (merchantId: string) => {
    try {
      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-dec0bed9/merchant-page-views/${merchantId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setStats(prev => ({ ...prev, pageViews: data.totalViews || 0 }));
      }
    } catch (error) {
      console.error('Failed to load page views:', error);
    }
  };

  const handleSaveStore = async () => {
    try {
      setLoading(true);
      if (merchantData?.id) {
        await merchantsApi.update(merchantData.id, {
          name: storeForm.name,
          description: storeForm.description,
          address: storeForm.address,
          phone: storeForm.phone,
          contactEmail: storeForm.email,
          website: storeForm.website,
          workingHours: storeForm.workingHours,
        });
        toast.success(language === 'ar' ? 'تم تحديث المتجر بنجاح' : 'Store updated successfully');
        setIsEditingStore(false);
        loadMerchantData();
      }
    } catch (error: any) {
      toast.error(error.message || (language === 'ar' ? 'فشل التحديث' : 'Update failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async () => {
    try {
      setLoading(true);
      await productsApi.create({
        ...productForm,
        merchantId: merchantData?.id,
        price: parseFloat(productForm.price),
      });
      toast.success(language === 'ar' ? 'تم إضافة المنتج بنجاح' : 'Product added successfully');
      setIsAddingProduct(false);
      setProductForm({ name: '', description: '', price: '', category: '', image: '' });
      loadProducts();
    } catch (error: any) {
      toast.error(error.message || (language === 'ar' ? 'فشلت إضافة المنتج' : 'Failed to add product'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm(language === 'ar' ? 'هل تريد حذف هذا المنتج؟' : 'Delete this product?')) return;
    
    try {
      await productsApi.delete(productId);
      toast.success(language === 'ar' ? 'تم حذف المنتج' : 'Product deleted');
      loadProducts();
    } catch (error: any) {
      toast.error(error.message || (language === 'ar' ? 'فشل الحذف' : 'Delete failed'));
    }
  };

  const handleAddShowroom = async () => {
    try {
      setLoading(true);
      const updatedShowrooms = [...showrooms, { ...showroomForm, id: generateId() }];
      
      await merchantsApi.update(merchantData.id, {
        showrooms: updatedShowrooms,
      });
      
      setShowrooms(updatedShowrooms);
      setIsAddingShowroom(false);
      setShowroomForm({
        name: '',
        location: '',
        startDate: '',
        endDate: '',
        hours: '',
        mapUrl: '',
      });
      toast.success(language === 'ar' ? 'تم إضافة الشوروم' : 'Showroom added');
    } catch (error: any) {
      toast.error(error.message || (language === 'ar' ? 'فشل إضافة الشوروم' : 'Failed to add showroom'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteShowroom = async (showroomId: string) => {
    if (!confirm(language === 'ar' ? 'هل تريد حذف هذا الشوروم؟' : 'Delete this showroom?')) return;
    
    try {
      setLoading(true);
      const updatedShowrooms = showrooms.filter((s: any) => s.id !== showroomId);
      
      await merchantsApi.update(merchantData.id, {
        showrooms: updatedShowrooms,
      });
      
      setShowrooms(updatedShowrooms);
      toast.success(language === 'ar' ? 'تم حذف الشوروم' : 'Showroom deleted');
    } catch (error: any) {
      toast.error(error.message || (language === 'ar' ? 'فشل الحذف' : 'Delete failed'));
    } finally {
      setLoading(false);
    }
  };

  const generateId = () => crypto.randomUUID();

  // Redirect if not merchant
  if (!user || user.role !== 'merchant') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-12 text-center glass-effect border-border">
          <Store className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="mb-2">
            {language === 'ar' ? 'غير مصرح' : 'Unauthorized'}
          </h3>
          <p className="text-muted-foreground mb-6">
            {language === 'ar' 
              ? 'هذه الصفحة متاحة للتجار فقط' 
              : 'This page is only for merchants'}
          </p>
          <Button onClick={() => onNavigate('home')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Store className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {language === 'ar' ? 'لوحة تحكم المتجر' : 'Store Dashboard'}
                </h1>
                <p className="text-muted-foreground">
                  {merchantData?.name || (language === 'ar' ? 'متجرك' : 'Your Store')}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onNavigate('account')}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {language === 'ar' ? 'الحساب' : 'Account'}
              </Button>
              <Button
                onClick={() => onNavigate('import')}
                className="bg-gradient-to-r from-primary to-accent text-primary-foreground gap-2"
              >
                <Upload className="w-4 h-4" />
                {language === 'ar' ? 'استيراد منتجات' : 'Import Products'}
              </Button>
            </div>
          </div>

          {/* Status Badge */}
          {merchantData && (
            <Badge 
              variant={merchantData.status === 'approved' ? 'default' : 'secondary'}
              className="gap-1"
            >
              {merchantData.status === 'approved' ? (
                <CheckCircle className="w-3 h-3" />
              ) : merchantData.status === 'rejected' ? (
                <XCircle className="w-3 h-3" />
              ) : (
                <Clock className="w-3 h-3" />
              )}
              {language === 'ar' 
                ? merchantData.status === 'approved' ? 'معتمد' : merchantData.status === 'rejected' ? 'مرفوض' : 'قيد المراجعة'
                : merchantData.status === 'approved' ? 'Approved' : merchantData.status === 'rejected' ? 'Rejected' : 'Pending'}
            </Badge>
          )}
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6 glass-effect border-border">
              <div className="flex items-center justify-between mb-2">
                <Package className="w-8 h-8 text-primary" />
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3>{stats.totalProducts}</h3>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' ? 'إجمالي المنتجات' : 'Total Products'}
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6 glass-effect border-border">
              <div className="flex items-center justify-between mb-2">
                <ShoppingBag className="w-8 h-8 text-accent" />
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <h3>{stats.activeProducts}</h3>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' ? 'منتجات نشطة' : 'Active Products'}
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 glass-effect border-border">
              <div className="flex items-center justify-between mb-2">
                <Eye className="w-8 h-8 text-purple-500" />
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3>{stats.views}</h3>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' ? 'المشاهدات' : 'Views'}
              </p>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="p-6 glass-effect border-border">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-8 h-8 text-green-500" />
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <h3>{stats.orders}</h3>
              <p className="text-sm text-muted-foreground">
                {language === 'ar' ? 'الطلبات' : 'Orders'}
              </p>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="glass-effect border-border">
            <TabsTrigger value="overview">
              <BarChart3 className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'نظرة عامة' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="products">
              <Package className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'المنتجات' : 'Products'}
            </TabsTrigger>
            <TabsTrigger value="store">
              <Store className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'المتجر' : 'Store Info'}
            </TabsTrigger>
            <TabsTrigger value="showrooms">
              <MapPin className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'الشورومات' : 'Showrooms'}
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="w-4 h-4 mr-2" />
              {language === 'ar' ? 'الإعدادات' : 'Settings'}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card className="p-6 glass-effect border-border">
              <h2 className="mb-6">
                {language === 'ar' ? 'نشاط المتجر' : 'Store Activity'}
              </h2>
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    {language === 'ar' 
                      ? 'هذه الإحصائيات تجريبية. سيتم تفعيل التتبع الكامل قريباً.'
                      : 'These are demo statistics. Full tracking will be enabled soon.'}
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-secondary/20">
                    <div className="flex items-center gap-3 mb-2">
                      <Calendar className="w-5 h-5 text-primary" />
                      <h4>{language === 'ar' ? 'الأسبوع الحالي' : 'This Week'}</h4>
                    </div>
                    <p className="text-2xl">{stats.views}</p>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' ? 'مشاهدة للمنتجات' : 'Product views'}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-secondary/20">
                    <div className="flex items-center gap-3 mb-2">
                      <Globe className="w-5 h-5 text-accent" />
                      <h4>{language === 'ar' ? 'زوار صفحة المتجر' : 'Store Page Visitors'}</h4>
                    </div>
                    <p className="text-2xl">{stats.pageViews}</p>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' ? 'إجمالي الزيارات' : 'Total visits'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card className="p-6 glass-effect border-border">
              <div className="flex items-center justify-between mb-6">
                <h2>{language === 'ar' ? 'إدارة المنتجات' : 'Manage Products'}</h2>
                <Button
                  onClick={() => setIsAddingProduct(true)}
                  className="bg-gradient-to-r from-primary to-accent text-primary-foreground gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {language === 'ar' ? 'إضافة منتج' : 'Add Product'}
                </Button>
              </div>

              {isAddingProduct && (
                <Card className="p-6 mb-6 bg-secondary/20">
                  <h3 className="mb-4">{language === 'ar' ? 'منتج جديد' : 'New Product'}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>{language === 'ar' ? 'الاسم' : 'Name'}</Label>
                      <Input
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        className="bg-input-background"
                      />
                    </div>
                    <div>
                      <Label>{language === 'ar' ? 'السعر' : 'Price'}</Label>
                      <Input
                        type="number"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        className="bg-input-background"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>{language === 'ar' ? 'الوصف' : 'Description'}</Label>
                      <Textarea
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        className="bg-input-background"
                      />
                    </div>
                    <div>
                      <Label>{language === 'ar' ? 'الفئة' : 'Category'}</Label>
                      <Input
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        className="bg-input-background"
                      />
                    </div>
                    <div>
                      <Label>{language === 'ar' ? 'رابط الصورة' : 'Image URL'}</Label>
                      <Input
                        value={productForm.image}
                        onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                        className="bg-input-background"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={handleAddProduct}
                      disabled={loading}
                      className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {language === 'ar' ? 'حفظ' : 'Save'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddingProduct(false)}
                    >
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </Button>
                  </div>
                </Card>
              )}

              {products.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    {language === 'ar' 
                      ? 'لا توجد منتجات بعد. ابدأ بإضافة منتجاتك!'
                      : 'No products yet. Start adding your products!'}
                  </p>
                  <Button onClick={() => onNavigate('import')} variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    {language === 'ar' ? 'استيراد منتجات' : 'Import Products'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map((product: any) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border bg-secondary/10"
                    >
                      <div className="flex items-center gap-4">
                        {product.image && (
                          <div className="w-16 h-16 rounded-lg bg-secondary overflow-hidden">
                            <img 
                              src={product.image} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div>
                          <h4>{product.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {product.price ? `$${product.price}` : 'No price'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Store Info Tab */}
          <TabsContent value="store" className="space-y-6">
            <Card className="p-6 glass-effect border-border">
              <div className="flex items-center justify-between mb-6">
                <h2>{language === 'ar' ? 'معلومات المتجر' : 'Store Information'}</h2>
                <Button
                  variant="outline"
                  onClick={() => setIsEditingStore(!isEditingStore)}
                  className="gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  {isEditingStore 
                    ? (language === 'ar' ? 'إلغاء' : 'Cancel')
                    : (language === 'ar' ? 'تعديل' : 'Edit')}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>{language === 'ar' ? 'اسم المتجر' : 'Store Name'}</Label>
                  {isEditingStore ? (
                    <Input
                      value={storeForm.name}
                      onChange={(e) => setStoreForm({ ...storeForm, name: e.target.value })}
                      className="bg-input-background"
                    />
                  ) : (
                    <p className="mt-2">{storeForm.name || '-'}</p>
                  )}
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </Label>
                  {isEditingStore ? (
                    <Input
                      type="email"
                      value={storeForm.email}
                      onChange={(e) => setStoreForm({ ...storeForm, email: e.target.value })}
                      className="bg-input-background"
                    />
                  ) : (
                    <p className="mt-2">{storeForm.email || '-'}</p>
                  )}
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {language === 'ar' ? 'الهاتف' : 'Phone'}
                  </Label>
                  {isEditingStore ? (
                    <Input
                      value={storeForm.phone}
                      onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
                      className="bg-input-background"
                    />
                  ) : (
                    <p className="mt-2">{storeForm.phone || '-'}</p>
                  )}
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    {language === 'ar' ? 'الموقع الإلكتروني' : 'Website'}
                  </Label>
                  {isEditingStore ? (
                    <Input
                      value={storeForm.website}
                      onChange={(e) => setStoreForm({ ...storeForm, website: e.target.value })}
                      className="bg-input-background"
                    />
                  ) : (
                    <p className="mt-2">{storeForm.website || '-'}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {language === 'ar' ? 'العنوان' : 'Address'}
                  </Label>
                  {isEditingStore ? (
                    <Textarea
                      value={storeForm.address}
                      onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                      className="bg-input-background"
                    />
                  ) : (
                    <p className="mt-2">{storeForm.address || '-'}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label>{language === 'ar' ? 'الوصف' : 'Description'}</Label>
                  {isEditingStore ? (
                    <Textarea
                      value={storeForm.description}
                      onChange={(e) => setStoreForm({ ...storeForm, description: e.target.value })}
                      className="bg-input-background"
                      rows={4}
                    />
                  ) : (
                    <p className="mt-2">{storeForm.description || '-'}</p>
                  )}
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {language === 'ar' ? 'ساعات العمل' : 'Working Hours'}
                  </Label>
                  {isEditingStore ? (
                    <Input
                      value={storeForm.workingHours}
                      onChange={(e) => setStoreForm({ ...storeForm, workingHours: e.target.value })}
                      className="bg-input-background"
                    />
                  ) : (
                    <p className="mt-2">{storeForm.workingHours || '-'}</p>
                  )}
                </div>
              </div>

              {isEditingStore && (
                <div className="mt-6">
                  <Button
                    onClick={handleSaveStore}
                    disabled={loading}
                    className="bg-gradient-to-r from-primary to-accent text-primary-foreground gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Showrooms Tab */}
          <TabsContent value="showrooms" className="space-y-6">
            <Card className="p-6 glass-effect border-border">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2>{language === 'ar' ? 'إدارة الشورومات' : 'Manage Showrooms'}</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {language === 'ar' 
                      ? 'أضف معلومات الشورومات لتظهر في صفحة متجرك' 
                      : 'Add showroom information to display on your store page'}
                  </p>
                </div>
                <Button
                  onClick={() => setIsAddingShowroom(true)}
                  className="bg-gradient-to-r from-primary to-accent text-primary-foreground gap-2"
                >
                  <Plus className="w-4 h-4" />
                  {language === 'ar' ? 'إضافة شوروم' : 'Add Showroom'}
                </Button>
              </div>

              {/* Page Views Stats */}
              <Alert className="mb-6">
                <Eye className="w-4 h-4" />
                <AlertDescription>
                  <div className="flex items-center justify-between">
                    <span>
                      {language === 'ar' ? 'عدد زوار صفحة متجرك:' : 'Your store page views:'}
                    </span>
                    <Badge variant="secondary" className="text-lg">
                      {stats.pageViews}
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Add Showroom Form */}
              {isAddingShowroom && (
                <Card className="p-6 mb-6 bg-secondary/20">
                  <h3 className="mb-4">{language === 'ar' ? 'شوروم جديد' : 'New Showroom'}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>{language === 'ar' ? 'اسم الشوروم' : 'Showroom Name'} *</Label>
                      <Input
                        value={showroomForm.name}
                        onChange={(e) => setShowroomForm({ ...showroomForm, name: e.target.value })}
                        placeholder={language === 'ar' ? 'مثال: معرض القاهرة' : 'e.g., Cairo Exhibition'}
                        className="bg-input-background"
                      />
                    </div>
                    <div>
                      <Label>{language === 'ar' ? 'الموقع' : 'Location'} *</Label>
                      <Input
                        value={showroomForm.location}
                        onChange={(e) => setShowroomForm({ ...showroomForm, location: e.target.value })}
                        placeholder={language === 'ar' ? 'مثال: مول مصر، 6 أكتوبر' : 'e.g., Mall of Egypt, 6th October'}
                        className="bg-input-background"
                      />
                    </div>
                    <div>
                      <Label>{language === 'ar' ? 'تاريخ البداية' : 'Start Date'}</Label>
                      <Input
                        type="date"
                        value={showroomForm.startDate}
                        onChange={(e) => setShowroomForm({ ...showroomForm, startDate: e.target.value })}
                        className="bg-input-background"
                      />
                    </div>
                    <div>
                      <Label>{language === 'ar' ? 'تاريخ النهاية' : 'End Date'}</Label>
                      <Input
                        type="date"
                        value={showroomForm.endDate}
                        onChange={(e) => setShowroomForm({ ...showroomForm, endDate: e.target.value })}
                        className="bg-input-background"
                      />
                    </div>
                    <div>
                      <Label>{language === 'ar' ? 'ساعات العمل' : 'Working Hours'}</Label>
                      <Input
                        value={showroomForm.hours}
                        onChange={(e) => setShowroomForm({ ...showroomForm, hours: e.target.value })}
                        placeholder={language === 'ar' ? 'مثال: 10 ص - 10 م' : 'e.g., 10 AM - 10 PM'}
                        className="bg-input-background"
                      />
                    </div>
                    <div>
                      <Label>{language === 'ar' ? 'رابط الخريطة (Google Maps)' : 'Map Link (Google Maps)'}</Label>
                      <Input
                        value={showroomForm.mapUrl}
                        onChange={(e) => setShowroomForm({ ...showroomForm, mapUrl: e.target.value })}
                        placeholder="https://maps.google.com/..."
                        className="bg-input-background"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button
                      onClick={handleAddShowroom}
                      disabled={loading || !showroomForm.name || !showroomForm.location}
                      className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {language === 'ar' ? 'حفظ' : 'Save'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddingShowroom(false)}
                    >
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </Button>
                  </div>
                </Card>
              )}

              {/* Showrooms List */}
              {showrooms.length === 0 ? (
                <div className="text-center py-12">
                  <MapPin className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    {language === 'ar' 
                      ? 'لا توجد شورومات بعد. أضف شوروم لتظهر معلوماته في صفحة متجرك!'
                      : 'No showrooms yet. Add a showroom to display it on your store page!'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {showrooms.map((showroom: any) => (
                    <Card key={showroom.id} className="p-6 bg-secondary/10">
                      <div className="flex items-start justify-between mb-4">
                        <h3>{showroom.name}</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteShowroom(showroom.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-muted-foreground">{showroom.location}</span>
                        </div>
                        {showroom.startDate && showroom.endDate && (
                          <div className="flex items-start gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">
                              {new Date(showroom.startDate).toLocaleDateString()} - {new Date(showroom.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {showroom.hours && (
                          <div className="flex items-start gap-2 text-sm">
                            <Clock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{showroom.hours}</span>
                          </div>
                        )}
                        {showroom.mapUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-2 gap-2"
                            onClick={() => window.open(showroom.mapUrl, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                            {language === 'ar' ? 'عرض على الخريطة' : 'View on Map'}
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="p-6 glass-effect border-border">
              <h2 className="mb-6">{language === 'ar' ? 'إعدادات المتجر' : 'Store Settings'}</h2>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4>{language === 'ar' ? 'المتجر مرئي' : 'Store Visibility'}</h4>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' 
                        ? 'اجعل متجرك مرئياً للعملاء' 
                        : 'Make your store visible to customers'}
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4>{language === 'ar' ? 'قبول الطلبات' : 'Accept Orders'}</h4>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' 
                        ? 'السماح للعملاء بتقديم الطلبات' 
                        : 'Allow customers to place orders'}
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <h4>{language === 'ar' ? 'إشعارات البريد الإلكتروني' : 'Email Notifications'}</h4>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' 
                        ? 'استلام إشعارات الطلبات الجديدة' 
                        : 'Receive notifications for new orders'}
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    {language === 'ar'
                      ? 'المزيد من الإعدادات ستكون متاحة قريباً.'
                      : 'More settings will be available soon.'}
                  </AlertDescription>
                </Alert>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
