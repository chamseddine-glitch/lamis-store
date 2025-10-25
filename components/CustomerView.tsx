





import React, { useState, useContext, useMemo, useEffect } from 'react';
import { StoreContext } from '../context/StoreContext';
import type { Product, CartItem, Order } from '../types';
import { OrderStatus } from '../types';
import { ALGERIA_DATA } from '../constants';
import { ShoppingCartIcon, XMarkIcon, ArchiveBoxIcon, CheckCircleIcon, StarIcon, ShareIcon, EyeIcon } from './icons';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, doc, runTransaction } from 'firebase/firestore';

// ProductCard Component
const ProductCard: React.FC<{ product: Product; onClick: () => void; }> = ({ product, onClick }) => {
    return (
        <div onClick={onClick} className="cursor-pointer group relative bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 ease-in-out text-right w-full flex flex-col">
            <div className="relative w-full overflow-hidden">
                <img src={product.images[0]} alt={product.name} className="h-64 w-full object-cover object-center transition-transform duration-300 group-hover:scale-110" />
                {product.isOnSale && <div className="absolute top-3 left-3 bg-secondary text-white text-xs font-bold px-2 py-1 rounded-md z-10">تخفيض!</div>}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300" aria-hidden="true">
                        <EyeIcon className="w-7 h-7 text-primary"/>
                    </div>
                </div>
            </div>
            <div className="p-4 flex flex-col flex-grow">
                 <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-bold text-text-base flex-1 leading-tight">{product.name}</h3>
                    <div className="flex flex-col items-end mr-2">
                        {product.isOnSale && typeof product.salePrice === 'number' ? (
                            <>
                                <p className="text-lg font-bold text-secondary whitespace-nowrap">{product.salePrice.toLocaleString('ar-DZ')} د.ج</p>
                                <p className="text-sm text-text-muted line-through">{product.price.toLocaleString('ar-DZ')} د.ج</p>
                            </>
                        ) : (
                            <p className="text-lg font-bold text-primary whitespace-nowrap">{product.price.toLocaleString('ar-DZ')} د.ج</p>
                        )}
                    </div>
                </div>
                 {product.rating && (
                    <div className="flex items-center gap-1 text-sm text-yellow-500">
                        <StarIcon className="w-5 h-5"/>
                        <span className="font-bold text-gray-700">{product.rating.average.toFixed(1)}</span>
                        <span className="text-text-muted">({product.rating.count})</span>
                    </div>
                 )}
                <p className="text-sm text-text-muted h-10 overflow-hidden flex-grow mt-1">{product.description}</p>
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

const updateProductRating = async (productId: string, rating: number) => {
    const productRef = doc(db, "products", productId);
    try {
        await runTransaction(db, async (transaction) => {
            const productDoc = await transaction.get(productRef);
            if (!productDoc.exists()) {
                throw "Document does not exist!";
            }
            const productData = productDoc.data() as Product;
            const currentRating = productData.rating || { average: 0, count: 0 };
            
            const newCount = currentRating.count + 1;
            const newAverage = ((currentRating.average * currentRating.count) + rating) / newCount;

            transaction.update(productRef, { 
                rating: { average: newAverage, count: newCount }
            });
        });
    } catch (e) {
        console.error("Transaction failed: ", e);
        // Handle error, maybe show a message to the user
    }
};


// OrderModal Component
const OrderModal: React.FC<{ product: Product | null; onClose: () => void; }> = ({ product, onClose }) => {
    const { state, dispatch } = useContext(StoreContext);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [deliveryType, setDeliveryType] = useState<'home' | 'office'>('office');
    const [selectedWilaya, setSelectedWilaya] = useState('');
    const [selectedBaladiya, setSelectedBaladiya] = useState('');
    const [deliveryCompany, setDeliveryCompany] = useState('');
    const [streetAddress, setStreetAddress] = useState('');
    const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
    const [isClosing, setIsClosing] = useState(false);
    const [selectedImage, setSelectedImage] = useState(0);
    const [isOrderSuccessful, setIsOrderSuccessful] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [ratedProducts, setRatedProducts] = useState<Record<string, number>>({});
    const [hoverRating, setHoverRating] = useState(0);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        setSelectedImage(0);
        
        try {
            const storedRatings = JSON.parse(localStorage.getItem('ratedProducts') || '{}');
            setRatedProducts(storedRatings);
        } catch(e) {}

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

    const userRating = ratedProducts[product.id];

    const handleRate = async (rating: number) => {
        if (userRating || !product.id) return; // Already rated or no product
        
        const newRatedProducts = { ...ratedProducts, [product.id]: rating };
        setRatedProducts(newRatedProducts);
        localStorage.setItem('ratedProducts', JSON.stringify(newRatedProducts));

        await updateProductRating(product.id, rating);
    };

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
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

    const deliveryFee = useMemo(() => {
        if (!selectedWilaya) return 0;
        const feeForWilaya = state.settings.deliveryFees.find(f => f.wilaya === selectedWilaya);
        if (!feeForWilaya) return deliveryType === 'home' ? 500 : 300; // Fallback
        return deliveryType === 'home' ? feeForWilaya.home : feeForWilaya.office;
    }, [selectedWilaya, deliveryType, state.settings.deliveryFees]);

    const modalProductPrice = product.isOnSale && typeof product.salePrice === 'number' ? product.salePrice : product.price;
    const totalPrice = modalProductPrice + deliveryFee;

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

        const newOrderData: Omit<Order, 'id' | 'createdAt'> & {createdAt: any} = {
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
        
        if (state.settings.deliveryCompanies?.length > 0) {
            newOrderData.deliveryCompany = deliveryCompany;
        }

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
    
    const shareProduct = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `اكتشف ${product.name}`,
                    text: `وجدت هذا المنتج الرائع: ${product.name} على ${state.settings.storeName}!`,
                    url: window.location.href,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        } else {
            alert('خاصية المشاركة غير مدعومة في متصفحك. يمكنك نسخ الرابط يدوياً.');
        }
    };


    const baladiyats = ALGERIA_DATA.find(w => w.wilaya_name_ar === selectedWilaya)?.baladiyats || [];

    return (
        <div className={`fixed inset-0 bg-black z-50 flex justify-center items-center p-4 transition-opacity duration-300 ${isClosing ? 'bg-opacity-0' : 'bg-opacity-50'}`}>
            <div className={`bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-full overflow-y-auto p-6 relative transition-all duration-300 ${isClosing ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
                {isOrderSuccessful ? (
                    <OrderSuccessMessage onClose={handleClose} />
                ) : (
                    <>
                        <div className="absolute top-4 left-4 flex gap-2">
                             <button onClick={shareProduct} className="text-gray-500 hover:text-gray-800 p-1 hover:bg-gray-100 rounded-full" aria-label="مشاركة المنتج">
                                <ShareIcon className="w-6 h-6" />
                            </button>
                            <button onClick={handleClose} className="text-gray-500 hover:text-gray-800" aria-label="إغلاق">
                                <XMarkIcon className="w-7 h-7" />
                            </button>
                        </div>
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
                                 <div className="text-center mt-2">
                                    {product.isOnSale && typeof product.salePrice === 'number' ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <p className="text-lg font-bold text-secondary">{product.salePrice.toLocaleString('ar-DZ')} د.ج</p>
                                            <p className="text-sm text-text-muted line-through">{product.price.toLocaleString('ar-DZ')} د.ج</p>
                                        </div>
                                    ) : (
                                        <p className="text-lg font-bold">{product.price.toLocaleString('ar-DZ')} د.ج</p>
                                    )}
                                 </div>
                                 <div className="mt-4 text-center">
                                    <p className="text-sm font-semibold mb-1">{userRating ? 'شكراً لتقييمك!' : 'قيّم هذا المنتج'}</p>
                                    <div className="flex justify-center" onMouseLeave={() => setHoverRating(0)}>
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button type="button" key={star} onClick={() => handleRate(star)} onMouseEnter={() => setHoverRating(star)} disabled={!!userRating} className="disabled:cursor-not-allowed">
                                                <StarIcon className={`w-7 h-7 transition-colors ${star <= (hoverRating || userRating || 0) ? 'text-yellow-400' : 'text-gray-300'}`} />
                                            </button>
                                        ))}
                                    </div>
                                    {product.rating && product.rating.count > 0 && (
                                        <p className="text-xs text-text-muted mt-1">
                                            {product.rating.average.toFixed(1)} من 5 نجوم ({product.rating.count} تقييم)
                                        </p>
                                    )}
                                 </div>
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
                                
                                <div>
                                    <p className="font-semibold mb-2">خيار التوصيل:</p>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2">
                                            <input type="radio" name="delivery" value="office" checked={deliveryType === 'office'} onChange={() => setDeliveryType('office')} className="text-primary focus:ring-primary"/>
                                            <span>للمكتب</span>
                                        </label>
                                        <label className="flex items-center gap-2">
                                            <input type="radio" name="delivery" value="home" checked={deliveryType === 'home'} onChange={() => setDeliveryType('home')} className="text-primary focus:ring-primary"/>
                                            <span>للمنزل</span>
                                        </label>
                                    </div>
                                </div>
                                
                                {state.settings.deliveryCompanies?.length > 0 && (
                                     <div className="animate-fade-in-up">
                                        <select value={deliveryCompany} onChange={e => setDeliveryCompany(e.target.value)} className="w-full p-2 border rounded focus:ring-primary focus:border-primary transition" required>
                                            <option value="">اختر شركة التوصيل</option>
                                            {state.settings.deliveryCompanies.map(company => <option key={company} value={company}>{company}</option>)}
                                        </select>
                                     </div>
                                )}

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
                                     <div className="flex justify-between text-sm">
                                        <span>رسوم التوصيل:</span>
                                        <span>{deliveryFee === 0 ? 'مجاني' : `${deliveryFee.toLocaleString('ar-DZ')} د.ج`}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg">
                                        <span>الإجمالي:</span>
                                        <span>{totalPrice.toLocaleString('ar-DZ')} د.ج</span>
                                    </div>
                                </div>
                                
                                <div className="flex gap-4 mt-6">
                                     <button type="submit" className="flex-1 bg-secondary text-white px-6 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-all active:scale-95" disabled={isSubmitting || !selectedWilaya}>
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

export const CustomerView: React.FC<{ activeCategory: string; showOffersOnly: boolean; setActiveCategory: (cat: string) => void; }> = ({ activeCategory, showOffersOnly, setActiveCategory }) => {
    const { state } = useContext(StoreContext);
    const [orderingProduct, setOrderingProduct] = useState<Product | null>(null);

    const categories = state.categories;
    
    const filteredProducts = useMemo(() => {
        let products = state.products;
        if (showOffersOnly) {
            products = products.filter(p => p.isOnSale);
        }
        if (activeCategory !== 'الكل') {
            products = products.filter(p => p.category === activeCategory);
        }
        return products;
    }, [state.products, activeCategory, showOffersOnly]);

    return (
        <div className="bg-base-100 min-h-screen">
            <main className="container mx-auto px-4 py-8">
                
                <div id="products-section" className="mb-8 animate-fade-in-up sticky top-[70px] z-30 bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-md">
                    <h2 className="text-2xl font-bold text-center mb-4 text-text-base">
                        {showOffersOnly ? 'أهم العروض' : 'تصفح منتجاتنا'}
                    </h2>
                    <div className="flex justify-center flex-wrap gap-2">
                        {categories.map(category => (
                            <button 
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${activeCategory === category && !showOffersOnly ? 'bg-primary text-white shadow-md' : 'bg-white text-text-muted hover:bg-gray-100'}`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                <div key={activeCategory + (showOffersOnly ? 'offers' : '')} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in-up">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map(product => (
                            <ProductCard key={product.id} product={product} onClick={() => setOrderingProduct(product)} />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-16">
                            <ArchiveBoxIcon className="w-16 h-16 mx-auto text-gray-400" />
                            <h3 className="mt-4 text-xl font-semibold text-text-base">{showOffersOnly ? 'لا توجد عروض حالياً' : 'لا توجد منتجات'}</h3>
                            <p className="text-text-muted">{showOffersOnly ? 'ترقب عروضنا القادمة!' : 'لم يتم العثور على منتجات في هذا التصنيف حالياً.'}</p>
                        </div>
                    )}
                </div>
            </main>
            {orderingProduct && <OrderModal product={orderingProduct} onClose={() => setOrderingProduct(null)} />}
        </div>
    );
};