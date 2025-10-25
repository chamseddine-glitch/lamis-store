
export enum ViewMode {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
}

export enum OrderStatus {
  PENDING = 'قيد المراجعة',
  SHIPPED = 'تم الشحن',
  DELIVERED = 'تم التوصيل',
  CANCELLED = 'ملغى',
}

export interface ProductOption {
  id: string;
  name: string; // e.g., 'Size', 'Color'
  values: string[]; // e.g., ['S', 'M', 'L'] or ['Red', 'Blue']
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  options: ProductOption[];
  rating?: {
    average: number;
    count: number;
  };
  isOnSale?: boolean;
  salePrice?: number;
}

export interface CartItem {
  id:string; // Composite ID like: productId-size-color
  product: Product;
  quantity: number;
  selectedOptions: Record<string, string>;
}

export interface DeliveryFee {
  wilaya: string;
  office: number;
  home: number;
}

export interface DeliveryCompany {
  name: string;
  logo: string;
  hasRealLogo: boolean;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryType: 'office' | 'home';
  deliveryCompany?: string;
  address: {
    wilaya: string;
    baladiya: string;
    streetAddress?: string;
  };
  items: CartItem[];
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  facebook: string;
  instagram: string;
  whatsapp: string;
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  textMuted: string;
}

export interface StoreSettings {
  storeName: string;
  logo: string;
  deliveryFees: DeliveryFee[];
  deliveryCompanies: string[];
  contactInfo: ContactInfo;
  theme: ThemeColors;
  storeDescription: string;
  adminUsername: string;
  adminPassword: string;
  managedCategories?: string[];
}

export interface AppState {
  viewMode: ViewMode;
  products: Product[];
  categories: string[];
  orders: Order[];
  cart: CartItem[];
  settings: StoreSettings;
  isLoggedIn: boolean;
  dbStatus: 'loading' | 'connected' | 'error';
  themeMode: 'light' | 'dark';
}

export type Action =
  | { type: 'SET_VIEW_MODE'; payload: ViewMode }
  | { type: 'SET_STATE'; payload: Partial<AppState> }
  | { type: 'SET_DB_STATUS'; payload: 'loading' | 'connected' | 'error' }
  | { type: 'TOGGLE_THEME_MODE' }
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'SET_ORDERS'; payload: Order[] }
  | { type: 'UPDATE_SETTINGS'; payload: StoreSettings }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'DELETE_ORDER', payload: string }
  | { type: 'REORDER_ORDERS', payload: Order[] }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { orderId: string; status: OrderStatus } }
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: string } // payload is cart item ID
  | { type: 'CLEAR_CART' }
  | { type: 'ADD_CATEGORY'; payload: string }
  | { type: 'UPDATE_CATEGORY'; payload: { oldCategory: string; newCategory: string } }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'LOGIN' }
  | { type: 'LOGOUT' };