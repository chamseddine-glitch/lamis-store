
import React, { useState, useContext, useEffect } from 'react';
import { StoreContext } from '../context/StoreContext';
import type { Order, Product, ProductOption, StoreSettings } from '../types';
import { OrderStatus } from '../types';
import { TrashIcon, PencilIcon, ArchiveBoxIcon, ClipboardDocumentListIcon, XMarkIcon, DragHandleIcon } from './icons';
import { db } from '../firebase';
import { collection, doc, addDoc, setDoc, deleteDoc, updateDoc, writeBatch } from 'firebase/firestore';

const ConfirmationModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md animate-fade-in-up">
                <h3 className="text-xl font-bold mb-4">{title}</h3>
                <div className="text-text-muted mb-6">{children}</div>
                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors active:scale-95">إلغاء</button>
                    <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors active:scale-95">تأكيد الحذف</button>
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

    const handleDelete = (order: Order) => {
        setOrderToDelete(order);
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
            <div className="text-center py-16">
                <ClipboardDocumentListIcon className="w-16 h-16 mx-auto text-gray-400" />
                <h3 className="mt-4 text-xl font-semibold text-text-base">لا توجد طلبات بعد</h3>
                <p className="text-text-muted">عندما يقوم زبون بتقديم طلب، سيظهر هنا.</p>
            </div>
        )
    }

    return (
        <>
            <div className="bg-white p-6 rounded-lg shadow-md animate-fade-in-up">
                <h3 className="text-xl font-bold mb-4">إدارة الطلبات</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3">رقم الطلب</th>
                                <th className="p-3">الزبون</th>
                                <th className="p-3">الهاتف</th>
                                <th className="p-3">الإجمالي</th>
                                <th className="p-3">تاريخ الطلب</th>
                                <th className="p-3">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id} className="border-b">
                                    <td className="p-3 font-mono text-xs" title={order.id}>{order.id.substring(0, 8)}...</td>
                                    <td className="p-3">{order.customerName}</td>
                                    <td className="p-3">{order.customerPhone}</td>
                                    <td className="p-3">{order.totalPrice.toLocaleString('ar-DZ')} د.ج</td>
                                    <td className="p-3">{new Date(order.createdAt).toLocaleDateString('ar-DZ')}</td>
                                    <td className="p-3 flex items-center gap-2">
                                        <select 
                                            value={order.status} 
                                            onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                            className="p-1 border rounded focus:ring-primary focus:border-primary transition w-32"
                                        >
                                            {Object.values(OrderStatus).map(status => (
                                                <option key={status} value={status}>{status}</option>
                                            ))}
                                        </select>
                                        <button onClick={() => handleDelete(order)} className="text-red-600 p-2 hover:bg-red-100 rounded-full transition-colors" aria-label="حذف الطلب">
                                            <TrashIcon className="w-5 h-5"/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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

        // Using jpeg for better compression
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      // FIX: Reject with a new Error object for better error handling and to resolve potential type issues with the error event.
      img.onerror = (error) => reject(new Error('Image failed to load.'));
    };
    // FIX: Reject with a new Error object for better error handling and to resolve potential type issues with the error event.
    reader.onerror = (error) => reject(new Error('An error occurred while reading the file.'));
  });
};


