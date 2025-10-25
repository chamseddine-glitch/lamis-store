import React, { createContext, useReducer, useEffect, Dispatch } from 'react';
import type { AppState, Action, Product, Order, StoreSettings, CartItem } from '../types';
import { ViewMode } from '../types';
import { INITIAL_SETTINGS } from '../constants';
import { db } from '../firebase';
import { collection, onSnapshot, query, doc, orderBy } from 'firebase/firestore';

const initialState: AppState = {
  viewMode: ViewMode.CUSTOMER,
  products: [],
  orders: [],
  cart: [],
  settings: INITIAL_SETTINGS, // Fallback settings
  categories: ['الكل', ...(INITIAL_SETTINGS.managedCategories || [])],
  isLoggedIn: false,
  dbStatus: 'loading',
  settingsLoaded: false,
  themeMode: 'light', // Default to light mode
  toasts: [],
};

const storeReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    case 'SET_STATE':
        return { ...state, ...action.payload };
    case 'SET_DB_STATUS':
        return { ...state, dbStatus: action.payload };
    case 'SETTINGS_LOADED':
        return { ...state, settingsLoaded: true };
    case 'TOGGLE_THEME_MODE': {
        const newMode = state.themeMode === 'dark' ? 'light' : 'dark';
        return { ...state, themeMode: newMode };
    }
    case 'SET_PRODUCTS': {
        const products = action.payload;
        // Validate cart against the new product list to ensure data consistency
        // and remove items for products that no longer exist.
        const validatedCart = state.cart.map(cartItem => {
            const product = products.find(p => p.id === cartItem.product.id);
            if (product) {
                // Product exists, update its data in the cart to reflect latest price, etc.
                return { ...cartItem, product };
            }
            return null; // Product not found (e.g., deleted)
        }).filter((item): item is CartItem => item !== null);

        return { ...state, products, cart: validatedCart };
    }
    case 'SET_ORDERS':
        return { ...state, orders: action.payload };
    case 'UPDATE_SETTINGS': {
      const firestoreSettings = action.payload;
      // Deep merge settings from Firestore with initial settings to prevent crashes
      // from missing properties, ensuring the app is more robust.
      const settings: StoreSettings = {
        ...INITIAL_SETTINGS,
        ...firestoreSettings,
        contactInfo: {
          ...INITIAL_SETTINGS.contactInfo,
          ...(firestoreSettings.contactInfo || {}),
        },
        theme: {
          light: {
            ...INITIAL_SETTINGS.theme.light,
            ...(firestoreSettings.theme?.light || {}),
          },
          dark: {
            ...INITIAL_SETTINGS.theme.dark,
            ...(firestoreSettings.theme?.dark || {}),
          },
        },
        deliveryFees: firestoreSettings.deliveryFees || INITIAL_SETTINGS.deliveryFees,
        deliveryCompanies: firestoreSettings.deliveryCompanies || INITIAL_SETTINGS.deliveryCompanies,
        managedCategories: firestoreSettings.managedCategories || INITIAL_SETTINGS.managedCategories,
        productCardStyle: firestoreSettings.productCardStyle || INITIAL_SETTINGS.productCardStyle,
        productGridLayout: firestoreSettings.productGridLayout || INITIAL_SETTINGS.productGridLayout,
        storeNameStyle: {
          ...INITIAL_SETTINGS.storeNameStyle,
          ...(firestoreSettings.storeNameStyle || {}),
        },
      };
      
      const categories = ['الكل', ...(settings.managedCategories || [])];
      return { ...state, settings, categories };
    }
    case 'ADD_TO_CART': {
        const existingItemIndex = state.cart.findIndex(item => item.id === action.payload.id);
        if (existingItemIndex > -1) {
            const updatedCart = [...state.cart];
            const newQuantity = updatedCart[existingItemIndex].quantity + action.payload.quantity;
            updatedCart[existingItemIndex] = { ...updatedCart[existingItemIndex], quantity: newQuantity };
            return { ...state, cart: updatedCart };
        }
        return { ...state, cart: [...state.cart, action.payload] };
    }
    case 'REMOVE_FROM_CART':
        return { ...state, cart: state.cart.filter(item => item.id !== action.payload) };
    case 'CLEAR_CART':
        return { ...state, cart: [] };
    case 'LOGIN': {
        sessionStorage.setItem('isLoggedIn', 'true');
        return { ...state, isLoggedIn: true };
    }
    case 'LOGOUT': {
        sessionStorage.removeItem('isLoggedIn');
        return { ...state, isLoggedIn: false, viewMode: ViewMode.CUSTOMER };
    }
    case 'SHOW_TOAST':
      return { ...state, toasts: [...state.toasts, action.payload] };
    case 'HIDE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };
    default:
      return state;
  }
};

