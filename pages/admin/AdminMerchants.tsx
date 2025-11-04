import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Store, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { MerchantForm } from './types';

interface AdminMerchantsProps {
  merchants: any[];
  loading: boolean;
  isMerchantDialogOpen: boolean;
  setIsMerchantDialogOpen: (open: boolean) => void;
  editingMerchant: any;
  merchantForm: MerchantForm;
  setMerchantForm: (form: MerchantForm) => void;
  onEditMerchant: (merchant: any) => void;
  onDeleteMerchant: (merchantId: string) => void;
  onApproveMerchant: (merchantId: string) => void;
  onRejectMerchant: (merchantId: string) => void;
  onSaveMerchant: () => void;
}

export const AdminMerchants: React.FC<AdminMerchantsProps> = ({
  merchants,
  loading,
  isMerchantDialogOpen,
  setIsMerchantDialogOpen,
  editingMerchant,
  merchantForm,
  setMerchantForm,
  onEditMerchant,
  onDeleteMerchant,
  onApproveMerchant,
  onRejectMerchant,
  onSaveMerchant,
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
                <Store className="w-6 h-6 text-primary" />
                <div>
                  <h2 className="text-xl font-bold">
                    {language === 'ar' ? 'إدارة التجار' : 'Merchant Management'}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'مراجعة والموافقة على طلبات التجار' : 'Review and approve merchant applications'}
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
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4 flex-1">
                        {merchant.logo && (
                          <img
                            src={merchant.logo}
                            alt={merchant.brandName}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{merchant.brandName || 'Unnamed Merchant'}</h3>
                            <Badge 
                              variant={
                                merchant.status === 'approved' 
                                  ? 'default' 
                                  : merchant.status === 'pending' 
                                    ? 'secondary' 
                                    : 'outline'
                              }
                            >
                              {merchant.status || 'pending'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            {merchant.description || 'No description'}
                          </p>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            {merchant.email && <span><strong>Email:</strong> {merchant.email}</span>}
                            {merchant.phone && <span><strong>Phone:</strong> {merchant.phone}</span>}
                            {merchant.website && (
                              <a 
                                href={merchant.website} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                Website
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {merchant.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-green-600 text-green-600"
                              onClick={() => onApproveMerchant(merchant.id)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-orange-600 text-orange-600"
                              onClick={() => onRejectMerchant(merchant.id)}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEditMerchant(merchant)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-destructive text-destructive"
                          onClick={() => onDeleteMerchant(merchant.id)}
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
              onClick={onSaveMerchant}
            >
              {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