const ProductForm: React.FC<{ product?: Product; onSave: () => void; onCancel: () => void; }> = ({ product, onSave, onCancel }) => {
    const { state } = useContext(StoreContext);
    const [formData, setFormData] = useState<Product>(product || { id: '', name: '', description: '', price: 0, category: '', images: [], options: [] });
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'price' ? Number(value) : value }));
    };
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            // Resize images before converting to base64
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
            
            if (product?.id) {
                // Update existing product
                const { id, ...dataToUpdate } = finalProductData;
                await setDoc(doc(db, 'products', product.id), dataToUpdate);
            } else {
                // Add new product
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
        <form onSubmit={handleSubmit} className="space-y-4 bg-gray-50 p-6 rounded-lg border animate-fade-in-up">
            <input type="text" name="name" placeholder="اسم المنتج" value={formData.name} onChange={handleChange} className="w-full p-2 border rounded focus:ring-primary focus:border-primary transition" required />
            <textarea name="description" placeholder="وصف المنتج" value={formData.description} onChange={handleChange} className="w-full p-2 border rounded focus:ring-primary focus:border-primary transition" required />
            <div className="grid grid-cols-2 gap-4">
                <input type="number" name="price" placeholder="السعر" value={formData.price} onChange={handleChange} className="w-full p-2 border rounded focus:ring-primary focus:border-primary transition" required />
                <div>
                    <input 
                        list="categories-list"
                        type="text" 
                        name="category" 
                        placeholder="التصنيف" 
                        value={formData.category} 
                        onChange={handleChange} 
                        className="w-full p-2 border rounded focus:ring-primary focus:border-primary transition" 
                        required 
                    />
                     <datalist id="categories-list">
                        {state.categories.filter(c => c !== 'الكل').map(cat => <option key={cat} value={cat} />)}
                    </datalist>
                </div>
            </div>
            <div>
                 <label className="block text-sm font-medium text-gray-700">صور المنتج</label>
                 <input type="file" multiple onChange={handleImageChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                 <div className="flex gap-2 mt-2 flex-wrap min-h-[5rem] bg-gray-100 p-2 rounded-md border">
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
            
            <div className="border-t pt-4 space-y-3">
                <h4 className="font-semibold text-gray-800">خيارات المنتج (مثل اللون، الحجم، السعة)</h4>
                {formData.options.map((option, optionIndex) => (
                    <div key={option.id} className="p-3 bg-gray-100 rounded border space-y-2">
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                placeholder="اسم الخيار (مثال: الحجم)"
                                value={option.name}
                                onChange={(e) => handleOptionNameChange(optionIndex, e.target.value)}
                                className="flex-grow p-2 border rounded focus:ring-primary focus:border-primary transition"
                            />
                            <button type="button" onClick={() => removeOption(optionIndex)} className="text-red-500 p-2 hover:bg-red-100 rounded-full">
                                <TrashIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div>
                            <input
                                type="text"
                                placeholder="أضف قيمة واضغط Enter (مثال: XL)"
                                onKeyDown={(e) => handleOptionValueAdd(optionIndex, e)}
                                className="w-full p-2 border rounded focus:ring-primary focus:border-primary transition"
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
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors active:scale-95" disabled={isSubmitting}>إلغاء</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90 transition-colors active:scale-95" disabled={isSubmitting}>
                    {isSubmitting ? 'جاري الحفظ...' : 'حفظ المنتج'}
                </button>
            </div>
        </form>
    );
}

const ProductsManagement: React.FC<{ products: Product[] }> = ({ products }) => {
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);

    const handleSave = () => {
        setIsFormVisible(false);
        setEditingProduct(undefined);
    };
    
    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsFormVisible(true);
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
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">إدارة المنتجات</h3>
                <button onClick={() => { setEditingProduct(undefined); setIsFormVisible(!isFormVisible); }} className="px-4 py-2 bg-secondary text-white rounded hover:bg-opacity-90 transition-colors active:scale-95">
                    {isFormVisible ? 'إغلاق النموذج' : 'إضافة منتج جديد'}
                </button>
            </div>
            {isFormVisible && <ProductForm product={editingProduct} onSave={handleSave} onCancel={() => setIsFormVisible(false)} />}
            
            <div className="space-y-2">
                {products.length === 0 && !isFormVisible && (
                     <div className="text-center py-16">
                        <ArchiveBoxIcon className="w-16 h-16 mx-auto text-gray-400" />
                        <h3 className="mt-4 text-xl font-semibold text-text-base">لا توجد منتجات</h3>
                        <p className="text-text-muted">ابدأ بإضافة منتجك الأول من الزر أعلاه.</p>
                    </div>
                )}
                {products.map(product => (
                    <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded hover:shadow-sm transition-shadow">
                        <div className="flex items-center gap-4">
                            <img src={product.images[0]} className="w-12 h-12 object-cover rounded"/>
                            <div>
                                <span className="font-semibold">{product.name}</span>
                                <p className="text-xs text-gray-500">{product.category}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => handleEdit(product)} className="text-blue-600 p-2 hover:bg-blue-100 rounded-full transition-colors"><PencilIcon className="w-5 h-5"/></button>
                            <button onClick={() => handleDelete(product)} className="text-red-600 p-2 hover:bg-red-100 rounded-full transition-colors"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                    </div>
                ))}
            </div>
            <ConfirmationModal
                isOpen={!!productToDelete}
                onClose={() => setProductToDelete(null)}
                onConfirm={confirmDelete}
                title="تأكيد الحذف"
            >
                <p>هل أنت متأكد من حذف المنتج: <strong>{productToDelete?.name}</strong>؟ سيتم حذف جميع الصور المرتبطة به. لا يمكن التراجع عن هذا الإجراء.</p>
            </ConfirmationModal>
        </div>
    );
};

