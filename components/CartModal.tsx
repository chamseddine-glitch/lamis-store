

import React, { useState, useContext, useMemo, useEffect } from 'react';
import { StoreContext } from '../context/StoreContext';
import type { Order } from '../types';
import { OrderStatus } from '../types';
import { ALGERIA_DATA } from '../constants';
import { XMarkIcon, TrashIcon, ShoppingCartIcon, CheckCircleIcon } from './icons';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';


const OrderSuccessMessage: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <div className="text-center p-8 flex flex-col items-center justify-center animate-fade-in-up">
        <CheckCircleIcon className="w-20 h-20 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-green-600 mt-4">تم إرسال طلبك بنجاح!</h2>
        <p className="text-gray-600 mt-2 max-w-md">
            شكرًا لطلبك. سيتم الاتصال بك قريبًا على رقم الهاتف الذي قدمته لتأكيد الطلبية.
        </p>
        <button onClick={onClose} className="mt-8 bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-all active:scale-95">
            العودة للمتجر
        </button>
    </div>
);

export const CartModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const { state, dispatch } = useContext(StoreContext);
    const { cart, settings } = state;
    const [isClosing, setIsClosing] = useState(false);
    const [view, setView] = useState<'cart' | 'checkout' | 'success'>('cart');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [deliveryType, setDeliveryType] = useState<'home' | 'office'>('office');
    const [selectedWilaya, setSelectedWilaya] = useState('');
    const [selectedBaladiya, setSelectedBaladiya] = useState('');
    const [streetAddress, setStreetAddress] = useState('');

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            if (cart.length === 0 && view === 'checkout') {
                setView('cart');
            }
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen, cart.length, view]);

    const subtotal = useMemo(() => cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0), [cart]);
    const deliveryFee = deliveryType === 'home' ? settings.deliveryFeeHome : settings.deliveryFeeOffice;
    const totalPrice = subtotal + deliveryFee;

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
            // Reset state on close after animation
            setTimeout(() => {
                setView('cart');
                setCustomerName('');
                setCustomerPhone('');
                // etc.
            }, 300);
        }, 300);
    };

    const handleRemoveItem = (cartItemId: string) => {
        dispatch({ type: 'REMOVE_FROM_CART', payload: cartItemId });
    };

    const handleCheckoutSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cart.length === 0) return;
        setIsSubmitting(true);

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
            items: cart,
            totalPrice,
            status: OrderStatus.PENDING,
            createdAt: serverTimestamp(),
        };

        try {
            await addDoc(collection(db, "orders"), newOrderData);
            dispatch({ type: 'CLEAR_CART' });
            setView('success');
        } catch (error) {
            console.error("Error creating order: ", error);
            alert("حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const baladiyats = ALGERIA_DATA.find(w => w.wilaya_name_ar === selectedWilaya)?.baladiyats || [];

    if (!isOpen) return null;

    const renderCartView = () => (
        <>
            {cart.length === 0 ? (
                <div className="text-center py-10">
                    <ShoppingCartIcon className="w-16 h-16 mx-auto text-gray-400" />
                    <p className="mt-4 text-text-muted">سلة التسوق فارغة.</p>
                </div>
            ) : (
                <>
                    <div className="space-y-4">
                        {cart.map(item => (
                            <div key={item.id} className="flex items-start gap-4 border-b pb-2 animate-fade-in-up">
                                <img src={item.product.images[0]} alt={item.product.name} className="w-20 h-20 rounded-md object-cover" />
                                <div className="flex-grow">
                                    <h3 className="font-semibold leading-tight">{item.product.name}</h3>
                                    <div className="text-sm text-text-muted">
                                        {Object.entries(item.selectedOptions).map(([key, value]) => (
                                            <span key={key} className="block">{key}: {value}</span>
                                        ))}
                                    </div>
                                    <p className="text-sm">{item.quantity} x {item.product.price.toLocaleString('ar-DZ')} د.ج</p>
                                </div>
                                <div className="text-left flex flex-col items-end">
                                    <p className="font-bold whitespace-nowrap">{(item.product.price * item.quantity).toLocaleString('ar-DZ')} د.ج</p>
                                    <button onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700 text-xs mt-1 flex items-center gap-1 p-1 hover:bg-red-50 rounded-md transition-colors">
                                        <TrashIcon className="w-4 h-4"/>
                                        <span>حذف</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="border-t pt-4 mt-4">
                        <div className="flex justify-between font-bold text-lg">
                            <span>المجموع الجزئي:</span>
                            <span>{subtotal.toLocaleString('ar-DZ')} د.ج</span>
                        </div>
                        <p className="text-sm text-text-muted mt-1">سيتم إضافة رسوم التوصيل عند الدفع.</p>
                        <div className="flex gap-4 mt-6">
                            <button onClick={handleClose} type="button" className="flex-1 bg-gray-200 text-text-base px-6 py-3 rounded-lg font-bold hover:bg-gray-300 transition-all active:scale-95">
                                متابعة التسوق
                            </button>
                            <button onClick={() => setView('checkout')} type="button" className="flex-1 bg-secondary text-white px-6 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-all active:scale-95">
                                إتمام الطلب
                            </button>
                        </div>
                    </div>
                </>
            )}
        </>
    );

    const renderCheckoutView = () => (
        <form onSubmit={handleCheckoutSubmit} className="space-y-4">
            <input type="text" placeholder="الاسم الكامل" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full p-2 border rounded focus:ring-primary focus:border-primary transition" required />
            <input type="tel" placeholder="رقم الهاتف" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full p-2 border rounded focus:ring-primary focus:border-primary transition" required />
            <input type="email" placeholder="البريد الإلكتروني (اختياري)" value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} className="w-full p-2 border rounded focus:ring-primary focus:border-primary transition" />
            
            <div>
                <p className="font-semibold mb-2">خيار التوصيل:</p>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2">
                        <input type="radio" name="delivery" value="office" checked={deliveryType === 'office'} onChange={() => setDeliveryType('office')} className="text-primary focus:ring-primary"/>
                        <span>للمكتب ({settings.deliveryFeeOffice.toLocaleString('ar-DZ')} د.ج)</span>
                    </label>
                    <label className="flex items-center gap-2">
                        <input type="radio" name="delivery" value="home" checked={deliveryType === 'home'} onChange={() => setDeliveryType('home')} className="text-primary focus:ring-primary"/>
                        <span>للمنزل ({settings.deliveryFeeHome.toLocaleString('ar-DZ')} د.ج)</span>
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
                <div className="flex justify-between font-normal text-sm">
                    <span>المجموع الجزئي:</span>
                    <span>{subtotal.toLocaleString('ar-DZ')} د.ج</span>
                </div>
                    <div className="flex justify-between font-normal text-sm">
                    <span>رسوم التوصيل:</span>
                    <span>{deliveryFee.toLocaleString('ar-DZ')} د.ج</span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-2">
                    <span>الإجمالي:</span>
                    <span>{totalPrice.toLocaleString('ar-DZ')} د.ج</span>
                </div>
            </div>
            
            <div className="flex gap-4 mt-6">
                    <button type="button" onClick={() => setView('cart')} className="flex-1 bg-gray-200 text-text-base px-6 py-3 rounded-lg font-bold hover:bg-gray-300 transition-all active:scale-95" disabled={isSubmitting}>
                    العودة للسلة
                </button>
                    <button type="submit" className="flex-1 bg-secondary text-white px-6 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-all active:scale-95" disabled={isSubmitting}>
                    {isSubmitting ? 'جاري التأكيد...' : 'تأكيد الطلب'}
                </button>
            </div>
        </form>
    );

    return (
        <div className={`fixed inset-0 bg-black z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${isClosing ? 'bg-opacity-0' : 'bg-opacity-50'}`}>
            <div className={`bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col transition-all duration-300 ${isClosing ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
                <div className="p-6 pb-2 flex-shrink-0 relative">
                    <button onClick={handleClose} className="absolute top-4 left-4 text-gray-500 hover:text-gray-800 z-10">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                    {view === 'cart' && <h2 className="text-2xl font-bold text-primary text-center">سلة التسوق</h2>}
                    {view === 'checkout' && <h2 className="text-2xl font-bold text-primary text-center">إتمام الطلب</h2>}
                </div>
                <div className="p-6 pt-2 overflow-y-auto">
                    {view === 'success' ? <OrderSuccessMessage onClose={handleClose} />
                    : view === 'checkout' ? renderCheckoutView()
                    : renderCartView()}
                </div>
            </div>
        </div>
    );
};