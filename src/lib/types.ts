
export interface ProductVariant {
  name: string;
  price: number;
  countInStock: number;
}

export interface Product {
  id: string;
  reference?: string;
  name: string;
  price: number;
  purchasePrice?: number;
  originalPrice?: number;
  description: string;
  images: string[];
  category: string;
  tags?: string[];
  countInStock: number;
  variants?: ProductVariant[];
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface CartItem extends Product {
  quantity: number;
  selectedVariant?: string;
}

export interface SiteSettings {
  brandName: string;
  logoUrl: string;
  primaryColor: string; // HSL value like "210 50% 37%"
  checkoutColor: string; // HSL value for checkout-specific accents
  checkoutBgColor: string; // HSL for card background
  priceBadgeColor: string; // HSL for the floating badge
  checkoutTitleAr: string;
  checkoutButtonTextAr: string;
  checkoutSuccessMsgAr: string;
  nameLabelAr: string;
  phoneLabelAr: string;
  stateLabelAr: string;
  communeLabelAr: string;
  footerDescription?: string;
  deliveryApiKey?: string;
  deliveryCompanyName?: string;
  deliveryLogoUrl?: string;
  deliveryAccountNameAr?: string;
  deliveryXTenant?: string;
  deliveryCanOpenPackages?: boolean;
  deliveryIsFree?: boolean;
  // Layout fields
  productColsDesktop?: number;
  categoryColsDesktop?: number;
  // Contact fields
  contactPhone?: string;
  contactEmail?: string;
  contactAddress?: string;
  workingHoursWeek?: string;
  workingHoursThu?: string;
  workingHoursFri?: string;
  // Social Media
  whatsappUrl?: string;
  telegramUrl?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
}

export interface DeliveryConnection {
  id: string;
  companyName: string;
  accountName: string;
  apiKey: string;
  xTenant?: string;
  canOpenPackages: boolean;
  isFreeDelivery: boolean;
  isActive: boolean;
  logoUrl?: string;
  lastTested: string;
}

export interface DeliveryTariff {
  stateName: string;
  homePrice: number;
  deskPrice: number;
  companyName: string;
  estimatedDays?: string;
  lastUpdated: string;
}

export type OrderStatus = 'pending' | 'ready' | 'at_office' | 'dispatch' | 'shipped' | 'delivering' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  selectedVariant?: string;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  state: string;
  commune: string;
  // Legacy fields for backward compatibility
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  selectedVariant?: string;
  // New multi-item support
  items: OrderItem[];
  totalAmount: number;
  deliveryType: 'home' | 'desk';
  deliveryCost: number;
  status: OrderStatus;
  trackingNumber?: string;
  deliveryPartner?: string;
  createdAt: string;
}
