import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Package, Edit, Trash2, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { ProductForm } from './types';

interface AdminProductsProps {
  products: any[];
  loading: boolean;
  filterMerchantId: string;
  setFilterMerchantId: (id: string) => void;
  selectedProducts: string[];
  isProductDialogOpen: boolean;
  setIsProductDialogOpen: (open: boolean) => void;
  editingProduct: any;
  productForm: ProductForm;
  setProductForm: (form: ProductForm) => void;
  onAddProduct: () => void;
  onEditProduct: (product: any) => void;
  onDeleteProduct: (productId: string) => void;
  onSaveProduct: () => void;
  onBulkDelete: () => void;
  onToggleProductSelection: (productId: string) => void;
  onToggleAllProducts: () => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({
  products,
  loading,
  filterMerchantId,
  setFilterMerchantId,
  selectedProducts,
  isProductDialogOpen,
  setIsProductDialogOpen,
  editingProduct,
  productForm,
  setProductForm,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onSaveProduct,
  onBulkDelete,
  onToggleProductSelection,
  onToggleAllProducts,
}) => {
  const { language } = useLanguage();

  const filteredProducts = filterMerchantId
    ? products.filter(p => p.merchantId === filterMerchantId)
    : products;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="glass-effect border-border">
          <div className="p-6 border-b border-border">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="w-6 h-6 text-primary" />
                  <div>
                    <h2 className="text-xl font-bold">
                      {language === 'ar' ? 'إدارة المنتجات' : 'Product Management'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' ? 'إضافة وتعديل وحذف المنتجات' : 'Add, edit, and delete products'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {selectedProducts.length > 0 && (
                    <Button
                      variant="outline"
                      className="border-destructive text-destructive gap-2"
                      onClick={onBulkDelete}
                    >
                      <Trash2 className="w-4 h-4" />
                      {language === 'ar' ? `حذف (${selectedProducts.length})` : `Delete (${selectedProducts.length})`}
                    </Button>
                  )}
                  <Button
                    onClick={onAddProduct}
                    className="bg-gradient-to-r from-primary to-accent text-primary-foreground gap-2"
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
                        onChange={() => onToggleProductSelection(product.id)}
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
                          onClick={() => onEditProduct(product)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-destructive text-destructive"
                          onClick={() => onDeleteProduct(product.id)}
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
              onClick={onSaveProduct}
            >
              {editingProduct 
                ? (language === 'ar' ? 'تحديث المنتج' : 'Update Product')
                : (language === 'ar' ? 'إضافة منتج' : 'Add Product')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
