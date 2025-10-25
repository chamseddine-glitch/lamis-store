

import React, { useState, useContext, useEffect } from 'react';
import { StoreContext } from '../context/StoreContext';
import type { Order, Product, ProductOption, StoreSettings, DeliveryFee, ThemeColors } from '../types';
import { OrderStatus, ViewMode } from '../types';
import { 
    TrashIcon, PencilIcon, ArchiveBoxIcon, ClipboardDocumentListIcon, XMarkIcon, 
    ChartPieIcon, Cog6ToothIcon, TagIcon, ClockIcon, TruckIcon, CheckBadgeIcon, XCircleIcon,
    UserCircleIcon, LogoutIcon, CheckIcon, PhoneIcon, MapPinIcon, CurrencyDinarIcon, PackageIcon
} from './icons';
import { db } from '../firebase';
import { collection, doc, addDoc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { ALGERIA_DATA, ALL_DELIVERY_COMPANIES } from '../constants';

// Helper Components
const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-200/80 dark:border-slate-700 flex items-center gap-6 transition-all hover:shadow-lg hover:-translate-y-1 group">
        <div className="bg-gradient-to-br from-primary/10 to-primary/20 dark:from-slate-700 dark:to-slate-600 p-4 rounded-full transition-transform group-hover:scale-110 ring-4 ring-white/50 dark:ring-slate-800/50">
            {icon}
        </div>
        <div>
            <p className="text-base text-gray-500 dark:text-slate-400 font-semibold">{title}</p>
            <p className="text-3xl font-bold text-gray-800 dark:text-slate-100 mt-1">{value}</p>
        </div>
    </div>
);

const getStatusChipClass = (status: OrderStatus) => {
    switch (status) {
        case OrderStatus.PENDING: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300';
        case OrderStatus.SHIPPED: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300';
        case OrderStatus.DELIVERED: return 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300';
        case OrderStatus.CANCELLED: return 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300';
        default: return 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-300';
    }
};

const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
        case OrderStatus.PENDING: return <ClockIcon className="w-4 h-4" />;
        case OrderStatus.SHIPPED: return <TruckIcon className="w-4 h-4" />;
        case OrderStatus.DELIVERED: return <CheckBadgeIcon className="w-4 h-4" />;
        case OrderStatus.CANCELLED: return <XCircleIcon className="w-4 h-4" />;
        default: return null;
    }
};

const ConfirmationModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; children: React.ReactNode; confirmText?: string; }> = ({ isOpen, onClose, onConfirm, title, children, confirmText = "تأكيد الحذف" }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md animate-fade-in-up">
                <h3 className="text-xl font-bold mb-4 dark:text-white">{title}</h3>
                <div className="text-text-muted dark:text-slate-400 mb-6">{children}</div>
                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded hover:bg-gray-300 transition-colors active:scale-95">إلغاء</button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors active:scale-95">{confirmText}</button>
                </div>
            </div>
        </div>
    );
};

// Firestore Service Functions
const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { status });
};

const deleteOrder = async (orderId: string) => {
    await deleteDoc(doc(db, 'orders', orderId));
};

const DoughnutChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) {
        return <div className="flex items-center justify-center h-48 text-text-muted">لا توجد بيانات لعرضها</div>;
    }

    let accumulated = 0;
    const segments = data.map(item => {
        const percentage = (item.value / total) * 100;
        const dashArray = 2 * Math.PI * 40;
        const dashOffset = dashArray * (1 - (percentage / 100));
        const rotation = (accumulated / total) * 360;
        accumulated += item.value;
        return { ...item, percentage, dashArray, dashOffset, rotation };
    });

    return (
        <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-48 h-48">
                {segments.map((segment, index) => (
                    <svg key={index} className="absolute inset-0 w-full h-full transform" style={{ transform: `rotate(${segment.rotation}deg)` }}>
                        <circle
                            r="40"
                            cx="50%"
                            cy="50%"
                            fill="transparent"
                            stroke={segment.color}
                            strokeWidth="20"
                            strokeDasharray={segment.dashArray}
                            strokeDashoffset={segment.dashOffset}
                            className="transition-all duration-1000"
                            style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
                        />
                    </svg>
                ))}
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold dark:text-white">{total}</span>
                    <span className="text-sm text-text-muted">طلبات</span>
                </div>
            </div>
            <div className="flex-1 space-y-2 w-full">
                {data.map(item => (
                    <div key={item.label} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                            <span className="font-semibold">{item.label}</span>
                        </div>
                        <span className="font-mono">{item.value} ({((item.value / total) * 100).toFixed(0)}%)</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


// Dashboard Sections
const DashboardOverview: React.FC<{ orders: Order[]; products: Product[] }> = ({ orders, products }) => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING).length;
    const shippedOrders = orders.filter(o => o.status === OrderStatus.SHIPPED).length;
    const deliveredOrders = orders.filter(o => o.status === OrderStatus.DELIVERED).length;
    const cancelledOrders = orders.filter(o => o.status === OrderStatus.CANCELLED).length;
    const totalRevenue = orders
        .filter(o => o.status === OrderStatus.DELIVERED)
        .reduce((sum, o) => sum + o.totalPrice, 0);
    const productCount = products.length;

    const stats = [
        { title: "إجمالي الطلبات", value: totalOrders, icon: <ClipboardDocumentListIcon className="w-8 h-8 text-primary" /> },
        { title: "طلبات قيد المراجعة", value: pendingOrders, icon: <ClockIcon className="w-8 h-8 text-yellow-500" /> },
        { title: "الأرباح المكتملة", value: `${totalRevenue.toLocaleString('ar-DZ')} د.ج`, icon: <CurrencyDinarIcon className="w-8 h-8 text-green-500" /> },
        { title: "عدد المنتجات", value: productCount, icon: <PackageIcon className="w-8 h-8 text-indigo-500" /> },
    ];

    const chartData = [
        { label: OrderStatus.PENDING, value: pendingOrders, color: '#f59e0b' },
        { label: OrderStatus.SHIPPED, value: shippedOrders, color: '#3b82f6' },
        { label: OrderStatus.DELIVERED, value: deliveredOrders, color: '#22c55e' },
        { label: OrderStatus.CANCELLED, value: cancelledOrders, color: '#ef4444' },
    ].filter(d => d.value > 0);

    return (
        <div className="animate-fade-in-up space-y-10">
            <div>
                 <h3 className="text-3xl font-bold mb-6 text-gray-700 dark:text-gray-300 border-b pb-2 border-gray-200 dark:border-slate-700">نظرة عامة</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                        <div key={stat.title} style={{ animationDelay: `${i * 100}ms` }} className="animate-fade-in-up">
                            <StatCard title={stat.title} value={stat.value} icon={stat.icon} />
                        </div>
                    ))}
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-200/80 dark:border-slate-700">
                    <h4 className="text-xl font-bold mb-4">حالة الطلبات</h4>
                    <DoughnutChart data={chartData} />
                </div>
                 <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md border border-gray-200/80 dark:border-slate-700">
                    <h4 className="text-xl font-bold mb-4">آخر الطلبات</h4>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                         {orders.length === 0 ? (
                            <div className="text-center py-10 text-text-muted">لا توجد طلبات بعد.</div>
                         ) : (
                            orders.slice(0, 5).map(order => (
                                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
                                    <div>
                                        <p className="font-bold">{order.customerName}</p>
                                        <p className="text-xs text-text-muted">{new Date(order.createdAt).toLocaleString('ar-DZ')}</p>
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1.5 ${getStatusChipClass(order.status)}`}>
                                        {getStatusIcon(order.status)}
                                        {order.status}
                                    </span>
                                </div>
                            ))
                         )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const OrdersManagement: React.FC<{ orders: Order[] }> = ({ orders }) => {
    const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

    const handleStatusChange = async (orderId: string, status: OrderStatus) => {
        try {
            await updateOrderStatus(orderId, status);
        } catch (error) {
            console.error("Error updating order status: ", error);
            alert('حدث خطأ أثناء تحديث حالة الطلب.');
        }
    };

    const confirmDelete = async () => {
        if (orderToDelete) {
            try {
                await deleteOrder(orderToDelete.id);
                setOrderToDelete(null);
            } catch (error) {
                console.error("Error deleting order: ", error);
                alert('حدث خطأ أثناء حذف الطلب.');
            }
        }
    };

    if (orders.length === 0) {
        return (
            <div className="text-center py-16 animate-fade-in-up">
                <ClipboardDocumentListIcon className="w-16 h-16 mx-auto text-gray-400" />
                <h3 className="mt-4 text-xl font-semibold text-text-base dark:text-slate-300">لا توجد طلبات بعد</h3>
                <p className="text-text-muted dark:text-slate-400">عندما يقوم زبون بتقديم طلب، سيظهر هنا.</p>
            </div>
        );
    }

    return (
        <>
            <div className="animate-fade-in-up">
                <h3 className="text-3xl font-bold mb-6 text-gray-700 dark:text-gray-300 border-b pb-2 border-gray-200 dark:border-slate-700">إدارة الطلبات</h3>
                <div className="space-y-4">
                    {orders.map(order => (
                        <div key={order.id} className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-primary/50">
                            <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-b dark:border-slate-700 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                                <div>
                                    <p className="font-bold text-xl text-primary">{order.customerName}</p>
                                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-text-muted dark:text-slate-400 mt-1">
                                        <span className="flex items-center gap-1.5"><PhoneIcon className="w-4 h-4" />{order.customerPhone}</span>
                                        <span className="flex items-center gap-1.5"><MapPinIcon className="w-4 h-4" />{order.address.wilaya}, {order.address.baladiya}</span>
                                        {order.deliveryCompany && <span className="text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1.5"><TruckIcon className="w-4 h-4"/>{order.deliveryCompany}</span>}
                                    </div>
                                </div>
                                <div className="text-sm text-text-muted dark:text-slate-400 text-right shrink-0">
                                    <p> <span className="font-semibold">رقم الطلب:</span> {order.id.substring(0, 8)}</p>
                                    <p> <span className="font-semibold">تاريخ الطلب:</span> {new Date(order.createdAt).toLocaleDateString('ar-DZ')}</p>
                                </div>
                            </div>
                            <div className="p-4">
                                <h4 className="font-semibold mb-2">المنتجات المطلوبة:</h4>
                                <ul className="space-y-2">
                                    {order.items.map(item => (
                                        <li key={item.id} className="flex justify-between items-start text-sm">
                                            <div>
                                                <p className="font-semibold">{item.product.name} <span className="text-text-muted dark:text-slate-400 font-normal">x{item.quantity}</span></p>
                                                <div className="text-xs text-gray-500 dark:text-slate-400">
                                                    {Object.entries(item.selectedOptions).map(([key, value]) => (
                                                        <span key={key} className="pl-2">{key}: {value}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="font-mono whitespace-nowrap">{(item.product.price * item.quantity).toLocaleString('ar-DZ')} د.ج</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="p-4 bg-gray-50 dark:bg-slate-800/50 border-t dark:border-slate-700 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                               <div className="flex items-center gap-2">
                                    <select 
                                        value={order.status} 
                                        onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                        className="p-2 border rounded-lg focus:ring-primary focus:border-primary transition w-40 bg-white text-gray-900 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600"
                                    >
                                        {Object.values(OrderStatus).map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                    <span className={`px-3 py-1 text-sm font-semibold rounded-full flex items-center gap-1.5 ${getStatusChipClass(order.status)}`}>
                                        {getStatusIcon(order.status)}
                                        {order.status}
                                    </span>
                                    <button onClick={() => setOrderToDelete(order)} className="text-red-600 p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors" aria-label="حذف الطلب">
                                        <TrashIcon className="w-5 h-5"/>
                                    </button>
                               </div>
                               <div>
                                    <span className="text-text-muted dark:text-slate-400">الإجمالي: </span>
                                    <span className="font-bold text-lg">{order.totalPrice.toLocaleString('ar-DZ')} د.ج</span>
                               </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <ConfirmationModal
                isOpen={!!orderToDelete}
                onClose={() => setOrderToDelete(null)}
                onConfirm={confirmDelete}
                title="تأكيد حذف الطلب"
            >
                <p>هل أنت متأكد من حذف الطلب للزبون: <strong>{orderToDelete?.customerName}</strong>؟ لا يمكن التراجع عن هذا الإجراء.</p>
            </ConfirmationModal>
        </>
    );
};

const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      if (!event?.target?.result || typeof event.target.result !== 'string') {
        return reject(new Error('Failed to read file.'));
      }
      
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Failed to get canvas context.'));
        }
        ctx.drawImage(img, 0, 0, width, height);

        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = () => reject(new Error('Image failed to load.'));
    };
    reader.onerror = () => reject(new Error('An error occurred while reading the file.'));
  });
};


const ProductForm: React.FC<{ product?: Product; onSave: () => void; onCancel: () => void; }> = ({ product, onSave, onCancel }) => {
    const { state } = useContext(StoreContext);
    const [formData, setFormData] = useState<Product>(product || { id: '', name: '', description: '', price: 0, category: '', images: [], options: [], isOnSale: false, salePrice: 0 });
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const inputStyle = "w-full p-2 border rounded focus:ring-2 focus:ring-primary/80 focus:border-primary focus:shadow-lg focus:shadow-primary/20 transition-all bg-white text-gray-900 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: (name === 'price' || name === 'salePrice') ? Number(value) : value }));
    };
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = [...e.target.files];
            const imagePromises = files.map(file => resizeImage(file, 800, 800));

            Promise.all(imagePromises)
                .then(resizedImages => {
                    setFormData(prev => ({ ...prev, images: [...prev.images, ...resizedImages] }));
                })
                .catch(error => {
                    console.error("Error processing images:", error);
                    alert('حدث خطأ أثناء معالجة الصور. قد تكون الصورة كبيرة جداً أو التنسيق غير مدعوم.');
                });
        }
    };
    
    const handleRemoveImage = (indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleOptionNameChange = (optionIndex: number, newName: string) => {
        const newOptions = [...formData.options];
        newOptions[optionIndex].name = newName;
        setFormData(prev => ({ ...prev, options: newOptions }));
    };

    const addOption = () => {
        setFormData(prev => ({
            ...prev,
            options: [...prev.options, { id: `opt-${Date.now()}`, name: '', values: [] }]
        }));
    };

    const removeOption = (optionIndex: number) => {
        const newOptions = formData.options.filter((_, i) => i !== optionIndex);
        setFormData(prev => ({ ...prev, options: newOptions }));
    };

    const handleOptionValueAdd = (optionIndex: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
            e.preventDefault();
            const newValue = e.currentTarget.value.trim();
            const newOptions = [...formData.options];
            if (!newOptions[optionIndex].values.includes(newValue)) {
                newOptions[optionIndex].values.push(newValue);
                setFormData(prev => ({ ...prev, options: newOptions }));
            }
            e.currentTarget.value = '';
        }
    };

    const removeOptionValue = (optionIndex: number, valueIndex: number) => {
        const newOptions = [...formData.options];
        newOptions[optionIndex].values = newOptions[optionIndex].values.filter((_, i) => i !== valueIndex);
        setFormData(prev => ({ ...prev, options: newOptions }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const finalProductData = { ...formData };
            if (!finalProductData.isOnSale) {
                finalProductData.salePrice = 0;
            }
            
            if (product?.id) {
                const { id, ...dataToUpdate } = finalProductData;
                await setDoc(doc(db, 'products', product.id), dataToUpdate);
            } else {
                const { id, ...dataToAdd } = finalProductData;
                await addDoc(collection(db, 'products'), dataToAdd);
            }

            onSave();
        } catch (error) {
            console.error("Error saving product:", error);
            alert("حدث خطأ أثناء حفظ المنتج.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 dark:bg-slate-800/50 p-6 rounded-lg border dark:border-slate-700 animate-fade-in-up">
            <input type="text" name="name" placeholder="اسم المنتج" value={formData.name} onChange={handleChange} className={inputStyle} required />
            <textarea name="description" placeholder="وصف المنتج" value={formData.description} onChange={handleChange} className={inputStyle} required />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="number" name="price" placeholder="السعر" value={formData.price} onChange={handleChange} className={inputStyle} required />
                <div>
                    <input 
                        list="categories-list"
                        type="text" 
                        name="category" 
                        placeholder="التصنيف" 
                        value={formData.category} 
                        onChange={handleChange} 
                        className={inputStyle}
                        required 
                    />
                     <datalist id="categories-list">
                        {state.settings.managedCategories?.map(cat => <option key={cat} value={cat} />)}
                    </datalist>
                </div>
            </div>
            <div className="md:col-span-2 border-t dark:border-slate-700 pt-4 mt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="isOnSale" checked={formData.isOnSale || false} onChange={e => setFormData(prev => ({ ...prev, isOnSale: e.target.checked }))} className="h-4 w-4 rounded text-primary focus:ring-primary border-gray-300 dark:border-slate-600"/>
                    <span className="font-semibold">المنتج في تخفيض؟</span>
                </label>
                {formData.isOnSale && (
                    <div className="mt-2 animate-fade-in-up">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">سعر التخفيض</label>
                        <input type="number" name="salePrice" placeholder="سعر التخفيض" value={formData.salePrice || ''} onChange={handleChange} className={inputStyle} required />
                    </div>
                )}
            </div>
            <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">صور المنتج</label>
                 <input type="file" multiple onChange={handleImageChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                 <div className="flex gap-2 mt-2 flex-wrap min-h-[5rem] bg-gray-100 dark:bg-slate-700 p-2 rounded-md border dark:border-slate-600">
                    {formData.images.map((img, i) => (
                        <div key={`${i}-${img.substring(0, 30)}`} className="relative w-20 h-20 rounded shadow-sm group">
                            <img src={img} className="w-full h-full rounded object-cover" alt={`Product image ${i+1}`} />
                            <button type="button" onClick={() => handleRemoveImage(i)} className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110">
                                <XMarkIcon className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                 </div>
            </div>
            
            <div className="border-t dark:border-slate-700 pt-4 space-y-3">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200">خيارات المنتج (مثل اللون، الحجم، السعة)</h4>
                {formData.options.map((option, optionIndex) => (
                    <div key={option.id} className="p-3 bg-gray-100 dark:bg-slate-700/50 rounded border dark:border-slate-600 space-y-2">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                placeholder="اسم الخيار (مثال: الحجم)"
                                value={option.name}
                                onChange={(e) => handleOptionNameChange(optionIndex, e.target.value)}
                                className={inputStyle}
                            />
                            <button type="button" onClick={() => removeOption(optionIndex)} className="text-red-500 p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div>
                            <input
                                type="text"
                                placeholder="أضف قيمة واضغط Enter (مثال: XL)"
                                onKeyDown={(e) => handleOptionValueAdd(optionIndex, e)}
                                className={inputStyle}
                            />
                            <div className="flex flex-wrap gap-2 mt-2">
                                {option.values.map((value, valueIndex) => (
                                    <span key={value} className="flex items-center bg-primary/20 text-primary text-sm font-medium px-2.5 py-1 rounded-full">
                                        {value}
                                        <button type="button" onClick={() => removeOptionValue(optionIndex, valueIndex)} className="mr-1.5 -ml-1 text-primary hover:text-red-700">
                                            <XMarkIcon className="w-4 h-4" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
                <button type="button" onClick={addOption} className="text-sm font-semibold text-primary hover:underline">+ إضافة خيار جديد</button>
            </div>
            
            <div className="flex justify-end gap-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 dark:bg-slate-600 dark:hover:bg-slate-500 rounded hover:bg-gray-400 transition-colors active:scale-95" disabled={isSubmitting}>إلغاء</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90 transition-colors active:scale-95" disabled={isSubmitting}>
                    {isSubmitting ? 'جاري الحفظ...' : 'حفظ المنتج'}
                </button>
            </div>
        </form>
    );
}

const ProductsAndCategoriesManagement: React.FC<{ products: Product[] }> = ({ products }) => {
    const { state } = useContext(StoreContext);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);
    const [newCategory, setNewCategory] = useState('');
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
    const [isSavingCategories, setIsSavingCategories] = useState(false);

    const handleSave = () => {
        setIsFormVisible(false);
        setEditingProduct(undefined);
    };
    
    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsFormVisible(true);
        window.scrollTo(0, 0);
    };

    const handleDelete = (product: Product) => {
        setProductToDelete(product);
    };

    const confirmDelete = async () => {
        if (!productToDelete) return;
        try {
            await deleteDoc(doc(db, "products", productToDelete.id));
            setProductToDelete(null);
        } catch (error) {
            console.error("Error deleting product: ", error);
            alert("حدث خطأ أثناء حذف المنتج.");
        }
    };

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        const categoryToAdd = newCategory.trim();
        const currentCategories = Array.isArray(state.settings.managedCategories) ? state.settings.managedCategories : [];

        if (categoryToAdd && !currentCategories.includes(categoryToAdd)) {
            const newCategories = [...currentCategories, categoryToAdd];
            setIsSavingCategories(true);
            try {
                await setDoc(doc(db, "store", "settings"), { managedCategories: newCategories }, { merge: true });
                setNewCategory('');
            } catch (error) {
                console.error("Error adding category:", error);
                alert("حدث خطأ أثناء إضافة التصنيف.");
            } finally {
                setIsSavingCategories(false);
            }
        }
    };
    
    const confirmDeleteCategory = async () => {
        if (!categoryToDelete) return;
        const currentCategories = Array.isArray(state.settings.managedCategories) ? state.settings.managedCategories : [];
        const newCategories = currentCategories.filter(c => c !== categoryToDelete);
        setIsSavingCategories(true);
        try {
            await setDoc(doc(db, "store", "settings"), { managedCategories: newCategories }, { merge: true });
            setCategoryToDelete(null);
        } catch (error) {
            console.error("Error deleting category:", error);
            alert("حدث خطأ أثناء حذف التصنيف.");
        } finally {
            setIsSavingCategories(false);
        }
    };
    
    const isCategoryInUse = (category: string) => products.some(p => p.category === category);

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold">إدارة المنتجات</h3>
                    <button onClick={() => { setEditingProduct(undefined); setIsFormVisible(!isFormVisible); }} className="px-4 py-2 bg-secondary text-white rounded hover:bg-opacity-90 transition-colors active:scale-95">
                        {isFormVisible ? 'إغلاق النموذج' : 'إضافة منتج جديد'}
                    </button>
                </div>
                {isFormVisible && <ProductForm product={editingProduct} onSave={handleSave} onCancel={() => setIsFormVisible(false)} />}
                
                <div className="space-y-3">
                    {products.length === 0 && !isFormVisible && (
                         <div className="text-center py-16">
                            <ArchiveBoxIcon className="w-16 h-16 mx-auto text-gray-400" />
                            <h3 className="mt-4 text-xl font-semibold text-text-base dark:text-slate-300">لا توجد منتجات</h3>
                            <p className="text-text-muted dark:text-slate-400">ابدأ بإضافة منتجك الأول من الزر أعلاه.</p>
                        </div>
                    )}
                    {products.map(product => (
                        <div key={product.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-lg hover:shadow-md hover:bg-gray-50 dark:hover:bg-slate-800/80 transition-all duration-200">
                            <div className="flex items-center gap-4">
                                <img src={product.images[0]} className="w-12 h-12 object-cover rounded"/>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">{product.name}</span>
                                        {product.isOnSale && <span className="text-xs font-bold bg-secondary text-white px-2 py-0.5 rounded-full">تخفيض</span>}
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-slate-400">{product.category}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleEdit(product)} className="text-blue-600 p-2 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-full transition-colors"><PencilIcon className="w-5 h-5"/></button>
                                <button onClick={() => handleDelete(product)} className="text-red-600 p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-colors"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-bold mb-4">إدارة التصنيفات</h3>
                <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
                    <input 
                        type="text" 
                        value={newCategory} 
                        onChange={e => setNewCategory(e.target.value)}
                        placeholder="اسم التصنيف الجديد"
                        className="flex-grow p-2 border rounded focus:ring-primary focus:border-primary transition bg-white text-gray-900 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600"
                    />
                    <button type="submit" className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90 transition-colors active:scale-95" disabled={isSavingCategories}>
                        {isSavingCategories ? '...' : 'إضافة'}
                    </button>
                </form>

                <div className="flex flex-wrap gap-3">
                    {state.settings.managedCategories?.map(category => (
                        <span key={category} className="flex items-center bg-gray-200 text-gray-800 dark:bg-slate-700 dark:text-slate-200 pl-3 pr-1 py-1 rounded-full font-semibold group transition-colors hover:bg-gray-300 dark:hover:bg-slate-600">
                            {category} ({products.filter(p => p.category === category).length})
                            <button onClick={() => setCategoryToDelete(category)} className="mr-2 text-gray-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 opacity-50 group-hover:opacity-100 hover:!opacity-100 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full p-0.5 transition-all">
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        </span>
                    ))}
                     {(state.settings.managedCategories?.length || 0) === 0 && (
                        <div className="text-center py-10 w-full">
                            <p className="text-text-muted dark:text-slate-400">لا توجد تصنيفات. قم بإضافة تصنيف جديد من الأعلى.</p>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmationModal
                isOpen={!!productToDelete}
                onClose={() => setProductToDelete(null)}
                onConfirm={confirmDelete}
                title="تأكيد الحذف"
            >
                <p>هل أنت متأكد من حذف المنتج: <strong>{productToDelete?.name}</strong>؟ سيتم حذف جميع الصور المرتبطة به. لا يمكن التراجع عن هذا الإجراء.</p>
            </ConfirmationModal>

            <ConfirmationModal
                isOpen={!!categoryToDelete}
                onClose={() => setCategoryToDelete(null)}
                onConfirm={confirmDeleteCategory}
                title={`تأكيد حذف تصنيف "${categoryToDelete}"`}
            >
                <p>هل أنت متأكد من حذف هذا التصنيف؟</p>
                {categoryToDelete && isCategoryInUse(categoryToDelete) && (
                    <p className="mt-2 text-sm text-yellow-700 bg-yellow-100 dark:text-yellow-200 dark:bg-yellow-900/50 p-2 rounded">
                        <strong>تنبيه:</strong> هذا التصنيف مستخدم في بعض المنتجات. حذف التصنيف لن يغير تصنيف تلك المنتجات.
                    </p>
                )}
            </ConfirmationModal>
        </div>
    );
};

const DeliverySettingsManagement: React.FC<{ settings: StoreSettings; onSave: (newSettings: StoreSettings) => Promise<void> }> = ({ settings: initialSettings, onSave }) => {
    const [settings, setSettings] = useState<StoreSettings>(initialSettings);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setSettings(initialSettings);
    }, [initialSettings]);
    
    const [globalOfficeFee, setGlobalOfficeFee] = useState(300);
    const [globalHomeFee, setGlobalHomeFee] = useState(500);

    const handleApplyGlobalFees = () => {
        setSettings(prev => ({
            ...prev,
            deliveryFees: ALGERIA_DATA.map(w => ({
                wilaya: w.wilaya_name_ar,
                office: globalOfficeFee,
                home: globalHomeFee,
            }))
        }));
    };

    const handleFeeChange = (wilaya: string, type: 'office' | 'home', value: number) => {
        setSettings(prev => ({
            ...prev,
            deliveryFees: prev.deliveryFees.map(fee => 
                fee.wilaya === wilaya ? { ...fee, [type]: value } : fee
            )
        }));
    };

    const handleCompanyToggle = (companyName: string) => {
        setSettings(prev => {
            const currentCompanies = prev.deliveryCompanies || [];
            const isSelected = currentCompanies.includes(companyName);
            return {
                ...prev,
                deliveryCompanies: isSelected
                    ? currentCompanies.filter(c => c !== companyName)
                    : [...currentCompanies, companyName]
            };
        });
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            await onSave(settings);
            alert('تم حفظ إعدادات التوصيل!');
        } catch (error) {
            console.error("Error saving delivery settings: ", error);
            alert("حدث خطأ أثناء حفظ الإعدادات.");
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div className="animate-fade-in-up space-y-8">
            <h3 className="text-3xl font-bold mb-6 text-gray-700 dark:text-gray-300 border-b pb-2 border-gray-200 dark:border-slate-700">إعدادات التوصيل</h3>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md space-y-6">
                <h4 className="text-xl font-bold">شركات التوصيل المعتمدة</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-gray-50 dark:bg-slate-900/50 dark:border-slate-700 max-h-96 overflow-y-auto">
                    {ALL_DELIVERY_COMPANIES.map(company => (
                        <label key={company.name} className={`flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border-2 transition-all cursor-pointer ${(settings.deliveryCompanies?.includes(company.name)) ? 'border-primary shadow-md' : 'border-gray-200 dark:border-slate-700 hover:border-primary/50'}`}>
                            <input
                                type="checkbox"
                                checked={settings.deliveryCompanies?.includes(company.name) || false}
                                onChange={() => handleCompanyToggle(company.name)}
                                className="absolute w-0 h-0 opacity-0"
                            />
                            {company.hasRealLogo && (
                                <img src={company.logo} alt={company.name} className="w-8 h-8 object-contain"/>
                            )}
                            <span className="font-semibold text-sm flex-grow">{company.name}</span>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${settings.deliveryCompanies?.includes(company.name) ? 'bg-primary border-primary' : 'border-gray-300 dark:border-slate-600'}`}>
                                {settings.deliveryCompanies?.includes(company.name) && <CheckIcon className="w-4 h-4 text-white"/>}
                            </div>
                        </label>
                    ))}
                </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md space-y-6">
                <h4 className="text-xl font-bold">أسعار التوصيل</h4>
                <div className="p-4 border rounded-lg bg-gray-50 dark:bg-slate-900/50 dark:border-slate-700">
                    <h5 className="font-bold mb-2">تطبيق سعر موحد على كل الولايات</h5>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <input type="number" value={globalOfficeFee} onChange={e => setGlobalOfficeFee(Number(e.target.value))} placeholder="سعر المكتب" className="w-full md:w-auto p-2 border rounded focus:ring-primary focus:border-primary transition flex-1 bg-white text-gray-900 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600"/>
                        <input type="number" value={globalHomeFee} onChange={e => setGlobalHomeFee(Number(e.target.value))} placeholder="سعر المنزل" className="w-full md:w-auto p-2 border rounded focus:ring-primary focus:border-primary transition flex-1 bg-white text-gray-900 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600"/>
                        <button onClick={handleApplyGlobalFees} className="w-full md:w-auto px-4 py-2 bg-secondary text-white rounded hover:bg-opacity-90 transition-colors active:scale-95">تطبيق على الكل</button>
                    </div>
                </div>

                <div>
                     <h5 className="font-bold mb-2">أسعار التوصيل حسب الولاية (0 دج يعني مجاني)</h5>
                     <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                         {(settings.deliveryFees || []).map(({ wilaya, office, home }) => (
                             <div key={wilaya} className="grid grid-cols-3 items-center gap-4 p-2 bg-gray-50 dark:bg-slate-900/50 rounded">
                                 <span className="font-semibold">{wilaya}</span>
                                 <input type="number" value={office} onChange={e => handleFeeChange(wilaya, 'office', Number(e.target.value))} className="w-full p-2 border rounded focus:ring-primary focus:border-primary transition bg-white text-gray-900 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600" placeholder="سعر المكتب"/>
                                 <input type="number" value={home} onChange={e => handleFeeChange(wilaya, 'home', Number(e.target.value))} className="w-full p-2 border rounded focus:ring-primary focus:border-primary transition bg-white text-gray-900 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600" placeholder="سعر المنزل"/>
                             </div>
                         ))}
                     </div>
                </div>
            </div>

            <div className="text-left pt-4">
                <button onClick={handleSaveSettings} className="px-6 py-2 bg-primary text-white rounded font-bold hover:bg-opacity-90 transition-colors active:scale-95" disabled={isSaving}>
                    {isSaving ? 'جاري الحفظ...' : 'حفظ إعدادات التوصيل'}
                </button>
            </div>
        </div>
    );
};

