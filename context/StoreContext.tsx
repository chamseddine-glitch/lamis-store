

import React, { createContext, useReducer, useEffect, ReactNode, Dispatch, useCallback } from 'react';
import type { AppState, Action, Product, Order, Category, StoreSettings } from '../types';
import { ViewMode, OrderStatus } from '../types';
import { INITIAL_SETTINGS, INITIAL_PRODUCTS } from '../constants';
import { db, firebaseInitialized } from '../firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { initializeDatabase, api } from '../api';

const initialState: AppState = {
  loading: true,
  viewMode: ViewMode.CUSTOMER,
  products: [],
  orders: [],
  cart: JSON.parse(localStorage.getItem('ecomCart') || '[]'),
  settings: INITIAL_SETTINGS,
  categories: [],
  isLoggedIn: false,
};

const storeReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'SET_ORDERS':
        const sortedOrders = action.payload.sort((a, b) => {
            if (a.orderIndex !== undefined && b.orderIndex !== undefined) {
                return a.orderIndex - b.orderIndex;
            }
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
      return { ...state, orders: sortedOrders };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload, loading: state.loading && !firebaseInitialized ? false : state.loading };
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
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
    case 'LOGIN':
        return { ...state, isLoggedIn: true };
    case 'LOGOUT':
        return { ...state, isLoggedIn: false, viewMode: ViewMode.CUSTOMER };
    case 'ADD_ORDER':
        api.addOrder(action.payload);
        return state;
    case 'UPDATE_ORDER_STATUS':
        api.updateOrderStatus(action.payload.orderId, action.payload.status);
        return state;
    case 'DELETE_ORDER':
        api.deleteOrder(action.payload);
        return state;
    case 'REORDER_ORDERS':
        api.reorderOrders(action.payload);
        return state;
    case 'ADD_PRODUCT':
        api.addProduct(action.payload);
        return state;
    case 'UPDATE_PRODUCT':
        api.updateProduct(action.payload);
        return state;
    case 'DELETE_PRODUCT':
        api.deleteProduct(action.payload);
        return state;
    case 'ADD_CATEGORY':
        api.addCategory(action.payload);
        return state;
    case 'UPDATE_CATEGORY':
        api.updateCategory(action.payload.id, action.payload.newName, action.payload.oldName);
        return state;
    case 'DELETE_CATEGORY':
        api.deleteCategory(action.payload);
        return state;
    case 'UPDATE_SETTINGS':
        api.updateSettings(action.payload);
        return state;
    default:
      return state;
  }
};

export const StoreContext = createContext<{ state: AppState; dispatch: Dispatch<Action> }>({
  state: initialState,
  dispatch: () => null,
});

export const StoreProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(storeReducer, initialState);

  useEffect(() => {
    // Initialize DB and fetch initial settings
    const init = async () => {
        try {
            const settings = await initializeDatabase();
            dispatch({ type: 'SET_SETTINGS', payload: settings });
        } catch (error) {
            console.error("Error initializing database:", error);
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };
    init();

    if (firebaseInitialized && db) {
        // Set up real-time listeners for Firebase
        console.log("Firebase is initialized. Setting up real-time listeners...");
        const productsUnsub = onSnapshot(collection(db, 'products'), (snapshot) => {
            const products = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Product));
            dispatch({ type: 'SET_PRODUCTS', payload: products });
        });
        
        const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const ordersUnsub = onSnapshot(ordersQuery, (snapshot) => {
            const orders = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Order));
            dispatch({ type: 'SET_ORDERS', payload: orders });
        });

        const categoriesUnsub = onSnapshot(collection(db, 'categories'), (snapshot) => {
            const categories = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Category));
            dispatch({ type: 'SET_CATEGORIES', payload: categories });
        });

        const settingsUnsub = onSnapshot(collection(db, 'settings'), (snapshot) => {
             snapshot.forEach(doc => {
                if (doc.id === 'main') {
                    dispatch({ type: 'SET_SETTINGS', payload: doc.data() as StoreSettings });
                }
            });
             // Once settings are loaded from Firebase, stop loading screen
             if(!snapshot.empty) dispatch({ type: 'SET_LOADING', payload: false });
        });

        // Cleanup listeners on unmount
        return () => {
            productsUnsub();
            ordersUnsub();
            categoriesUnsub();
            settingsUnsub();
        };
    } else {
        // Fallback to local data if Firebase is not initialized
        console.log("Running in local demo mode. Loading initial data.");
        dispatch({ type: 'SET_PRODUCTS', payload: INITIAL_PRODUCTS });
        const initialCategories = [...new Set(INITIAL_PRODUCTS.map(p => p.category))].map((name, i) => ({ id: `local-cat-${i}`, name }));
        dispatch({ type: 'SET_CATEGORIES', payload: initialCategories });
        dispatch({ type: 'SET_SETTINGS', payload: INITIAL_SETTINGS });
        dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  // Persist cart to localStorage
  useEffect(() => {
    localStorage.setItem('ecomCart', JSON.stringify(state.cart));
  }, [state.cart]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
};
