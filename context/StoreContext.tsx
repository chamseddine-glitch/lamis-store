
import React, { createContext, useReducer, useEffect, ReactNode, Dispatch } from 'react';
import type { AppState, Action } from '../types';
import { ViewMode } from '../types';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS } from '../constants';

const initialState: AppState = {
  viewMode: ViewMode.CUSTOMER,
  products: INITIAL_PRODUCTS,
  orders: [],
  cart: [],
  settings: INITIAL_SETTINGS,
  categories: [...new Set(INITIAL_PRODUCTS.map(p => p.category))],
  isLoggedIn: false,
};

const storeReducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    case 'SET_STATE':
      return action.payload;
    case 'UPDATE_SETTINGS':
      return { ...state, settings: action.payload };
    case 'ADD_PRODUCT': {
      const newCategory = action.payload.category;
      const categories = state.categories.includes(newCategory)
        ? state.categories
        : [...state.categories, newCategory];
      return { ...state, products: [...state.products, action.payload], categories };
    }
    case 'UPDATE_PRODUCT': {
        const updatedProduct = action.payload;
        const newCategory = updatedProduct.category;
        const categories = state.categories.includes(newCategory)
            ? state.categories
            : [...state.categories, newCategory];
        
        const updatedCart = state.cart.map(item => {
            if (item.product.id === updatedProduct.id) {
                return { ...item, product: updatedProduct };
            }
            return item;
        });

        return {
            ...state,
            products: state.products.map(p => p.id === updatedProduct.id ? updatedProduct : p),
            cart: updatedCart,
            categories,
        };
    }
    case 'DELETE_PRODUCT': {
      const productIdToDelete = action.payload;
      const productToDelete = state.products.find(p => p.id === productIdToDelete);
      
      if (!productToDelete) {
        return state;
      }

      const updatedProducts = state.products.filter(p => p.id !== productIdToDelete);

      const wasLastProductInCategory = !updatedProducts.some(p => p.category === productToDelete.category);

      let updatedCategories = state.categories;
      if (wasLastProductInCategory) {
        updatedCategories = state.categories.filter(c => c !== productToDelete.category);
      }
      
      return {
        ...state,
        products: updatedProducts,
        cart: state.cart.filter(item => item.product.id !== productIdToDelete),
        categories: updatedCategories,
      };
    }
    case 'ADD_ORDER':
      return { ...state, orders: [action.payload, ...state.orders] };
    case 'DELETE_ORDER':
        return {
            ...state,
            orders: state.orders.filter(o => o.id !== action.payload),
        };
    case 'REORDER_ORDERS':
        return { ...state, orders: action.payload };
    case 'UPDATE_ORDER_STATUS':
      return {
        ...state,
        orders: state.orders.map(o => o.id === action.payload.orderId ? { ...o, status: action.payload.status } : o),
      };
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
    case 'ADD_CATEGORY':
        if (state.categories.includes(action.payload) || action.payload.trim() === '') {
            return state;
        }
        return { ...state, categories: [...state.categories, action.payload.trim()] };
    case 'UPDATE_CATEGORY': {
        if (state.categories.includes(action.payload.newCategory) || action.payload.newCategory.trim() === '') {
            return state;
        }
        const updatedProducts = state.products.map(p => p.category === action.payload.oldCategory ? { ...p, category: action.payload.newCategory.trim() } : p);
        const updatedCart = state.cart.map(item => {
            if (item.product.category === action.payload.oldCategory) {
                return { ...item, product: { ...item.product, category: action.payload.newCategory.trim() } };
            }
            return item;
        });

        return {
            ...state,
            categories: state.categories.map(c => c === action.payload.oldCategory ? action.payload.newCategory.trim() : c),
            products: updatedProducts,
            cart: updatedCart,
        };
    }
    case 'DELETE_CATEGORY': {
        const categoryToDelete = action.payload;
        const UNCATEGORIZED = 'غير مصنف';

        const affectedProducts = state.products.filter(p => p.category === categoryToDelete);

        if (affectedProducts.length === 0) {
            return {
                ...state,
                categories: state.categories.filter(c => c !== categoryToDelete),
            };
        }
        
        const affectedProductIds = new Set(affectedProducts.map(p => p.id));

        const updatedProducts = state.products.map(p => {
            if (p.category === categoryToDelete) {
                return { ...p, category: UNCATEGORIZED };
            }
            return p;
        });

        const updatedCart = state.cart.map(item => {
            if (affectedProductIds.has(item.product.id)) {
                return { ...item, product: { ...item.product, category: UNCATEGORIZED } };
            }
            return item;
        });

        let updatedCategories = state.categories.filter(c => c !== categoryToDelete);
        if (!updatedCategories.includes(UNCATEGORIZED)) {
            updatedCategories.push(UNCATEGORIZED);
        }
        
        return {
            ...state,
            categories: updatedCategories,
            products: updatedProducts,
            cart: updatedCart,
        };
    }
    case 'LOGIN':
        return { ...state, isLoggedIn: true };
    case 'LOGOUT':
        return { ...state, isLoggedIn: false, viewMode: ViewMode.CUSTOMER };
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
    try {
      const storedState = localStorage.getItem('ecomStoreState');
      if (storedState) {
        // Keep user logged out on refresh for security
        const parsedState = JSON.parse(storedState);
        parsedState.isLoggedIn = false; 
        dispatch({ type: 'SET_STATE', payload: parsedState });
      }
    } catch (error) {
      console.error("Could not parse stored state:", error);
      localStorage.removeItem('ecomStoreState');
    }
  }, []);

  useEffect(() => {
    try {
        localStorage.setItem('ecomStoreState', JSON.stringify(state));
    } catch (error) {
        console.error("Could not save state:", error);
    }
  }, [state]);

  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
};
