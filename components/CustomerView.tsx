

import React, { useState, useContext, useMemo, useEffect } from 'react';
import { StoreContext } from '../context/StoreContext';
import type { Product, CartItem, Order } from '../types';
import { OrderStatus } from '../types';
import { ALGERIA_DATA } from '../constants';
import { ShoppingCartIcon, XMarkIcon, ArchiveBoxIcon, CheckCircleIcon } from './icons';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// ProductCard Component
const ProductCard: React.FC<{ product: Product; onClick: () => void; }> = ({ product, onClick }) => {
    return (
        <div onClick={onClick} className="cursor-pointer group relative bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ease-in-out hover:scale-105 text-right w-full flex flex-col">
            <div className="relative aspect-w-1 aspect-h-1 w-full overflow-hidden xl:aspect-w-7 xl:aspect-h-8">
                <img src={product.images[0]} alt={product.name} className="h-64 w-full object-cover object-center" />
            </div>
            <div className="p-4 flex flex-col flex-grow">
                 <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-bold text-text-base flex-1 leading-tight">{product.name}</h3>
                    <p className="text-lg font-bold text-primary whitespace-nowrap mr-2">{product.price.toLocaleString('ar-DZ')} د.ج</p>
                </div>
                <p className="text-sm text-text-muted h-10 overflow-hidden flex-grow">{product.description}</p>
            </div>
        </div>
    );
};

const OrderSuccessMessage: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="text-center p-8 flex flex-col items-center justify-center animate-fade-in-up">
        <CheckCircleIcon className="w-20 h-20 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-green-600 mt-4">تم إرسال طلبك بنجاح!</h2>
        <p className="text-gray-600 mt-2 max-w-md">
            شكرًا لطلبك. سيتم الاتصال بك قريبًا على رقم الهاتف الذي قدمته لتأكيد الطلبية.
        </p>
        <button onClick={onClose} className="mt-8 bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-all active:scale-95">
            حسنًا
        </button>
    </div>
);


