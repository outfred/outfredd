import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../components/ui/sheet';
import { 
  Users, Store, Package, Settings, Layout, BarChart3, 
  Trash2, CheckCircle, XCircle, Shield, Plus, Edit, UserPlus, Save, Palette, Copy, Check,
  Menu, Home, CreditCard, Mail, Bot, FileText, Layers, ChevronRight, Bug
} from 'lucide-react';
import { motion } from 'motion/react';
import { adminApi, merchantsApi, productsApi } from '../utils/api';
import { toast } from 'sonner';
import { copyToClipboard } from '../utils/clipboard';
import { AdminDashboard } from './AdminDashboard';

interface NavigationItem {
  id: string;
  label: string;
  labelAr: string;
  icon: React.ElementType;
  onClick?: () => void;
}

interface NavigationSection {
  title: string;
  titleAr: string;
  items: NavigationItem[];
}

export const Admin: React.FC = () => {
  const { t, language } = useLanguage();
  const { user, isAdmin } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [analytics, setAnalytics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [merchants, setMerchants] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [filterMerchantId, setFilterMerchantId] = useState<string>('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  
  const [designSettings, setDesignSettings] = useState({
    primaryColor: '#3B1728',
    accentColor: '#8B4665',
    secondaryColor: '#F5EDF0',
  });

  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    merchantId: '',
    imageUrl: '',
    stock: '',
    isActive: true,
  });

  const [isMerchantDialogOpen, setIsMerchantDialogOpen] = useState(false);
  const [editingMerchant, setEditingMerchant] = useState<any>(null);
  const [merchantForm, setMerchantForm] = useState({
    brandName: '',
    description: '',
    email: '',
    phone: '',
    website: '',
    logo: '',
    managerId: '',
  });

  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: '',
  });

  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);

  const navigationSections: NavigationSection[] = [
    {
      title: 'Management',
      titleAr: 'الإدارة',
      items: [
        { id: 'users', label: 'Users', labelAr: 'المستخدمين', icon: Users },
        { id: 'merchants', label: 'Merchants', labelAr: 'التجار', icon: Store },
        { id: 'products', label: 'Products', labelAr: 'المنتجات', icon: Package },
      ]
    },
    {
      title: 'Engagement',
      titleAr: 'التفاعل',
      items: [
        { 
          id: 'analytics', 
          label: 'Analytics', 
          labelAr: 'الإحصائيات', 
          icon: BarChart3,
          onClick: () => window.location.hash = 'admin-analytics'
        },
        { 
          id: 'debug', 
          label: 'Debug', 
          labelAr: 'التصحيح', 
          icon: Bug,
          onClick: () => window.location.hash = 'debug'
        },
      ]
    },
    {
      title: 'Configuration',
      titleAr: 'الإعدادات',
      items: [
        { 
          id: 'site-settings', 
          label: 'Design & Branding', 
          labelAr: 'التصميم والعلامة التجارية', 
          icon: Palette,
          onClick: () => window.location.hash = 'admin-site-settings'
        },
        { 
          id: 'cms', 
          label: 'Content (CMS)', 
          labelAr: 'المحتوى', 
          icon: FileText,
          onClick: () => window.location.hash = 'admin-cms'
        },
        { 
          id: 'payment-settings', 
          label: 'Payments & Email', 
          labelAr: 'المدفوعات والبريد', 
          icon: CreditCard,
          onClick: () => window.location.hash = 'admin-payment-settings'
        },
        { 
          id: 'ai-settings', 
          label: 'AI Configuration', 
          labelAr: 'إعدادات الذكاء الاصطناعي', 
          icon: Bot,
          onClick: () => window.location.hash = 'admin-ai-settings'
        },
        { 
          id: 'subscriptions', 
          label: 'Subscription Plans', 
          labelAr: 'باقات الاشتراك', 
          icon: Layers,
          onClick: () => window.location.hash = 'admin-subscriptions'
        },
      ]
    }
  ];

  useEffect(() => {
    if (isAdmin) {
      loadAnalytics();
      loadDesignSettings();
    }
  }, [isAdmin]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getAnalytics();
      setAnalytics(data.analytics);
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getUsers();
      setUsers(data.users);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadMerchants = async () => {
    setLoading(true);
    try {
      const data = await merchantsApi.list();
      setMerchants(data.merchants);
    } catch (error) {
      console.error('Error loading merchants:', error);
      toast.error('Failed to load merchants');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await productsApi.list();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadDesignSettings = async () => {
    try {
      const data = await adminApi.getSettings();
      if (data.settings.colors) {
        setDesignSettings(data.settings.colors);
      }
    } catch (error) {
      console.error('Error loading design settings:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await adminApi.deleteUser(userId);
      toast.success('User deleted successfully');
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setUserForm({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'user',
    });
    setIsUserDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    try {
      await adminApi.updateUser(editingUser.id, userForm);
      toast.success('User updated successfully');
      setIsUserDialogOpen(false);
      loadUsers();
      loadAnalytics();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Failed to save user');
    }
  };

  const handleCopyUserId = async (userId: string) => {
    const success = await copyToClipboard(userId);
    if (success) {
      setCopiedUserId(userId);
      toast.success('User ID copied to clipboard!');
      setTimeout(() => setCopiedUserId(null), 2000);
    } else {
      toast.error('Failed to copy User ID. Please copy it manually.');
    }
  };

  const handleApproveMerchant = async (merchantId: string) => {
    try {
      await merchantsApi.approve(merchantId);
      toast.success('Merchant approved successfully');
      loadMerchants();
      loadAnalytics();
    } catch (error) {
      console.error('Error approving merchant:', error);
      toast.error('Failed to approve merchant');
    }
  };

  const handleRejectMerchant = async (merchantId: string) => {
    try {
      await merchantsApi.reject(merchantId);
      toast.success('Merchant rejected');
      loadMerchants();
    } catch (error) {
      console.error('Error rejecting merchant:', error);
      toast.error('Failed to reject merchant');
    }
  };

  const handleDeleteMerchant = async (merchantId: string) => {
    if (!confirm('Are you sure you want to delete this merchant?')) return;
    try {
      await merchantsApi.delete(merchantId);
      toast.success('Merchant deleted successfully');
      loadMerchants();
      loadAnalytics();
    } catch (error) {
      console.error('Error deleting merchant:', error);
      toast.error('Failed to delete merchant');
    }
  };

  const handleEditMerchant = (merchant: any) => {
    setEditingMerchant(merchant);
    setMerchantForm({
      brandName: merchant.brandName || '',
      description: merchant.description || '',
      email: merchant.email || '',
      phone: merchant.phone || '',
      website: merchant.website || '',
      logo: merchant.logo || '',
      managerId: merchant.managerId || '',
    });
    setIsMerchantDialogOpen(true);
  };

  const handleSaveMerchant = async () => {
    if (!editingMerchant) return;
    try {
      await merchantsApi.update(editingMerchant.id, merchantForm);
      toast.success('Merchant updated successfully');
      setIsMerchantDialogOpen(false);
      loadMerchants();
    } catch (error) {
      console.error('Error saving merchant:', error);
      toast.error('Failed to save merchant');
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: '',
      category: '',
      merchantId: '',
      imageUrl: '',
      stock: '',
      isActive: true,
    });
    setIsProductDialogOpen(true);
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price ?? '',
      category: product.category || '',
      merchantId: product.merchantId || '',
      imageUrl: product.imageUrl || '',
      stock: product.stock ?? '',
      isActive: product.isActive !== false,
    });
    setIsProductDialogOpen(true);
  };

  const handleSaveProduct = async () => {
    try {
      if (editingProduct) {
        await productsApi.update(editingProduct.id, productForm);
        toast.success('Product updated successfully');
      } else {
        await productsApi.create(productForm);
        toast.success('Product added successfully');
      }
      setIsProductDialogOpen(false);
      loadProducts();
      loadAnalytics();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Failed to save product');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await productsApi.delete(productId);
      toast.success('Product deleted successfully');
      loadProducts();
      loadAnalytics();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.length === 0) {
      toast.error('No products selected');
      return;
    }
    if (!confirm(`Are you sure you want to delete ${selectedProducts.length} product(s)?`)) return;
    try {
      await Promise.all(selectedProducts.map(id => productsApi.delete(id)));
      toast.success(`${selectedProducts.length} product(s) deleted successfully`);
      setSelectedProducts([]);
      loadProducts();
    } catch (error) {
      console.error('Error deleting products:', error);
      toast.error('Failed to delete some products');
    }
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const toggleAllProducts = () => {
    const filteredProductIds = filteredProducts.map(p => p.id);
    if (selectedProducts.length === filteredProductIds.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProductIds);
    }
  };

  const filteredProducts = filterMerchantId
    ? products.filter(p => p.merchantId === filterMerchantId)
    : products;

  const handleNavigationClick = (item: NavigationItem) => {
    if (item.onClick) {
      item.onClick();
    } else {
      setActiveSection(item.id);
      setIsSidebarOpen(false);
      
      if (item.id === 'users') loadUsers();
      else if (item.id === 'merchants') loadMerchants();
      else if (item.id === 'products') loadProducts();
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold">
              {language === 'ar' ? 'لوحة التحكم' : 'Admin Panel'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {language === 'ar' ? 'إدارة كاملة' : 'Full Management'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <button
          onClick={() => { setActiveSection('dashboard'); setIsSidebarOpen(false); }}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
            activeSection === 'dashboard'
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-secondary'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="font-medium">
            {language === 'ar' ? 'لوحة المعلومات' : 'Dashboard'}
          </span>
        </button>

        {navigationSections.map((section, idx) => (
          <div key={idx}>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase px-4 mb-2">
              {language === 'ar' ? section.titleAr : section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigationClick(item)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all group ${
                    activeSection === item.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-secondary'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="flex-1 text-left font-medium">
                    {language === 'ar' ? item.labelAr : item.label}
                  </span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${
                    activeSection === item.id ? '' : 'group-hover:translate-x-1'
                  }`} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-border">
        <div className="p-3 rounded-lg bg-secondary/50 border border-border">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-sm font-medium">{user?.name}</span>
          </div>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
      </div>
    </div>
  );

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12">
        <Card className="p-8 text-center glass-effect border-border max-w-lg mx-4">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="mb-3 text-red-600 dark:text-red-400">Access Denied</h3>
          <p className="text-muted-foreground mb-6">
            {user ? 
              'You need admin privileges to access this page.' :
              'You need to login with an admin account to access this page.'
            }
          </p>
          
          {!user && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 text-left">
                <p className="text-sm mb-2">
                  <strong>📧 Demo Admin Account:</strong>
                </p>
                <code className="block text-xs bg-blue-100 dark:bg-blue-900 px-3 py-2 rounded mt-2">
                  Email: admin@outfred.com<br/>
                  Password: admin123
                </code>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    window.location.hash = 'login';
                    window.location.reload();
                  }}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-pink-600 text-white"
                >
                  Go to Login
                </Button>
                <Button
                  onClick={() => {
                    window.location.hash = 'debug';
                    window.location.reload();
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Debug Panel
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground mt-4">
                Need help? Open Debug Panel to diagnose auth issues
              </p>
            </div>
          )}
          
          {user && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-3">
                Current role: <Badge variant="outline">{user.role}</Badge>
              </p>
              <p className="text-xs text-muted-foreground">
                Contact an administrator to upgrade your account to admin access.
              </p>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden lg:flex lg:w-64 border-r border-border glass-effect">
        <SidebarContent />
      </aside>

      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="flex items-center gap-4 p-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">
                {activeSection === 'dashboard' && (language === 'ar' ? 'لوحة المعلومات' : 'Dashboard')}
                {activeSection === 'users' && (language === 'ar' ? 'إدارة المستخدمين' : 'User Management')}
                {activeSection === 'merchants' && (language === 'ar' ? 'إدارة التجار' : 'Merchant Management')}
                {activeSection === 'products' && (language === 'ar' ? 'إدارة المنتجات' : 'Product Management')}
              </h1>
            </div>
          </div>
        </div>

        <div className="p-6">
          {activeSection === 'dashboard' && <AdminDashboard />}

          {activeSection === 'users' && (
            <Card className="glass-effect border-border">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2>{language === 'ar' ? 'إدارة المستخدمين' : 'User Management'}</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      {language === 'ar' 
                        ? 'انسخ معرف المستخدم لتعيينه كمعرف مدير للتجار' 
                        : 'Copy User ID to assign as Manager ID for merchants'}
                    </p>
                  </div>
                  <Button className="gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground">
                    <UserPlus className="w-4 h-4" />
                    {language === 'ar' ? 'إضافة مستخدم' : 'Add User'}
                  </Button>
                </div>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {language === 'ar' ? 'لم يتم العثور على مستخدمين' : 'No users found'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{user.name}</h3>
                              <Badge className="capitalize">{user.role}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              <span className="font-medium">Email:</span> {user.email}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium">User ID:</span>{' '}
                                <code className="bg-muted px-2 py-1 rounded text-xs select-all cursor-text">
                                  {user.id}
                                </code>
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyUserId(user.id)}
                                className="h-6 px-2"
                              >
                                {copiedUserId === user.id ? (
                                  <Check className="w-3 h-3 text-green-600" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-3 border-t border-border">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                            className="gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            {language === 'ar' ? 'تعديل' : 'Edit'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 className="w-4 h-4" />
                            {language === 'ar' ? 'حذف' : 'Delete'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )}

          {activeSection === 'merchants' && (
            <Card className="glass-effect border-border">
              <div className="p-6 border-b border-border">
                <h2>{language === 'ar' ? 'إدارة التجار' : 'Merchant Management'}</h2>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                ) : merchants.length === 0 ? (
                  <div className="text-center py-12">
                    <Store className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {language === 'ar' ? 'لم يتم العثور على تجار' : 'No merchants found'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {merchants.map((merchant) => (
                      <div
                        key={merchant.id}
                        className="p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{merchant.brandName}</h3>
                              <Badge 
                                className={
                                  merchant.status === 'approved' 
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                    : merchant.status === 'pending'
                                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                                    : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                }
                              >
                                {merchant.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {merchant.description}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              <span className="font-medium">Email:</span> {merchant.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 pt-3 border-t border-border flex-wrap">
                          {merchant.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleApproveMerchant(merchant.id)}
                                className="gap-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                              >
                                <CheckCircle className="w-4 h-4" />
                                {language === 'ar' ? 'موافقة' : 'Approve'}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRejectMerchant(merchant.id)}
                                className="gap-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                              >
                                <XCircle className="w-4 h-4" />
                                {language === 'ar' ? 'رفض' : 'Reject'}
                              </Button>
                            </>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditMerchant(merchant)}
                            className="gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            {language === 'ar' ? 'تعديل' : 'Edit'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteMerchant(merchant.id)}
                            className="gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 className="w-4 h-4" />
                            {language === 'ar' ? 'حذف' : 'Delete'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )}

          {activeSection === 'products' && (
            <Card className="glass-effect border-border">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                  <h2>{language === 'ar' ? 'إدارة المنتجات' : 'Product Management'}</h2>
                  <div className="flex gap-2">
                    {selectedProducts.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBulkDelete}
                        className="gap-2 border-destructive text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                        {language === 'ar' ? `حذف (${selectedProducts.length})` : `Delete (${selectedProducts.length})`}
                      </Button>
                    )}
                    <Button
                      onClick={handleAddProduct}
                      className="gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground"
                    >
                      <Plus className="w-4 h-4" />
                      {language === 'ar' ? 'إضافة منتج' : 'Add Product'}
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder={language === 'ar' ? 'تصفية حسب معرف التاجر' : 'Filter by merchant ID'}
                    value={filterMerchantId}
                    onChange={(e) => setFilterMerchantId(e.target.value)}
                    className="max-w-xs bg-input-background"
                  />
                </div>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {language === 'ar' ? 'لم يتم العثور على منتجات' : 'No products found'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="p-4 rounded-lg bg-secondary/50 border border-border hover:border-primary transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.id)}
                            onChange={() => toggleProductSelection(product.id)}
                            className="mt-1"
                          />
                          {product.imageUrl && (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{product.name}</h3>
                              <Badge variant={product.isActive ? 'default' : 'secondary'}>
                                {product.isActive ? 'Active' : 'Inactive'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              {product.description}
                            </p>
                            <div className="flex gap-4 text-sm text-muted-foreground">
                              <span><strong>Price:</strong> ${product.price}</span>
                              <span><strong>Category:</strong> {product.category}</span>
                              <span><strong>Stock:</strong> {product.stock}</span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-destructive text-destructive"
                              onClick={() => handleDeleteProduct(product.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </main>

      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="max-w-xl glass-effect">
          <DialogHeader>
            <DialogTitle>{language === 'ar' ? 'تعديل المستخدم' : 'Edit User'}</DialogTitle>
            <DialogDescription>
              {language === 'ar' 
                ? 'تحديث معلومات المستخدم وأذونات الدور' 
                : 'Update user information and role permissions'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {editingUser && (
              <div className="p-3 rounded-lg bg-muted/50 mb-4">
                <p className="text-sm text-muted-foreground mb-2">
                  <span className="font-medium">User ID:</span>
                </p>
                <code className="block bg-background px-3 py-2 rounded text-xs break-all select-all cursor-text mb-3">
                  {editingUser.id}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyUserId(editingUser.id)}
                  className="gap-2 w-full"
                >
                  {copiedUserId === editingUser.id ? (
                    <>
                      <Check className="w-4 h-4 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy User ID
                    </>
                  )}
                </Button>
              </div>
            )}
            
            <div>
              <Label>Name</Label>
              <Input
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                className="bg-input-background mt-2"
              />
            </div>

            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                className="bg-input-background mt-2"
              />
            </div>

            <div>
              <Label>Role</Label>
              <select
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                className="w-full mt-2 h-10 px-3 rounded-md border border-border bg-input-background"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="merchant">Merchant</option>
              </select>
            </div>

            <Button 
              className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground gap-2"
              onClick={handleSaveUser}
            >
              <Save className="w-4 h-4" />
              {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isMerchantDialogOpen} onOpenChange={setIsMerchantDialogOpen}>
        <DialogContent className="max-w-2xl glass-effect">
          <DialogHeader>
            <DialogTitle>{language === 'ar' ? 'تعديل التاجر' : 'Edit Merchant'}</DialogTitle>
            <DialogDescription>
              {language === 'ar' 
                ? 'تحديث ملف التاجر ومعلومات المتجر' 
                : 'Update merchant profile and store information'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Brand Name</Label>
                <Input
                  value={merchantForm.brandName}
                  onChange={(e) => setMerchantForm({ ...merchantForm, brandName: e.target.value })}
                  className="bg-input-background"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={merchantForm.email}
                  onChange={(e) => setMerchantForm({ ...merchantForm, email: e.target.value })}
                  className="bg-input-background"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <Input
                  value={merchantForm.phone}
                  onChange={(e) => setMerchantForm({ ...merchantForm, phone: e.target.value })}
                  className="bg-input-background"
                />
              </div>
              <div>
                <Label>Website</Label>
                <Input
                  value={merchantForm.website}
                  onChange={(e) => setMerchantForm({ ...merchantForm, website: e.target.value })}
                  className="bg-input-background"
                />
              </div>
            </div>
            <div>
              <Label>Logo URL</Label>
              <Input
                value={merchantForm.logo}
                onChange={(e) => setMerchantForm({ ...merchantForm, logo: e.target.value })}
                className="bg-input-background"
              />
            </div>
            <div>
              <Label>Manager User ID</Label>
              <Input
                value={merchantForm.managerId}
                onChange={(e) => setMerchantForm({ ...merchantForm, managerId: e.target.value })}
                className="bg-input-background"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={merchantForm.description}
                onChange={(e) => setMerchantForm({ ...merchantForm, description: e.target.value })}
                className="bg-input-background"
                rows={4}
              />
            </div>
            <Button 
              className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground"
              onClick={handleSaveMerchant}
            >
              {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
        <DialogContent className="max-w-2xl glass-effect">
          <DialogHeader>
            <DialogTitle>
              {editingProduct 
                ? (language === 'ar' ? 'تعديل المنتج' : 'Edit Product')
                : (language === 'ar' ? 'إضافة منتج جديد' : 'Add New Product')}
            </DialogTitle>
            <DialogDescription>
              {editingProduct 
                ? (language === 'ar' ? 'تحديث تفاصيل المنتج والتوفر' : 'Update product details and availability')
                : (language === 'ar' ? 'إضافة منتج جديد إلى الكتالوج' : 'Add a new product to the catalog')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Product Name</Label>
                <Input
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="bg-input-background"
                />
              </div>
              <div>
                <Label>Price</Label>
                <Input
                  type="number"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  className="bg-input-background"
                  placeholder="99.99"
                />
              </div>
            </div>
            <div>
              <Label>Category</Label>
              <Input
                value={productForm.category}
                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                className="bg-input-background"
                placeholder="e.g., Clothing, Accessories"
              />
            </div>
            <div>
              <Label>Merchant ID</Label>
              <Input
                value={productForm.merchantId}
                onChange={(e) => setProductForm({ ...productForm, merchantId: e.target.value })}
                className="bg-input-background"
                placeholder="Select or enter merchant ID"
              />
            </div>
            <div>
              <Label>Image URL</Label>
              <Input
                value={productForm.imageUrl}
                onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                className="bg-input-background"
                placeholder="https://example.com/product-image.jpg"
              />
            </div>
            <div>
              <Label>Stock</Label>
              <Input
                type="number"
                value={productForm.stock}
                onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                className="bg-input-background"
                placeholder="Available quantity"
                min="0"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                className="bg-input-background"
                rows={4}
                placeholder="Describe the product..."
              />
            </div>
            <div className="flex items-center justify-between p-4 bg-secondary/20 rounded-lg">
              <div>
                <Label className="text-base font-medium">Product Status</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {productForm.isActive 
                    ? (language === 'ar' ? 'نشط - مرئي للعملاء' : 'Active - Visible to customers')
                    : (language === 'ar' ? 'غير نشط - مخفي عن العملاء' : 'Inactive - Hidden from customers')}
                </p>
              </div>
              <Switch
                checked={productForm.isActive}
                onCheckedChange={(checked) => setProductForm({ ...productForm, isActive: checked })}
              />
            </div>
            <Button 
              className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground"
              onClick={handleSaveProduct}
            >
              {editingProduct 
                ? (language === 'ar' ? 'تحديث المنتج' : 'Update Product')
                : (language === 'ar' ? 'إضافة منتج' : 'Add Product')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