const CategoriesManagement: React.FC<{ categories: string[], products: Product[] }> = ({ categories, products }) => {
    // This component now primarily displays categories derived from products.
    // Management could be done by editing product categories.
    // For simplicity, we'll keep it as a viewer.
    // A more advanced implementation could have a separate 'categories' collection in Firestore.
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">التصنيفات الحالية</h3>
            <div className="flex flex-wrap gap-3">
                {categories.filter(c => c !== 'الكل').map(category => (
                    <span key={category} className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full font-semibold">
                        {category} ({products.filter(p => p.category === category).length})
                    </span>
                ))}
                 {categories.length <= 1 && ( // Only 'الكل'
                    <div className="text-center py-10 w-full">
                        <p className="text-text-muted">لا توجد تصنيفات. قم بإضافة تصنيف عند إضافة أو تعديل منتج.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const SettingsManagement: React.FC<{ settings: StoreSettings }> = ({ settings: initialSettings }) => {
    const [settings, setSettings] = useState<StoreSettings>(initialSettings);
    const [newAdminPassword, setNewAdminPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setSettings(initialSettings);
    }, [initialSettings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const numValue = (name === 'deliveryFeeOffice' || name === 'deliveryFeeHome') ? Number(value) : value;
        setSettings(prev => ({ ...prev, [name]: numValue }));
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
                const resizedLogo = await resizeImage(e.target.files[0], 200, 200); // Resize logo
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
            let finalSettings = { ...settings };
            if (newAdminPassword) {
                finalSettings.adminPassword = newAdminPassword;
            }

            await setDoc(doc(db, "store", "settings"), finalSettings);

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
        <div className="bg-white p-6 rounded-lg shadow-md space-y-6 animate-fade-in-up">
            <h3 className="text-xl font-bold">إعدادات المتجر</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block font-semibold mb-1">اسم المتجر</label>
                    <input type="text" name="storeName" value={settings.storeName} onChange={handleChange} className="w-full p-2 border rounded focus:ring-primary focus:border-primary transition"/>
                </div>
                <div>
                    <label className="block font-semibold mb-1">شعار المتجر (اللوجو)</label>
                    <input type="file" accept="image/*" onChange={handleLogoChange} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                    {settings.logo && <img src={settings.logo} alt="logo" className="w-16 h-16 mt-2 rounded-full object-cover"/>}
                </div>
                <div className="md:col-span-2">
                    <label className="block font-semibold mb-1">عن المتجر (يظهر في الأسفل)</label>
                    <textarea name="storeDescription" value={settings.storeDescription} onChange={handleChange} rows={3} className="w-full p-2 border rounded focus:ring-primary focus:border-primary transition" placeholder="اكتب وصفًا موجزًا عن متجرك..."></textarea>
                </div>
                <div>
                    <label className="block font-semibold mb-1">سعر التوصيل للمكتب</label>
                    <input type="number" name="deliveryFeeOffice" value={settings.deliveryFeeOffice} onChange={handleChange} className="w-full p-2 border rounded focus:ring-primary focus:border-primary transition"/>
                </div>
                 <div>
                    <label className="block font-semibold mb-1">سعر التوصيل للمنزل</label>
                    <input type="number" name="deliveryFeeHome" value={settings.deliveryFeeHome} onChange={handleChange} className="w-full p-2 border rounded focus:ring-primary focus:border-primary transition"/>
                </div>
            </div>

            <div className="border-t pt-6">
                <h4 className="font-bold mb-4">إعدادات حساب المدير</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block font-semibold mb-1">اسم مستخدم المدير</label>
                        <input type="text" name="adminUsername" value={settings.adminUsername} onChange={handleChange} className="w-full p-2 border rounded focus:ring-primary focus:border-primary transition"/>
                    </div>
                    <div>
                        <label className="block font-semibold mb-1">كلمة سر المدير الجديدة</label>
                        <input type="password" value={newAdminPassword} onChange={(e) => setNewAdminPassword(e.target.value)} placeholder="اتركها فارغة لعدم التغيير" className="w-full p-2 border rounded focus:ring-primary focus:border-primary transition"/>
                    </div>
                </div>
            </div>

            <div className="border-t pt-6">
                <h4 className="font-bold mb-4">معلومات التواصل</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <input type="tel" name="phone" placeholder="الهاتف" value={settings.contactInfo.phone} onChange={handleContactChange} className="p-2 border rounded focus:ring-primary focus:border-primary transition"/>
                     <input type="email" name="email" placeholder="البريد الإلكتروني" value={settings.contactInfo.email} onChange={handleContactChange} className="p-2 border rounded focus:ring-primary focus:border-primary transition"/>
                     <input type="text" name="facebook" placeholder="رابط فيسبوك" value={settings.contactInfo.facebook} onChange={handleContactChange} className="p-2 border rounded focus:ring-primary focus:border-primary transition"/>
                     <input type="text" name="instagram" placeholder="رابط انستغرام" value={settings.contactInfo.instagram} onChange={handleContactChange} className="p-2 border rounded focus:ring-primary focus:border-primary transition"/>
                     <input type="text" name="whatsapp" placeholder="رابط واتساب" value={settings.contactInfo.whatsapp} onChange={handleContactChange} className="p-2 border rounded focus:ring-primary focus:border-primary transition"/>
                </div>
            </div>
            
            <div className="border-t pt-6">
                 <h4 className="font-bold mb-4">ألوان الموقع</h4>
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {Object.entries(settings.theme).map(([key, value]) => (
                        <div key={key}>
                            <label className="capitalize text-sm font-medium">{key}</label>
                            <input type="color" name={key} value={value} onChange={handleThemeChange} className="w-full h-10 p-1 border rounded cursor-pointer"/>
                        </div>
                    ))}
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

const ProductsAndCategoriesManagement = ({ products, categories }: { products: Product[], categories: string[] }) => {
    return (
        <div className="space-y-8 animate-fade-in-up">
            <ProductsManagement products={products} />
            <CategoriesManagement categories={categories} products={products} />
        </div>
    );
};


export const AdminDashboard = () => {
    const { state } = useContext(StoreContext);
    const [activeTab, setActiveTab] = useState('orders');

    const renderContent = () => {
        switch (activeTab) {
            case 'orders':
                return <OrdersManagement orders={state.orders} />;
            case 'productsAndCategories':
                return <ProductsAndCategoriesManagement products={state.products} categories={state.categories} />;
            case 'settings':
                return <SettingsManagement settings={state.settings} />;
            default:
                return null;
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-3xl font-bold mb-6 animate-fade-in-up">لوحة التحكم</h2>
            <div className="flex border-b mb-6 animate-fade-in-up flex-wrap" style={{ animationDelay: '0.1s' }}>
                <button onClick={() => setActiveTab('orders')} className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'orders' ? 'border-b-2 border-primary text-primary' : 'text-text-muted hover:text-text-base'}`}>الطلبات ({state.orders.length})</button>
                <button onClick={() => setActiveTab('productsAndCategories')} className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'productsAndCategories' ? 'border-b-2 border-primary text-primary' : 'text-text-muted hover:text-text-base'}`}>المنتجات والفئات ({state.products.length})</button>
                <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 font-semibold transition-colors ${activeTab === 'settings' ? 'border-b-2 border-primary text-primary' : 'text-text-muted hover:text-text-base'}`}>الإعدادات</button>
            </div>
            <div key={activeTab}>
                {renderContent()}
            </div>
        </div>
    );
};
