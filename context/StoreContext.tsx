import React, { createContext, useReducer, useEffect, Dispatch } from 'react';
import type { AppState, Action, Product, Order, StoreSettings } from '../types';
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
  categories: [],
  isLoggedIn: false,
  dbStatus: 'loading',
};

const storeReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    case 'SET_STATE':
        return { ...state, ...action.payload };
    case 'SET_DB_STATUS':
        return { ...state, dbStatus: action.payload };
    case 'SET_PRODUCTS': {
        const products = action.payload;
        const categories = ['الكل', ...new Set(products.map(p => p.category))];
        return { ...state, products, categories };
    }
    case 'SET_ORDERS':
        return { ...state, orders: action.payload };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: action.payload };
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
    // Restore cart from localStorage
    try {
        const savedCart = localStorage.getItem('ecomCart');
        if (savedCart) {
            dispatch({ type: 'SET_STATE', payload: { cart: JSON.parse(savedCart) } });
        }
    } catch (e) { console.error("Failed to load cart from localStorage", e)}

    // Check session storage for login state
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
        dispatch({ type: 'LOGIN' });
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
                const orders = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Order));
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

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
};
