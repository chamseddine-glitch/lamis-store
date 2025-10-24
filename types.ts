

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
}

export interface CartItem {
  id:string; // Composite ID like: productId-size-color
  product: Product;
  quantity: number;
  selectedOptions: Record<string, string>;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryType: 'office' | 'home';
  address: {
    wilaya: string;
    baladiya: string;
    streetAddress?: string;
  };
  items: CartItem[];
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
  orderIndex?: number; // For drag-and-drop reordering
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
  deliveryFeeOffice: number;
  deliveryFeeHome: number;
  contactInfo: ContactInfo;
  theme: ThemeColors;
  storeDescription: string;
  adminUsername: string;
  adminPassword: string;
}

export interface Category {
    id: string;
    name: string;
}

export interface AppState {
  loading: boolean;
  viewMode: ViewMode;
  products: Product[];
  categories: Category[];
  orders: Order[];
  cart: CartItem[];
  settings: StoreSettings;
  isLoggedIn: boolean;
}

export type Action =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_STATE_FROM_FIREBASE'; payload: { products: Product[], orders: Order[], categories: Category[], settings: StoreSettings } }
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'SET_ORDERS'; payload: Order[] }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'SET_SETTINGS'; payload: StoreSettings }
  | { type: 'SET_VIEW_MODE'; payload: ViewMode }
  | { type: 'ADD_TO_CART'; payload: CartItem }
  | { type: 'REMOVE_FROM_CART'; payload: string } // payload is cart item ID
  | { type: 'CLEAR_CART' }
  | { type: 'LOGIN' }
  | { type: 'LOGOUT' }
  // FIX: Added missing action types for full application functionality.
  | { type: 'ADD_ORDER'; payload: Order }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { orderId: string; status: OrderStatus } }
  | { type: 'DELETE_ORDER'; payload: string }
  | { type: 'REORDER_ORDERS'; payload: Order[] }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: string }
  | { type: 'UPDATE_CATEGORY'; payload: { id: string; newName: string; oldName: string } }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: StoreSettings };