import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/popover';
import { Calendar } from '../../components/ui/calendar';
import { Users, Edit, Trash2, Copy, Check, UserPlus, Save, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import { UserForm, SubscriptionForm } from './types';

interface AdminUsersProps {
  users: any[];
  loading: boolean;
  isUserDialogOpen: boolean;
  setIsUserDialogOpen: (open: boolean) => void;
  editingUser: any;
  userForm: UserForm;
  setUserForm: (form: UserForm) => void;
  isSubscriptionDialogOpen: boolean;
  setIsSubscriptionDialogOpen: (open: boolean) => void;
  editingSubscription: any;
  subscriptionForm: SubscriptionForm;
  setSubscriptionForm: (form: SubscriptionForm) => void;
  savingSubscription: boolean;
  copiedUserId: string | null;
  onEditUser: (user: any) => void;
  onDeleteUser: (userId: string) => void;
  onSaveUser: () => void;
  onEditSubscription: (user: any) => void;
  onSubscriptionPlanChange: (plan: string) => void;
  onSaveSubscription: () => void;
  onCopyUserId: (userId: string) => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({
  users,
  loading,
  isUserDialogOpen,
  setIsUserDialogOpen,
  editingUser,
  userForm,
  setUserForm,
  isSubscriptionDialogOpen,
  setIsSubscriptionDialogOpen,
  editingSubscription,
  subscriptionForm,
  setSubscriptionForm,
  savingSubscription,
  copiedUserId,
  onEditUser,
  onDeleteUser,
  onSaveUser,
  onEditSubscription,
  onSubscriptionPlanChange,
  onSaveSubscription,
  onCopyUserId,
}) => {
  const { language } = useLanguage();

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass-effect border-border">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-primary" />
                <div>
                  <h2 className="text-xl font-bold">
                    {language === 'ar' ? 'إدارة المستخدمين' : 'User Management'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'عرض وتعديل حسابات المستخدمين' : 'View and manage user accounts'}
                  </p>
                </div>
              </div>
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
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{user.name || 'Unnamed User'}</h3>
                          <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                            {user.role}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{user.email}</p>
                        <div className="flex flex-wrap gap-2 text-sm mt-2">
                          <Badge variant="secondary">
                            {language === 'ar' ? 'الباقة:' : 'Plan:'} {user.subscription_plan || 'Free'}
                          </Badge>
                          <Badge variant="secondary">
                            {language === 'ar' ? 'البحث:' : 'Searches:'} {user.searches_count || 0}/{user.searches_limit || 5}
                          </Badge>
                          {user.payment_status && user.payment_status !== 'none' && (
                            <Badge variant={user.payment_status === 'active' ? 'default' : 'outline'}>
                              {user.payment_status}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEditSubscription(user)}
                          title={language === 'ar' ? 'إدارة الباقة' : 'Manage Subscription'}
                        >
                          <UserPlus className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEditUser(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-destructive text-destructive"
                          onClick={() => onDeleteUser(user.id)}
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
      </motion.div>

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
                  onClick={() => onCopyUserId(editingUser.id)}
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
              onClick={onSaveUser}
            >
              <Save className="w-4 h-4" />
              {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isSubscriptionDialogOpen} onOpenChange={setIsSubscriptionDialogOpen}>
        <DialogContent className="max-w-xl glass-effect">
          <DialogHeader>
            <DialogTitle>
              {language === 'ar' ? 'إدارة الباقة والاشتراك' : 'Manage Subscription Plan'}
            </DialogTitle>
            <DialogDescription>
              {language === 'ar' 
                ? 'تحديث باقة المستخدم وحدود البحث' 
                : 'Update user subscription plan and search limits'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {editingSubscription && (
              <div className="p-3 rounded-lg bg-muted/50 mb-4">
                <p className="text-sm font-medium mb-1">{editingSubscription.name}</p>
                <p className="text-xs text-muted-foreground">{editingSubscription.email}</p>
              </div>
            )}
            
            <div>
              <Label>
                {language === 'ar' ? 'الباقة' : 'Subscription Plan'}
              </Label>
              <Select
                value={subscriptionForm.subscription_plan}
                onValueChange={onSubscriptionPlanChange}
              >
                <SelectTrigger className="mt-2 bg-input-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Free">
                    Free {language === 'ar' ? '(5 عمليات بحث)' : '(5 searches)'}
                  </SelectItem>
                  <SelectItem value="Basic">
                    Basic {language === 'ar' ? '(100 عملية بحث)' : '(100 searches)'}
                  </SelectItem>
                  <SelectItem value="Pro">
                    Pro {language === 'ar' ? '(بحث غير محدود)' : '(Unlimited searches)'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>
                  {language === 'ar' ? 'عدد البحث المستخدم' : 'Searches Used'}
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={subscriptionForm.searches_count}
                  onChange={(e) => setSubscriptionForm({ 
                    ...subscriptionForm, 
                    searches_count: parseInt(e.target.value) || 0 
                  })}
                  className="bg-input-background mt-2"
                />
              </div>

              <div>
                <Label>
                  {language === 'ar' ? 'حد البحث' : 'Search Limit'}
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={subscriptionForm.searches_limit}
                  onChange={(e) => setSubscriptionForm({ 
                    ...subscriptionForm, 
                    searches_limit: parseInt(e.target.value) || 0 
                  })}
                  className="bg-input-background mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {language === 'ar' ? 'يتحدد تلقائياً حسب الباقة' : 'Auto-set based on plan'}
                </p>
              </div>
            </div>

            <div>
              <Label>
                {language === 'ar' ? 'حالة الدفع' : 'Payment Status'}
              </Label>
              <Select
                value={subscriptionForm.payment_status}
                onValueChange={(value) => setSubscriptionForm({ 
                  ...subscriptionForm, 
                  payment_status: value 
                })}
              >
                <SelectTrigger className="mt-2 bg-input-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    {language === 'ar' ? 'لا يوجد' : 'None'}
                  </SelectItem>
                  <SelectItem value="active">
                    {language === 'ar' ? 'نشط' : 'Active'}
                  </SelectItem>
                  <SelectItem value="expired">
                    {language === 'ar' ? 'منتهي' : 'Expired'}
                  </SelectItem>
                  <SelectItem value="cancelled">
                    {language === 'ar' ? 'ملغي' : 'Cancelled'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>
                {language === 'ar' ? 'تاريخ انتهاء الاشتراك' : 'Subscription Expires At'}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal mt-2 bg-input-background"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {subscriptionForm.subscription_expires_at ? (
                      format(subscriptionForm.subscription_expires_at, 'PPP')
                    ) : (
                      <span>{language === 'ar' ? 'اختر تاريخ' : 'Pick a date'}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 glass-effect" align="start">
                  <Calendar
                    mode="single"
                    selected={subscriptionForm.subscription_expires_at || undefined}
                    onSelect={(date) => setSubscriptionForm({ 
                      ...subscriptionForm, 
                      subscription_expires_at: date || null 
                    })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground mt-1">
                {language === 'ar' ? 'اختياري - اتركه فارغاً للباقات المجانية' : 'Optional - leave empty for free plans'}
              </p>
            </div>

            <Button 
              className="w-full bg-gradient-to-r from-primary to-accent text-primary-foreground gap-2"
              onClick={onSaveSubscription}
              disabled={savingSubscription}
            >
              {savingSubscription ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {language === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
