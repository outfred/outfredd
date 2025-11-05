import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../components/ui/sheet';
import { 
  Users, Store, Package, Shield, Menu, Home, ChevronRight, 
  BarChart3, Bug, Palette, FileText, CreditCard, Bot, Layers, Mail
} from 'lucide-react';
import { motion } from 'motion/react';
import { adminApi, merchantsApi, productsApi } from '../utils/api';
import { userSubscriptionApi } from '../utils/adminApi';
import { toast } from 'sonner';
import { copyToClipboard } from '../utils/clipboard';
import { AdminDashboard } from './AdminDashboard';
import { AdminUsers } from './admin/AdminUsers';
import { AdminMerchants } from './admin/AdminMerchants';
import { AdminProducts } from './admin/AdminProducts';
import { NavigationItem, NavigationSection, UserForm, SubscriptionForm, MerchantForm, ProductForm } from './admin/types';

export const Admin: React.FC = () => {
  const { language } = useLanguage();
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

  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState<ProductForm>({
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
  const [merchantForm, setMerchantForm] = useState<MerchantForm>({
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
  const [userForm, setUserForm] = useState<UserForm>({
    name: '',
    email: '',
    role: '',
  });

  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<any>(null);
  const [subscriptionForm, setSubscriptionForm] = useState<SubscriptionForm>({
    subscription_plan: 'Free',
    searches_count: 0,
    searches_limit: 5,
    payment_status: 'none',
    subscription_expires_at: null,
  });
  const [savingSubscription, setSavingSubscription] = useState(false);
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
          label: 'Payments & SMTP', 
          labelAr: 'المدفوعات و SMTP', 
          icon: CreditCard,
          onClick: () => window.location.hash = 'admin-payment-settings'
        },
        { 
          id: 'email-templates', 
          label: 'Email Templates', 
          labelAr: 'قوالب البريد', 
          icon: Mail,
          onClick: () => window.location.hash = 'admin-email-templates'
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

  const handleEditSubscription = (user: any) => {
    setEditingSubscription(user);
    const planLimits: { [key: string]: number } = {
      'Free': 5,
      'Basic': 100,
      'Pro': 999999
    };
    
    const currentPlan = user.subscription_plan || 'Free';
    setSubscriptionForm({
      subscription_plan: currentPlan,
      searches_count: user.searches_count || 0,
      searches_limit: user.searches_limit || planLimits[currentPlan] || 5,
      payment_status: user.payment_status || 'none',
      subscription_expires_at: user.subscription_expires_at ? new Date(user.subscription_expires_at) : null,
    });
    setIsSubscriptionDialogOpen(true);
  };

  const handleSubscriptionPlanChange = (plan: string) => {
    const planLimits: { [key: string]: number } = {
      'Free': 5,
      'Basic': 100,
      'Pro': 999999
    };
    
    setSubscriptionForm(prev => ({
      ...prev,
      subscription_plan: plan,
      searches_limit: planLimits[plan] || 5,
    }));
  };

  const handleSaveSubscription = async () => {
    if (!editingSubscription) return;
    
    setSavingSubscription(true);
    try {
      const payload: any = {
        subscription_plan: subscriptionForm.subscription_plan,
        searches_count: Number(subscriptionForm.searches_count),
        searches_limit: Number(subscriptionForm.searches_limit),
        payment_status: subscriptionForm.payment_status,
      };
      
      if (subscriptionForm.subscription_expires_at) {
        payload.subscription_expires_at = subscriptionForm.subscription_expires_at.toISOString();
      }
      
      await userSubscriptionApi.updateUserSubscription(editingSubscription.id, payload);
      
      const successMessage = language === 'ar' 
        ? 'تم تحديث الباقة بنجاح' 
        : 'Subscription updated successfully';
      toast.success(successMessage);
      
      setIsSubscriptionDialogOpen(false);
      loadUsers();
    } catch (error) {
      console.error('Error saving subscription:', error);
      const errorMessage = language === 'ar' 
        ? 'فشل تحديث الباقة' 
        : 'Failed to update subscription';
      toast.error(errorMessage);
    } finally {
      setSavingSubscription(false);
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
    const filteredProductIds = (filterMerchantId
      ? products.filter(p => p.merchantId === filterMerchantId)
      : products).map(p => p.id);
    
    if (selectedProducts.length === filteredProductIds.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProductIds);
    }
  };

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
              <Button
                onClick={() => window.location.hash = 'home'}
                variant="outline"
                className="w-full"
              >
                Go to Home
              </Button>
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
        <SheetContent side="left" className="w-64 p-0 glass-effect">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      <main className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
          <div className="flex items-center gap-4 p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {language === 'ar' ? 'لوحة التحكم الإدارية' : 'Admin Control Panel'}
              </h1>
            </div>
          </div>
        </div>

        <div className="p-6">
          {activeSection === 'dashboard' && <AdminDashboard />}
          
          {activeSection === 'users' && (
            <AdminUsers
              users={users}
              loading={loading}
              isUserDialogOpen={isUserDialogOpen}
              setIsUserDialogOpen={setIsUserDialogOpen}
              editingUser={editingUser}
              userForm={userForm}
              setUserForm={setUserForm}
              isSubscriptionDialogOpen={isSubscriptionDialogOpen}
              setIsSubscriptionDialogOpen={setIsSubscriptionDialogOpen}
              editingSubscription={editingSubscription}
              subscriptionForm={subscriptionForm}
              setSubscriptionForm={setSubscriptionForm}
              savingSubscription={savingSubscription}
              copiedUserId={copiedUserId}
              onEditUser={handleEditUser}
              onDeleteUser={handleDeleteUser}
              onSaveUser={handleSaveUser}
              onEditSubscription={handleEditSubscription}
              onSubscriptionPlanChange={handleSubscriptionPlanChange}
              onSaveSubscription={handleSaveSubscription}
              onCopyUserId={handleCopyUserId}
            />
          )}

          {activeSection === 'merchants' && (
            <AdminMerchants
              merchants={merchants}
              loading={loading}
              isMerchantDialogOpen={isMerchantDialogOpen}
              setIsMerchantDialogOpen={setIsMerchantDialogOpen}
              editingMerchant={editingMerchant}
              merchantForm={merchantForm}
              setMerchantForm={setMerchantForm}
              onEditMerchant={handleEditMerchant}
              onDeleteMerchant={handleDeleteMerchant}
              onApproveMerchant={handleApproveMerchant}
              onRejectMerchant={handleRejectMerchant}
              onSaveMerchant={handleSaveMerchant}
            />
          )}

          {activeSection === 'products' && (
            <AdminProducts
              products={products}
              loading={loading}
              filterMerchantId={filterMerchantId}
              setFilterMerchantId={setFilterMerchantId}
              selectedProducts={selectedProducts}
              isProductDialogOpen={isProductDialogOpen}
              setIsProductDialogOpen={setIsProductDialogOpen}
              editingProduct={editingProduct}
              productForm={productForm}
              setProductForm={setProductForm}
              onAddProduct={handleAddProduct}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
              onSaveProduct={handleSaveProduct}
              onBulkDelete={handleBulkDelete}
              onToggleProductSelection={toggleProductSelection}
              onToggleAllProducts={toggleAllProducts}
            />
          )}
        </div>
      </main>
    </div>
  );
};
