export interface NavigationItem {
  id: string;
  label: string;
  labelAr: string;
  icon: React.ElementType;
  onClick?: () => void;
}

export interface NavigationSection {
  title: string;
  titleAr: string;
  items: NavigationItem[];
}

export interface UserForm {
  name: string;
  email: string;
  role: string;
}

export interface SubscriptionForm {
  subscription_plan: string;
  searches_count: number;
  searches_limit: number;
  payment_status: string;
  subscription_expires_at: Date | null;
}

export interface MerchantForm {
  brandName: string;
  description: string;
  email: string;
  phone: string;
  website: string;
  logo: string;
  managerId: string;
}

export interface ProductForm {
  name: string;
  description: string;
  price: string;
  category: string;
  merchantId: string;
  imageUrl: string;
  stock: string;
  isActive: boolean;
}

export interface DesignSettings {
  primaryColor: string;
  accentColor: string;
  secondaryColor: string;
}