// OrderModal Component
const OrderModal: React.FC<{ product: Product | null; onClose: () => void; }> = ({ product, onClose }) => {
    const { state, dispatch } = useContext(StoreContext);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [deliveryType, setDeliveryType] = useState<'home' | 'office'>('office');
    const [selectedWilaya, setSelectedWilaya] = useState('');
    const [selectedBaladiya, setSelectedBaladiya] = useState('');
    const [streetAddress, setStreetAddress] = useState('');
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
    const [isClosing, setIsClosing] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);
    const [isOrderSuccessful, setIsOrderSuccessful] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        setSelectedImage(0);
        if (product?.options) {
            const initialOptions: Record<string, string> = {};
            product.options.forEach(opt => {
                if (opt.values.length > 0) {
                    initialOptions[opt.name] = opt.values[0];
                }
            });
            setSelectedOptions(initialOptions);
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [product]);
    
    if (!product) return null;

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            // No need to reset here, will be reset on next open
        }, 300);
    };

    const handleOptionChange = (optionName: string, value: string) => {
        setSelectedOptions(prev => ({ ...prev, [optionName]: value }));
    };

    const generateCartItemId = (productId: string, options: Record<string, string>): string => {
        if (Object.keys(options).length === 0) return productId;
        const optionString = Object.keys(options).sort().map(key => `${key}:${options[key]}`).join('-');
        return `${productId}-${optionString}`;
    };

    const deliveryFee = deliveryType === 'home' ? state.settings.deliveryFeeHome : state.settings.deliveryFeeOffice;
    const totalPrice = product.price + deliveryFee;

    const handleConfirmOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const cartItemId = generateCartItemId(product.id, selectedOptions);

        const address: Order['address'] = {
            wilaya: selectedWilaya,
            baladiya: selectedBaladiya,
        };
        if (deliveryType === 'home') {
            address.streetAddress = streetAddress;
        }

        const newOrderData = {
            customerName,
            customerPhone,
            customerEmail,
            deliveryType,
            address,
            items: [{ id: cartItemId, product, quantity: 1, selectedOptions }],
            totalPrice,
            status: OrderStatus.PENDING,
            createdAt: serverTimestamp()
        };
        try {
            await addDoc(collection(db, "orders"), newOrderData);
            setIsOrderSuccessful(true);
        } catch (error) {
            console.error("Error creating order:", error);
            alert("حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleAddToCart = () => {
        const cartItemId = generateCartItemId(product.id, selectedOptions);
        const cartItem: CartItem = {
            id: cartItemId,
            product,
            quantity: 1,
            selectedOptions
        };
        dispatch({ type: 'ADD_TO_CART', payload: cartItem });
        alert(`تمت إضافة "${product.name}" إلى السلة!`);
        handleClose();
    };

    const baladiyats = ALGERIA_DATA.find(w => w.wilaya_name_ar === selectedWilaya)?.baladiyats || [];

    return (
        <div className={`fixed inset-0 bg-black z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${isClosing ? 'bg-opacity-0' : 'bg-opacity-50'}`}>
            <div className={`bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-full overflow-y-auto p-6 relative transition-all duration-300 ${isClosing ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
                {isOrderSuccessful ? (
                    <OrderSuccessMessage onClose={handleClose} />
                ) : (
                    <>
                        <button onClick={handleClose} className="absolute top-4 left-4 text-gray-500 hover:text-gray-800">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                        <h2 className="text-2xl font-bold mb-4 text-primary">تأكيد طلب: {product.name}</h2>
                        <div className="flex flex-col md:flex-row gap-6">
                            <div className="md:w-1/3">
                                <div className="relative mb-2">
                                    <img src={product.images[selectedImage]} alt={product.name} className="rounded-lg w-full h-auto object-cover aspect-square shadow-md" />
                                    {product.images.length > 1 && (
                                        <>
                                            <button 
                                                onClick={() => setSelectedImage(prev => (prev - 1 + product.images.length) % product.images.length)}
                                                className="absolute left-0 top-1/2 -translate-y-1/2 bg-black bg-opacity-30 text-white p-2 rounded-full ml-2 z-10 hover:bg-opacity-50 transition-opacity"
                                                aria-label="الصورة السابقة"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                                            </button>
                                             <button 
                                                onClick={() => setSelectedImage(prev => (prev + 1) % product.images.length)}
                                                className="absolute right-0 top-1/2 -translate-y-1/2 bg-black bg-opacity-30 text-white p-2 rounded-full mr-2 z-10 hover:bg-opacity-50 transition-opacity"
                                                aria-label="الصورة التالية"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                                            </button>
                                        </>
                                    )}
                                </div>
                                {product.images.length > 1 && (
                                    <div className="flex gap-2 mt-2 justify-center flex-wrap">
                                        {product.images.slice(0, 3).map((img, index) => (
                                            <button key={index} onClick={() => setSelectedImage(index)} className={`w-14 h-14 rounded-md overflow-hidden border-2 transition-all duration-200 ${selectedImage === index ? 'border-primary scale-110' : 'border-transparent hover:border-gray-300'}`}>
                                                <img src={img} alt={`thumbnail ${index+1}`} className="w-full h-full object-cover"/>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                 <p className="text-lg font-bold text-center mt-2">{product.price.toLocaleString('ar-DZ')} د.ج</p>
                            </div>
                            <form onSubmit={handleConfirmOrder} className="md:w-2/3 space-y-4">
                                <input type="text" placeholder="الاسم الكامل" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full p-2 border rounded focus:ring-primary focus:border-primary transition" required />
                                <input type="tel" placeholder="رقم الهاتف" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full p-2 border rounded focus:ring-primary focus:border-primary transition" required />
                                <input type="email" placeholder="البريد الإلكتروني (اختياري)" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className="w-full p-2 border rounded focus:ring-primary focus:border-primary transition" />
                                
                                {product.options.length > 0 && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                                        {product.options.map(option => (
                                            <div key={option.id}>
                                                <label htmlFor={option.id} className="block text-sm font-medium text-gray-700 mb-1">{option.name}</label>
                                                <select 
                                                    id={option.id}
                                                    value={selectedOptions[option.name] || ''} 
                                                    onChange={(e) => handleOptionChange(option.name, e.target.value)}
                                                    className="w-full p-2 border rounded focus:ring-primary focus:border-primary transition"
                                                >
                                                    {option.values.map(value => <option key={value} value={value}>{value}</option>)}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div>
                                    <p className="font-semibold mb-2">خيار التوصيل:</p>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2">
                                            <input type="radio" name="delivery" value="office" checked={deliveryType === 'office'} onChange={() => setDeliveryType('office')} className="text-primary focus:ring-primary"/>
                                            <span>للمكتب ({state.settings.deliveryFeeOffice.toLocaleString('ar-DZ')} د.ج)</span>
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input type="radio" name="delivery" value="home" checked={deliveryType === 'home'} onChange={() => setDeliveryType('home')} className="text-primary focus:ring-primary"/>
                                            <span>للمنزل ({state.settings.deliveryFeeHome.toLocaleString('ar-DZ')} د.ج)</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <select value={selectedWilaya} onChange={e => {setSelectedWilaya(e.target.value); setSelectedBaladiya('')}} className="w-full p-2 border rounded focus:ring-primary focus:border-primary transition" required>
                                        <option value="">اختر الولاية</option>
                                        {ALGERIA_DATA.map(w => <option key={w.wilaya_name_ar} value={w.wilaya_name_ar}>{w.wilaya_name_ar}</option>)}
                                    </select>
                                    <select value={selectedBaladiya} onChange={e => setSelectedBaladiya(e.target.value)} className="w-full p-2 border rounded focus:ring-primary focus:border-primary transition" required disabled={!selectedWilaya}>
                                        <option value="">اختر البلدية</option>
                                        {baladiyats.map(b => <option key={b.baladiya_name_ar} value={b.baladiya_name_ar}>{b.baladiya_name_ar}</option>)}
                                    </select>
                                </div>

                                {deliveryType === 'home' && (
                                    <div className="animate-fade-in-up">
                                         <textarea 
                                            placeholder="العنوان (اسم الشارع، رقم المنزل، إلخ...)" 
                                            value={streetAddress}
                                            onChange={e => setStreetAddress(e.target.value)}
                                            className="w-full p-2 border rounded focus:ring-primary focus:border-primary transition"
                                            rows={2}
                                            required={deliveryType === 'home'}
                                        />
                                    </div>
                                )}
                                
                                <div className="pt-4 border-t">
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>الإجمالي:</span>
                                        <span>{totalPrice.toLocaleString('ar-DZ')} د.ج</span>
                                    </div>
                                </div>
                                
                                <div className="flex gap-4 mt-6">
                                     <button type="submit" className="flex-1 bg-secondary text-white px-6 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-all active:scale-95" disabled={isSubmitting}>
                                        {isSubmitting ? 'جاري التأكيد...' : 'تأكيد الطلب'}
                                    </button>
                                    <button type="button" onClick={handleAddToCart} className="flex-1 bg-gray-200 text-text-base px-6 py-3 rounded-lg font-bold hover:bg-gray-300 transition-all active:scale-95" disabled={isSubmitting}>
                                        <ShoppingCartIcon className="w-5 h-5 inline-block ml-2"/>
                                        إضافة إلى السلة
                                    </button>
                                </div>
                            </form>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export const CustomerView = () => {
    const { state } = useContext(StoreContext);
    const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
    const [orderingProduct, setOrderingProduct] = useState<Product | null>(null);

    const categories = state.categories;
    
    const filteredProducts = useMemo(() => {
        if (selectedCategory === 'الكل') return state.products;
        return state.products.filter(p => p.category === selectedCategory);
    }, [state.products, selectedCategory]);

    return (
        <div className="bg-base-100 min-h-screen">
            <main className="container mx-auto px-4 py-8">
                <div className="mb-8 animate-fade-in-up">
                    <h2 className="text-2xl font-bold text-center mb-4 text-text-base">تصفح منتجاتنا</h2>
                    <div className="flex justify-center flex-wrap gap-2">
                        {categories.map(category => (
                            <button 
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${selectedCategory === category ? 'bg-primary text-white shadow-md' : 'bg-white text-text-muted hover:bg-gray-100'}`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                <div key={selectedCategory} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in-up">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map(product => (
                            <ProductCard key={product.id} product={product} onClick={() => setOrderingProduct(product)} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-16">
                            <ArchiveBoxIcon className="w-16 h-16 mx-auto text-gray-400" />
                            <h3 className="mt-4 text-xl font-semibold text-text-base">لا توجد منتجات</h3>
                            <p className="text-text-muted">لم يتم العثور على منتجات في هذا التصنيف حالياً.</p>
                        </div>
                    )}
                </div>
            </main>
            {orderingProduct && <OrderModal product={orderingProduct} onClose={() => setOrderingProduct(null)} />}
        </div>
    );
};