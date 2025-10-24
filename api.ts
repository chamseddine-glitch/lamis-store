
import { db, firebaseInitialized } from './firebase';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  CollectionReference,
  DocumentReference,
} from 'firebase/firestore';
import type { Product, Order, StoreSettings, OrderStatus, Category } from './types';
import { INITIAL_PRODUCTS, INITIAL_SETTINGS } from './constants';

// Function to initialize the database with default data if it's empty
export const initializeDatabase = async (): Promise<StoreSettings> => {
    if (!firebaseInitialized || !db) {
        console.log("Running in local mode. Skipping Firebase initialization check.");
        return INITIAL_SETTINGS;
    }
    const settingsDocRef = doc(db, 'settings', 'main');
    const settingsSnapshot = await getDoc(settingsDocRef);
    if (!settingsSnapshot.exists()) {
        console.log('No settings found, initializing database with default data...');
        await setDoc(settingsDocRef, INITIAL_SETTINGS);

        const productsCollection = collection(db, 'products');
        const categoriesCollection = collection(db, 'categories');
        const batch = writeBatch(db);
        INITIAL_PRODUCTS.forEach(product => {
            const productRef = doc(productsCollection, product.id);
            batch.set(productRef, product);
        });

        const initialCategories = [...new Set(INITIAL_PRODUCTS.map(p => p.category))];
        initialCategories.forEach(categoryName => {
             const categoryRef = doc(categoriesCollection); // Auto-generate ID
             batch.set(categoryRef, { name: categoryName });
        });

        await batch.commit();
        console.log('Database initialized successfully.');
        return INITIAL_SETTINGS;
    }
    return settingsSnapshot.data() as StoreSettings;
};

// API functions
const createApiMethod = <T extends (...args: any[]) => any>(method: T): ((...args: Parameters<T>) => Promise<ReturnType<T> | void>) => {
    return async (...args: Parameters<T>): Promise<ReturnType<T> | void> => {
        if (!firebaseInitialized || !db) {
            console.warn(`Firebase not initialized. Skipped API call: ${method.name}`);
            return;
        }
        try {
            return await method(...args);
        } catch (error) {
            console.error(`API call failed for ${method.name}:`, error);
            // Optionally, re-throw or handle the error
        }
    };
};

const _api = {
    addProduct: async (product: Product): Promise<Product> => {
        const productRef = doc(collection(db!, 'products'), product.id);
        await setDoc(productRef, product);
        return product;
    },
    updateProduct: async (product: Product): Promise<Product> => {
        const productRef = doc(collection(db!, 'products'), product.id);
        await updateDoc(productRef, { ...product });
        return product;
    },
    deleteProduct: async (productId: string): Promise<void> => {
        const productRef = doc(collection(db!, 'products'), productId);
        await deleteDoc(productRef);
    },
    addOrder: async (order: Order): Promise<Order> => {
        const docRef = await addDoc(collection(db!, 'orders'), order);
        return { ...order, id: docRef.id };
    },
    updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<void> => {
        const orderRef = doc(collection(db!, 'orders'), orderId);
        await updateDoc(orderRef, { status });
    },
    deleteOrder: async (orderId: string): Promise<void> => {
        const orderRef = doc(collection(db!, 'orders'), orderId);
        await deleteDoc(orderRef);
    },
    reorderOrders: async (orders: Order[]): Promise<void> => {
        const batch = writeBatch(db!);
        orders.forEach((order, index) => {
            const orderRef = doc(collection(db!, 'orders'), order.id);
            batch.update(orderRef, { orderIndex: index });
        });
        await batch.commit();
    },
    addCategory: async (categoryName: string): Promise<Category> => {
        const docRef = await addDoc(collection(db!, 'categories'), { name: categoryName });
        return { id: docRef.id, name: categoryName };
    },
    updateCategory: async (categoryId: string, newName: string, oldName: string): Promise<void> => {
        const batch = writeBatch(db!);
        const categoryRef = doc(db!, "categories", categoryId);
        batch.update(categoryRef, { name: newName });
        // In a real app, you might trigger a cloud function to update all products.
        // For now, we'll keep it simple as product categories can be edited from the product form itself.
        await batch.commit();
    },
    deleteCategory: async (categoryId: string): Promise<void> => {
        const categoryRef = doc(collection(db!, 'categories'), categoryId);
        await deleteDoc(categoryRef);
    },
    updateSettings: async (settings: StoreSettings): Promise<StoreSettings> => {
        const settingsDocRef = doc(db!, 'settings', 'main');
        await setDoc(settingsDocRef, settings, { merge: true });
        return settings;
    }
};

// Create a safe API object that won't throw errors if Firebase is not initialized
export const api = {
    addProduct: createApiMethod(_api.addProduct),
    updateProduct: createApiMethod(_api.updateProduct),
    deleteProduct: createApiMethod(_api.deleteProduct),
    addOrder: createApiMethod(_api.addOrder),
    updateOrderStatus: createApiMethod(_api.updateOrderStatus),
    deleteOrder: createApiMethod(_api.deleteOrder),
    reorderOrders: createApiMethod(_api.reorderOrders),
    addCategory: createApiMethod(_api.addCategory),
    updateCategory: createApiMethod(_api.updateCategory),
    deleteCategory: createApiMethod(_api.deleteCategory),
    updateSettings: createApiMethod(_api.updateSettings),
};
