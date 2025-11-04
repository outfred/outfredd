import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { 
  Users, Store, Package, Settings, Layout, BarChart3, 
  Trash2, CheckCircle, XCircle, Shield, Plus, Edit, UserPlus, Save, Palette, Copy, Check
} from 'lucide-react';
import { motion } from 'motion/react';
import { adminApi, merchantsApi, productsApi } from '../utils/api';
import { toast } from 'sonner';
import { copyToClipboard } from '../utils/clipboard';

export const Admin: React.FC = () => {
  const { t } = useLanguage();
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics');
  const [analytics, setAnalytics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [merchants, setMerchants] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Product filtering and bulk operations
  const [filterMerchantId, setFilterMerchantId] = useState<string>('');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  
  // Design Settings State
  const [designSettings, setDesignSettings] = useState({
    primaryColor: '#3B1728',
    accentColor: '#8B4665',
    secondaryColor: '#F5EDF0',
  });

  // Product Dialog State
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    merchantId: '',
    imageUrl: '',
  });

  // Merchant Edit Dialog State
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

  // User Edit Dialog State
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    role: '',
  });

  // Copied User ID State
  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);

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
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedUserId(null);
      }, 2000);
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
    });
    setIsProductDialogOpen(true);
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      category: product.category || '',
      merchantId: product.merchantId || '',
      imageUrl: product.imageUrl || '',
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

  const handleImportProducts = async () => {
    try {
      const merchantId = prompt('Enter merchant ID to import products:');
      const url = prompt('Enter merchant website URL:');
      
      if (merchantId && url) {
        await productsApi.import(merchantId, url);
        toast.success('Products import started');
        loadProducts();
      }
    } catch (error) {
      console.error('Error importing products:', error);
      toast.error('Failed to import products');
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

  const handleSaveDesignSettings = async () => {
    try {
      await adminApi.updateSettings({ colors: designSettings });
      toast.success('Design settings saved successfully!');
      
      // Update CSS variables
      document.documentElement.style.setProperty('--brand-primary', designSettings.primaryColor);
      document.documentElement.style.setProperty('--brand-accent', designSettings.accentColor);
      document.documentElement.style.setProperty('--secondary', designSettings.secondaryColor);
    } catch (error) {
      console.error('Error saving design settings:', error);
      toast.error('Failed to save design settings');
    }
  };

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
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t('adminPanel')}
            </h1>
          </div>
          <p className="text-muted-foreground">
            Manage your platform with complete control
          </p>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="glass-effect border-border p-2">
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="w-4 h-4" />
              {t('analytics')}
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2" onClick={loadUsers}>
              <Users className="w-4 h-4" />
              {t('users')}
            </TabsTrigger>
            <TabsTrigger value="merchants" className="gap-2" onClick={loadMerchants}>
              <Store className="w-4 h-4" />
              {t('merchants')}
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2" onClick={loadProducts}>
              <Package className="w-4 h-4" />
              {t('products')}
            </TabsTrigger>
            <TabsTrigger value="design" className="gap-2">
              <Palette className="w-4 h-4" />
              {t('designSettings')}
            </TabsTrigger>
            <TabsTrigger value="pages" className="gap-2">
              <Layout className="w-4 h-4" />
              {t('pageBuilder')}
            </TabsTrigger>
          </TabsList>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            {/* Quick Link to Statistics Page */}
            <Card className="p-4 glass-effect border-border mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="mb-1">Advanced Statistics</h3>
                    <p className="text-sm text-muted-foreground">
                      View detailed search and product view analytics
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => window.location.hash = 'statistics'}
                  variant="outline"
                >
                  View Statistics
                </Button>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 glass-effect border-border">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-primary" />
                  <Badge className="bg-primary/10 text-primary border-primary">
                    Total
                  </Badge>
                </div>
                <p className="mb-2">{analytics?.totalUsers || 0}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </Card>

              <Card className="p-6 glass-effect border-border">
                <div className="flex items-center justify-between mb-4">
                  <Store className="w-8 h-8 text-accent" />
                  <Badge className="bg-accent/10 text-accent border-accent">
                    Active
                  </Badge>
                </div>
                <p className="mb-2">{analytics?.approvedMerchants || 0}</p>
                <p className="text-sm text-muted-foreground">Approved Merchants</p>
              </Card>

              <Card className="p-6 glass-effect border-border">
                <div className="flex items-center justify-between mb-4">
                  <Package className="w-8 h-8 text-primary-light" />
                  <Badge className="bg-primary-light/10 text-primary-light border-primary-light">
                    Live
                  </Badge>
                </div>
                <p className="mb-2">{analytics?.totalProducts || 0}</p>
                <p className="text-sm text-muted-foreground">Total Products</p>
              </Card>

              <Card className="p-6 glass-effect border-border">
                <div className="flex items-center justify-between mb-4">
                  <Store className="w-8 h-8 text-accent-light" />
                  <Badge className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 border-orange-300">
                    Pending
                  </Badge>
                </div>
                <p className="mb-2">{analytics?.pendingMerchants || 0}</p>
                <p className="text-sm text-muted-foreground">Pending Approvals</p>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="glass-effect border-border">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2>User Management</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Copy User ID to assign as Manager ID for merchants
                    </p>
                  </div>
                  <Button className="gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground">
                    <UserPlus className="w-4 h-4" />
                    Add User
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
                    <p className="text-muted-foreground">No users found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="p-4 rounded-lg bg-secondary/50 border border-border"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3>{user.name}</h3>
                              <Badge className="capitalize">{user.role}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-1">
                              <span className="font-medium">Email:</span> {user.email}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <p className="text-sm text-muted-foreground">
                                <span className="font-medium">User ID:</span>{' '}
                                <code 
                                  className="bg-muted px-2 py-1 rounded text-xs select-all cursor-text"
                                  title="Click to select, then copy manually"
                                >
                                  {user.id}
                                </code>
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopyUserId(user.id)}
                                className="h-6 px-2"
                                title="Copy User ID"
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
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteUser(user.id)}
                            className="gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Merchants Tab */}
          <TabsContent value="merchants">
            <Card className="glass-effect border-border">
              <div className="p-6 border-b border-border">
                <h2>Merchant Management</h2>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                ) : merchants.length === 0 ? (
                  <div className="text-center py-12">
                    <Store className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No merchants found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {merchants.map((merchant) => (
                      <div
                        key={merchant.id}
                        className="p-4 rounded-lg bg-secondary/50"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="mb-1">{merchant.brandName}</h3>
                            <p className="text-sm text-muted-foreground">{merchant.email}</p>
                            {merchant.managerId && (
                              <p className="text-sm text-muted-foreground mt-1">
                                Manager ID: {merchant.managerId}
                              </p>
                            )}
                          </div>
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
                        <p className="text-sm text-muted-foreground mb-4">
                          {merchant.description}
                        </p>
                        <div className="flex gap-2">
                          {merchant.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApproveMerchant(merchant.id)}
                                className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="w-4 h-4" />
                                {t('approve')}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectMerchant(merchant.id)}
                                className="gap-2 border-destructive text-destructive"
                              >
                                <XCircle className="w-4 h-4" />
                                {t('reject')}
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditMerchant(merchant)}
                            className="gap-2"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteMerchant(merchant.id)}
                            className="gap-2 border-destructive text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                            {t('delete')}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <Card className="glass-effect border-border">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2>Product Management</h2>
                  <div className="flex gap-2">
                    <Button 
                      className="gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground"
                      onClick={handleImportProducts}
                    >
                      <Package className="w-4 h-4" />
                      Import Products
                    </Button>
                    <Button 
                      className="gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground"
                      onClick={handleAddProduct}
                    >
                      <Plus className="w-4 h-4" />
                      Add Product
                    </Button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="mb-2">No Products Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Add products manually or import them from merchant websites
                    </p>
                    <Button 
                      className="bg-gradient-to-r from-primary to-accent text-primary-foreground"
                      onClick={handleAddProduct}
                    >
                      Add Your First Product
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map((product) => (
                      <Card key={product.id} className="p-4 border-border">
                        {product.imageUrl && (
                          <img 
                            src={product.imageUrl} 
                            alt={product.name}
                            className="w-full h-48 object-cover rounded-lg mb-4"
                          />
                        )}
                        <h3 className="mb-2">{product.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{product.description}</p>
                        <p className="mb-4">Price: ${product.price}</p>
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
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          {/* Design Settings Tab */}
          <TabsContent value="design">
            <Card className="glass-effect border-border">
              <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <Palette className="w-6 h-6 text-primary" />
                  <h2>{t('designSettings')}</h2>
                </div>
              </div>
              <div className="p-6">
                <div className="max-w-2xl space-y-6">
                  <div>
                    <Label htmlFor="primaryColor">Primary Color (Brand Color)</Label>
                    <div className="flex gap-4 items-center mt-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={designSettings.primaryColor}
                        onChange={(e) => setDesignSettings({ ...designSettings, primaryColor: e.target.value })}
                        className="w-20 h-12 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={designSettings.primaryColor}
                        onChange={(e) => setDesignSettings({ ...designSettings, primaryColor: e.target.value })}
                        className="flex-1 bg-input-background"
                        placeholder="#3B1728"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="accentColor">Accent Color</Label>
                    <div className="flex gap-4 items-center mt-2">
                      <Input
                        id="accentColor"
                        type="color"
                        value={designSettings.accentColor}
                        onChange={(e) => setDesignSettings({ ...designSettings, accentColor: e.target.value })}
                        className="w-20 h-12 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={designSettings.accentColor}
                        onChange={(e) => setDesignSettings({ ...designSettings, accentColor: e.target.value })}
                        className="flex-1 bg-input-background"
                        placeholder="#8B4665"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="secondaryColor">Secondary Color (Background)</Label>
                    <div className="flex gap-4 items-center mt-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={designSettings.secondaryColor}
                        onChange={(e) => setDesignSettings({ ...designSettings, secondaryColor: e.target.value })}
                        className="w-20 h-12 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={designSettings.secondaryColor}
                        onChange={(e) => setDesignSettings({ ...designSettings, secondaryColor: e.target.value })}
                        className="flex-1 bg-input-background"
                        placeholder="#F5EDF0"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <Button 
                      className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground gap-2"
                      onClick={handleSaveDesignSettings}
                    >
                      <Save className="w-4 h-4" />
                      Save Design Settings
                    </Button>
                  </div>

                  <div className="mt-8 p-4 rounded-lg bg-secondary/50 border border-border">
                    <h3 className="mb-4">Color Preview</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div 
                          className="w-full h-20 rounded-lg mb-2"
                          style={{ backgroundColor: designSettings.primaryColor }}
                        />
                        <p className="text-sm text-center">Primary</p>
                      </div>
                      <div>
                        <div 
                          className="w-full h-20 rounded-lg mb-2"
                          style={{ backgroundColor: designSettings.accentColor }}
                        />
                        <p className="text-sm text-center">Accent</p>
                      </div>
                      <div>
                        <div 
                          className="w-full h-20 rounded-lg mb-2"
                          style={{ backgroundColor: designSettings.secondaryColor }}
                        />
                        <p className="text-sm text-center">Secondary</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Page Builder Tab */}
          <TabsContent value="pages">
            <Card className="p-12 text-center glass-effect border-border">
              <Layout className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="mb-2">{t('pageBuilder')}</h3>
              <p className="text-muted-foreground">
                Create and edit custom pages with drag-and-drop interface
              </p>
              <Button className="mt-4 bg-gradient-to-r from-primary to-accent text-primary-foreground">
                Coming Soon
              </Button>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit User Dialog */}
        <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
          <DialogContent className="max-w-xl glass-effect">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information and role permissions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              {editingUser && (
                <div className="p-3 rounded-lg bg-muted/50 mb-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    <span className="font-medium">User ID:</span>
                  </p>
                  <code 
                    className="block bg-background px-3 py-2 rounded text-xs break-all select-all cursor-text mb-3"
                    title="Click to select, then copy manually"
                  >
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
                  placeholder="User name"
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="bg-input-background mt-2"
                  placeholder="user@example.com"
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

              <div className="pt-4">
                <Button 
                  className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground gap-2"
                  onClick={handleSaveUser}
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Merchant Dialog */}
        <Dialog open={isMerchantDialogOpen} onOpenChange={setIsMerchantDialogOpen}>
          <DialogContent className="max-w-2xl glass-effect">
            <DialogHeader>
              <DialogTitle>Edit Merchant</DialogTitle>
              <DialogDescription>
                Update merchant profile and store information
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
                <Label>Manager User ID (Optional)</Label>
                <Input
                  value={merchantForm.managerId}
                  onChange={(e) => setMerchantForm({ ...merchantForm, managerId: e.target.value })}
                  className="bg-input-background"
                  placeholder="User ID of the merchant manager"
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
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add/Edit Product Dialog */}
        <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
          <DialogContent className="max-w-2xl glass-effect">
            <DialogHeader>
              <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
              <DialogDescription>
                {editingProduct 
                  ? 'Update product details and availability' 
                  : 'Add a new product to the catalog'}
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
                <Label>Description</Label>
                <Textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="bg-input-background"
                  rows={4}
                  placeholder="Describe the product..."
                />
              </div>
              <Button 
                className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground"
                onClick={handleSaveProduct}
              >
                {editingProduct ? 'Update Product' : 'Add Product'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