const ThemePreview: React.FC<{ theme: ThemeColors, themeMode: 'light' | 'dark' }> = ({ theme, themeMode }) => {
    const isDark = themeMode === 'dark';
    const previewStyles = {
        '--color-primary': theme.primary,
        '--color-secondary': theme.secondary,
        '--color-accent': theme.accent,
        '--color-background': isDark ? '#1e293b' : theme.background, // Use a fixed dark bg for preview
        '--color-text': isDark ? '#e2e8f0' : theme.text,
        '--color-text-muted': isDark ? '#94a3b8' : theme.textMuted,
    } as React.CSSProperties;

    return (
        <div style={previewStyles} className={`p-4 rounded-lg border-2 ${isDark ? 'dark bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
            <h5 className="font-bold mb-3 text-center" style={{color: 'var(--color-text)'}}>{isDark ? 'الوضع الليلي' : 'الوضع النهاري'}</h5>
            <div className="space-y-3">
                <p style={{color: 'var(--color-text)'}}>نص أساسي للمعاينة</p>
                <p style={{color: 'var(--color-text-muted)'}} className="text-sm">نص ثانوي باهت للمعاينة</p>
                <button className="px-4 py-2 rounded text-white font-semibold w-full" style={{backgroundColor: 'var(--color-primary)'}}>زر أساسي</button>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-white text-xs" style={{backgroundColor: 'var(--color-secondary)'}}>
                        وسم ثانوي
                    </span>
                    <span style={{color: 'var(--color-accent)'}} className="font-bold text-sm">نص مميز</span>
                </div>
            </div>
        </div>
    );
}

const SettingsManagement: React.FC<{ settings: StoreSettings }> = ({ settings: initialSettings }) => {
    const [settings, setSettings] = useState<StoreSettings>(initialSettings);
    const [newAdminPassword, setNewAdminPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setSettings(initialSettings);
    }, [initialSettings]);
    
    const inputStyle = "w-full p-2 border rounded focus:ring-2 focus:ring-primary/80 focus:border-primary focus:shadow-lg focus:shadow-primary/20 transition-all bg-white text-gray-900 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600";


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            contactInfo: { ...prev.contactInfo, [name]: value }
        }));
    };
    
    const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            theme: { ...prev.theme, [name]: value }
        }));
    };

    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files && e.target.files[0]) {
            try {
                const resizedLogo = await resizeImage(e.target.files[0], 200, 200);
                setSettings(prev => ({...prev, logo: resizedLogo}));
            } catch (error) {
                console.error("Error processing logo:", error);
                alert('حدث خطأ أثناء معالجة الشعار.');
            }
        }
    };
    
    const handleSave = async () => {
        setIsSaving(true);
        try {
            let settingsToSave = { ...settings };
            if (newAdminPassword) {
                settingsToSave.adminPassword = newAdminPassword;
            }
    
            // We only save settings that are part of this component.
            // Other settings like delivery and categories are saved in their own sections.
            const { deliveryFees, deliveryCompanies, managedCategories, ...mainSettings } = settingsToSave;
            
            // Using `mainSettings` ensures we only update the relevant fields for this section.
            // Using `{ merge: true }` prevents overwriting fields managed by other sections.
            await setDoc(doc(db, "store", "settings"), mainSettings, { merge: true });
    
            alert('تم حفظ الإعدادات!');
            setNewAdminPassword('');
        } catch (error) {
            console.error("Error saving settings: ", error);
            alert("حدث خطأ أثناء حفظ الإعدادات.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in-up">
            <h3 className="text-3xl font-bold mb-6 text-gray-700 dark:text-gray-300 border-b pb-2 border-gray-200 dark:border-slate-700">إعدادات المتجر</h3>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md space-y-6">
                <h4 className="text-xl font-bold">الإعدادات الأساسية</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block font-semibold mb-1">اسم المتجر</label>
                        <input type="text" name="storeName" value={settings.storeName} onChange={handleChange} className={inputStyle}/>
                    </div>
                    <div>
                        <label className="block font-semibold mb-1">شعار المتجر (اللوجو)</label>
                        <input type="file" accept="image/*" onChange={handleLogoChange} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                        {settings.logo && <img src={settings.logo} alt="logo" className="w-16 h-16 mt-2 rounded-full object-cover"/>}
                    </div>
                    <div className="md:col-span-2">
                        <label className="block font-semibold mb-1">عن المتجر (يظهر في الأسفل)</label>
                        <textarea name="storeDescription" value={settings.storeDescription} onChange={handleChange} rows={3} className={inputStyle} placeholder="اكتب وصفًا موجزًا عن متجرك..."></textarea>
                    </div>
                </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md space-y-6">
                <h4 className="font-bold">إعدادات حساب المدير</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block font-semibold mb-1">اسم مستخدم المدير</label>
                        <input type="text" name="adminUsername" value={settings.adminUsername} onChange={handleChange} className={inputStyle}/>
                    </div>
                    <div>
                        <label className="block font-semibold mb-1">كلمة سر المدير الجديدة</label>
                        <input type="password" value={newAdminPassword} onChange={(e) => setNewAdminPassword(e.target.value)} placeholder="اتركها فارغة لعدم التغيير" className={inputStyle}/>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md space-y-6">
                <h4 className="font-bold">معلومات التواصل</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <input type="tel" name="phone" placeholder="الهاتف" value={settings.contactInfo.phone} onChange={handleContactChange} className={inputStyle}/>
                     <input type="email" name="email" placeholder="البريد الإلكتروني" value={settings.contactInfo.email} onChange={handleContactChange} className={inputStyle}/>
                     <input type="text" name="facebook" placeholder="رابط فيسبوك" value={settings.contactInfo.facebook} onChange={handleContactChange} className={inputStyle}/>
                     <input type="text" name="instagram" placeholder="رابط انستغرام" value={settings.contactInfo.instagram} onChange={handleContactChange} className={inputStyle}/>
                     <input type="text" name="whatsapp" placeholder="رابط واتساب" value={settings.contactInfo.whatsapp} onChange={handleContactChange} className={inputStyle}/>
                </div>
            </div>
            
             <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md space-y-6">
                 <h4 className="font-bold text-xl">ألوان الموقع</h4>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                     {/* Color Inputs */}
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(settings.theme).map(([key, value]) => (
                            <div key={key}>
                                <label className="capitalize text-sm font-medium dark:text-slate-300">{key}</label>
                                <div className="flex items-center border rounded dark:border-slate-600 focus-within:ring-2 focus-within:ring-primary overflow-hidden">
                                    <input type="color" name={key} value={value} onChange={handleThemeChange} className="w-10 h-10 p-0 bg-transparent border-0 cursor-pointer"/>
                                    <input type="text" name={key} value={value} onChange={handleThemeChange} className="w-full p-2 bg-transparent focus:outline-none"/>
                                </div>
                            </div>
                        ))}
                     </div>
                     {/* Preview */}
                     <div className="space-y-4 bg-gray-50 dark:bg-slate-900/50 p-4 rounded-lg">
                         <h5 className="font-bold text-center">معاينة حية</h5>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <ThemePreview theme={settings.theme} themeMode="light" />
                            <ThemePreview theme={settings.theme} themeMode="dark" />
                         </div>
                     </div>
                 </div>
            </div>

            <div className="text-left pt-4">
                <button onClick={handleSave} className="px-6 py-2 bg-primary text-white rounded font-bold hover:bg-opacity-90 transition-colors active:scale-95" disabled={isSaving}>
                    {isSaving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                </button>
            </div>
        </div>
    );
};

export const AdminDashboard = () => {
    const { state, dispatch } = useContext(StoreContext);
    const [activeView, setActiveView] = useState('overview');

    const handleSaveSettings = async (newSettings: StoreSettings) => {
        await setDoc(doc(db, "store", "settings"), newSettings, { merge: true });
    };
    
    const goToCustomer = () => dispatch({ type: 'SET_VIEW_MODE', payload: ViewMode.CUSTOMER });
    const logout = () => {
        if (window.confirm('هل أنت متأكد من تسجيل الخروج؟')) {
            dispatch({ type: 'LOGOUT' });
        }
    };

    const menuItems = [
        { id: 'overview', label: 'نظرة عامة', icon: <ChartPieIcon className="w-6 h-6" /> },
        { id: 'orders', label: 'الطلبات', count: state.orders.length, icon: <ClipboardDocumentListIcon className="w-6 h-6" /> },
        { id: 'products', label: 'المنتجات والتصنيفات', count: state.products.length, icon: <TagIcon className="w-6 h-6" /> },
        { id: 'delivery', label: 'إعدادات التوصيل', icon: <TruckIcon className="w-6 h-6" /> },
        { id: 'settings', label: 'الإعدادات العامة', icon: <Cog6ToothIcon className="w-6 h-6" /> },
    ];

    const renderContent = () => {
        switch (activeView) {
            case 'overview':
                return <DashboardOverview orders={state.orders} products={state.products} />;
            case 'orders':
                return <OrdersManagement orders={state.orders} />;
            case 'products':
                return <ProductsAndCategoriesManagement products={state.products} />;
            case 'delivery':
                return <DeliverySettingsManagement settings={state.settings} onSave={handleSaveSettings} />;
            case 'settings':
                return <SettingsManagement settings={state.settings} />;
            default:
                return null;
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-text-base dark:text-gray-200 transition-colors duration-300">
            {/* Sidebar */}
            <aside className="w-72 bg-white dark:bg-slate-800 shadow-lg flex-shrink-0 p-4 flex flex-col">
                <nav className="space-y-2 flex-grow">
                    {menuItems.map(item => (
                        <button 
                            key={item.id}
                            onClick={() => setActiveView(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-right font-semibold transition-all duration-200 ${
                                activeView === item.id 
                                ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                                : 'text-text-muted dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-text-base dark:hover:text-slate-200'
                            }`}
                        >
                            {item.icon}
                            <span>{item.label}</span>
                            {item.count !== undefined && (
                                <span className={`mr-auto text-xs font-bold px-2 py-0.5 rounded-full ${
                                    activeView === item.id ? 'bg-white/20' : 'bg-gray-200 text-gray-700 dark:bg-slate-600 dark:text-slate-200'
                                }`}>
                                    {item.count}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
                <div className="mt-auto pt-4 border-t border-gray-200 dark:border-slate-700 space-y-2">
                    <button 
                        onClick={goToCustomer}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-right font-semibold transition-colors text-text-muted dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 hover:text-text-base dark:hover:text-slate-200"
                    >
                        <UserCircleIcon className="w-6 h-6" />
                        <span>عرض المتجر</span>
                    </button>
                    <button 
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-right font-semibold transition-colors text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600"
                    >
                        <LogoutIcon className="w-6 h-6" />
                        <span>تسجيل الخروج</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-10 overflow-y-auto bg-gray-50/50 dark:bg-slate-900">
                {renderContent()}
            </main>
        </div>
    );
};