export const StoreContext = createContext<{ state: AppState; dispatch: Dispatch<Action> }>({
  state: initialState,
  dispatch: () => null,
});

export const StoreProvider = ({ children }: React.PropsWithChildren) => {
  const [state, dispatch] = useReducer(storeReducer, initialState);

  useEffect(() => {
    // Restore cart & theme from localStorage
    try {
        const savedCart = localStorage.getItem('ecomCart');
        if (savedCart) {
            dispatch({ type: 'SET_STATE', payload: { cart: JSON.parse(savedCart) } });
        }
        const savedTheme = localStorage.getItem('ecomTheme');
        if (savedTheme === 'light' || savedTheme === 'dark') {
            dispatch({ type: 'SET_STATE', payload: { themeMode: savedTheme } });
        }
    } catch (e) { console.error("Failed to load data from localStorage", e)}

    // Check session storage for login state
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
        dispatch({ type: 'LOGIN' });
    }

    // Check for admin URL parameter to provide a hidden entry point
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('admin') === 'true') {
        dispatch({ type: 'SET_VIEW_MODE', payload: ViewMode.ADMIN });
    }

    // Firebase listeners
    const unsubscribers: (() => void)[] = [];
    try {
        // Settings listener
        const settingsUnsub = onSnapshot(doc(db, "store", "settings"), 
            (doc) => {
                if (doc.exists()) {
                    dispatch({ type: 'UPDATE_SETTINGS', payload: doc.data() as StoreSettings });
                } else {
                    console.warn("Settings document does not exist! Using initial settings.");
                }
                dispatch({ type: 'SETTINGS_LOADED' });
            },
            (error) => {
                console.error("Firebase settings listener error:", error);
                dispatch({ type: 'SET_DB_STATUS', payload: 'error' });
            }
        );
        unsubscribers.push(settingsUnsub);

        // Products listener
        const productsUnsub = onSnapshot(collection(db, "products"), 
            (snapshot) => {
                const products = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));
                dispatch({ type: 'SET_PRODUCTS', payload: products });
                if (state.dbStatus !== 'error') {
                   dispatch({ type: 'SET_DB_STATUS', payload: 'connected' });
                }
            },
            (error) => {
                console.error("Firebase products listener error:", error);
                dispatch({ type: 'SET_DB_STATUS', payload: 'error' });
            }
        );
        unsubscribers.push(productsUnsub);
        
        // Orders listener
        const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const ordersUnsub = onSnapshot(ordersQuery, 
            (snapshot) => {
                const orders = snapshot.docs.map(doc => {
                    const data = doc.data();
                    // Convert Firestore Timestamp to ISO string to match our Order type
                    const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString();
                    return { ...data, id: doc.id, createdAt } as Order;
                });
                dispatch({ type: 'SET_ORDERS', payload: orders });
            },
            (error) => {
                console.error("Firebase orders listener error:", error);
                // Don't set to error if products already loaded, it might be a permissions issue on orders only
                if (state.dbStatus === 'loading') {
                  dispatch({ type: 'SET_DB_STATUS', payload: 'error' });
                }
            }
        );
        unsubscribers.push(ordersUnsub);

    } catch(error) {
        console.error("Error setting up Firebase listeners:", error);
        dispatch({ type: 'SET_DB_STATUS', payload: 'error' });
    }
    
    // Cleanup listeners on unmount
    return () => unsubscribers.forEach(unsub => unsub());

  }, []);

  useEffect(() => {
    // Save cart to localStorage whenever it changes
    try {
        localStorage.setItem('ecomCart', JSON.stringify(state.cart));
    } catch (e) {
        console.error("Failed to save cart to localStorage", e);
    }
  }, [state.cart]);

  useEffect(() => {
    // Save theme to localStorage whenever it changes
    try {
        localStorage.setItem('ecomTheme', state.themeMode);
    } catch (e) {
        console.error("Failed to save theme to localStorage", e);
    }
  }, [state.themeMode]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
};