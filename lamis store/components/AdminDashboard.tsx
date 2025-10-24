import React, { useState, useContext, useEffect } from 'react';
import { StoreContext } from '../context/StoreContext';
import type { Order, Product, ProductOption, StoreSettings } from '../types';
import { OrderStatus } from '../types';
import { TrashIcon, PencilIcon, ArchiveBoxIcon, ClipboardDocumentListIcon, XMarkIcon, DragHandleIcon } from './icons';

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


const OrdersManagement: React.FC<{ orders: Order[] }> = ({ orders }) => {
    const { dispatch } = useContext(StoreContext);
    const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null);
    const [dropTargetId, setDropTargetId] = useState<string | null>(null);
    const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

    const handleStatusChange = (orderId: string, status: OrderStatus) => {
        dispatch({ type: 'UPDATE_ORDER_STATUS', payload: { orderId, status } });
    };

    const handleDelete = (orderId: string) => {
        const order = orders.find(o => o.id === orderId);
        if (order) {
            setOrderToDelete(order);
        }
    };
    
    const confirmDelete = () => {
        if (orderToDelete) {
            dispatch({ type: 'DELETE_ORDER', payload: orderToDelete.id });
            setOrderToDelete(null);
        }
    };

    const handleDragStart = (orderId: string) => {
        setDraggedOrderId(orderId);
    };

    const handleDragOver = (e: React.DragEvent, orderId: string) => {
        e.preventDefault();
        if (orderId !== dropTargetId) {
            setDropTargetId(orderId);
        }
    };

    const handleDragLeave = () => {
        setDropTargetId(null);
    };

    const handleDrop = (targetOrderId: string) => {
        if (!draggedOrderId || draggedOrderId === targetOrderId) return;

        const dragIndex = orders.findIndex(o => o.id === draggedOrderId);
        const dropIndex = orders.findIndex(o => o.id === targetOrderId);

        if (dragIndex === -1 || dropIndex === -1) return;

        let newOrders = [...orders];
        const [draggedItem] = newOrders.splice(dragIndex, 1);
        newOrders.splice(dropIndex, 0, draggedItem);

        dispatch({ type: 'REORDER_ORDERS', payload: newOrders });

        setDraggedOrderId(null);
        setDropTargetId(null);
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
                                <th className="p-3 w-10"></th>
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
                                <tr 
                                    key={order.id} 
                                    draggable
                                    onDragStart={() => handleDragStart(order.id)}
                                    onDragOver={(e) => handleDragOver(e, order.id)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={() => handleDrop(order.id)}
                                    className={`border-b transition-all duration-200 ${
                                        draggedOrderId === order.id ? 'opacity-50 bg-blue-100' : ''
                                    } ${
                                        dropTargetId === order.id ? 'border-t-2 border-primary' : ''
                                    }`}
                                >
                                    <td className="p-2 text-center align-middle cursor-grab active:cursor-grabbing">
                                        <DragHandleIcon className="w-5 h-5 text-gray-400 inline-block"/>
                                    </td>
                                    <td className="p-3 font-mono text-xs">{order.id.split('-')[0]}...</td>
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
                                        <button onClick={() => handleDelete(order.id)} className="text-red-600 p-2 hover:bg-red-100 rounded-full transition-colors" aria-label="حذف الطلب">
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


const ProductForm: React.FC<{ product?: Product; onSave: (product: Product) => void; onCancel: () => void; }> = ({ product, onSave, onCancel }) => {
    const { state } = useContext(StoreContext);
    const [formData, setFormData] = useState<Product>(product || { id: '', name: '', description: '', price: 0, category: '', images: [], options: [] });
    const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'price' ? Number(value) : value }));
    };
    
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const imagePromises = files.map((file: File) => {
                return new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        if (event.target && typeof event.target.result === 'string') {
                            resolve(event.target.result);
                        } else {
                            reject(new Error('فشل في قراءة الملف'));
                        }
                    };
                    reader.onerror = reject;
                    reader.readAsDataURL(file);
                });
            });

            Promise.all(imagePromises)
                .then(base64Images => {
                    setFormData(prev => ({ ...prev, images: [...prev.images, ...base64Images] }));
                })
                .catch(error => console.error("خطأ في قراءة الصور:", error));
        }
    };

    const handleRemoveImage = (indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove)
        }));
    };

    const handleImageDragStart = (index: number) => {
        setDraggedImageIndex(index);
    };

    const handleImageDrop = (targetIndex: number) => {
        if (draggedImageIndex === null || draggedImageIndex === targetIndex) {
            setDraggedImageIndex(null);
            return;
        };

        const newImages = [...formData.images];
        const [draggedImage] = newImages.splice(draggedImageIndex, 1);
        newImages.splice(targetIndex, 0, draggedImage);

        setFormData(prev => ({ ...prev, images: newImages }));
        setDraggedImageIndex(null);
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
            e.currentTarget.value = ''; // Clear input
        }
    };

    const removeOptionValue = (optionIndex: number, valueIndex: number) => {
        const newOptions = [...formData.options];
        newOptions[optionIndex].values = newOptions[optionIndex].values.filter((_, i) => i !== valueIndex);
        setFormData(prev => ({ ...prev, options: newOptions }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ ...formData, id: formData.id || `prod-${Date.now()}` });
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
                        {state.categories.map(cat => <option key={cat} value={cat} />)}
                    </datalist>
                </div>
            </div>
            <div>
                 <label className="block text-sm font-medium text-gray-700">صور المنتج</label>
                 <input type="file" multiple onChange={handleImageChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                 <p className="text-xs text-gray-500 mt-1">الصورة الأولى هي الصورة الرئيسية للمنتج. يمكنك سحب الصور لإعادة ترتيبها.</p>
                 <div className="flex gap-2 mt-2 flex-wrap min-h-[5rem] bg-gray-100 p-2 rounded-md border">
                    {formData.images.map((img, i) => (
                        <div 
                            key={`${i}-${img.substring(0,20)}`}
                            draggable
                            onDragStart={() => handleImageDragStart(i)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleImageDrop(i)}
                            className={`relative w-20 h-20 rounded shadow-sm group cursor-grab active:cursor-grabbing transition-opacity ${draggedImageIndex === i ? 'opacity-30' : 'opacity-100'}`}
                        >
                            <img src={img} className="w-full h-full rounded object-cover" alt={`Product image ${i+1}`} />
                            <button 
                                type="button" 
                                onClick={() => handleRemoveImage(i)}
                                className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                                aria-label="حذف الصورة"
                            >
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
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors active:scale-95">إلغاء</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded hover:bg-opacity-90 transition-colors active:scale-95">حفظ المنتج</button>
            </div>
        </form>
    );
}

const ProductsManagement: React.FC<{ products: Product[] }> = ({ products }) => {
    const { dispatch } = useContext(StoreContext);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
    const [productToDelete, setProductToDelete] = useState<Product | null>(null);

    const handleSave = (product: Product) => {
        if (editingProduct) {
            dispatch({ type: 'UPDATE_PRODUCT', payload: product });
        } else {
            dispatch({ type: 'ADD_PRODUCT', payload: product });
        }
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

    const confirmDelete = () => {
        if (productToDelete) {
            dispatch({ type: 'DELETE_PRODUCT', payload: productToDelete.id });
            setProductToDelete(null);
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
                <p>هل أنت متأكد من حذف المنتج: <strong>{productToDelete?.name}</strong>؟ لا يمكن التراجع عن هذا الإجراء.</p>
            </ConfirmationModal>
        </div>
    );
};

const CategoriesManagement: React.FC<{ categories: string[] }> = ({ categories }) => {
    const { dispatch } = useContext(StoreContext);
    const [newCategory, setNewCategory] = useState('');
    const [editingCategory, setEditingCategory] = useState<{ old: string; new: string } | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

    const handleAddCategory = (e: React.FormEvent) => {
        e.preventDefault();
        if (newCategory.trim()) {
            dispatch({ type: 'ADD_CATEGORY', payload: newCategory.trim() });
            setNewCategory('');
        }
    };

    const handleDeleteCategory = (category: string) => {
        setCategoryToDelete(category);
    };

    const confirmDeleteCategory = () => {
        if (categoryToDelete) {
            dispatch({ type: 'DELETE_CATEGORY', payload: categoryToDelete });
            setCategoryToDelete(null);
        }
    };

    const handleUpdateCategory = () => {
        if (editingCategory && editingCategory.new.trim() && editingCategory.old !== editingCategory.new.trim()) {
            dispatch({ type: 'UPDATE_CATEGORY', payload: { oldCategory: editingCategory.old, newCategory: editingCategory.new.trim() } });
        }
        setEditingCategory(null);
    };
    
    const startEditing = (category: string) => {
        setEditingCategory({ old: category, new: category });
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold mb-4">إدارة التصنيفات</h3>
            <form onSubmit={handleAddCategory} className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="اسم التصنيف الجديد"
                    className="flex-grow p-2 border rounded focus:ring-primary focus:border-primary transition"
                />
                <button type="submit" className="px-4 py-2 bg-secondary text-white rounded hover:bg-opacity-90 transition-colors active:scale-95">
                    إضافة
                </button>
            </form>
            <div className="space-y-2">
                {categories.map(category => (
                    <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded hover:shadow-sm transition-shadow">
                        {editingCategory?.old === category ? (
                            <input
                                type="text"
                                value={editingCategory.new}
                                onChange={(e) => setEditingCategory({ ...editingCategory, new: e.target.value })}
                                onBlur={handleUpdateCategory}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleUpdateCategory(); } else if (e.key === 'Escape') { setEditingCategory(null); }}}
                                className="p-1 border rounded w-full"
                                autoFocus
                            />
                        ) : (
                            <span className="font-semibold">{category}</span>
                        )}
                        <div className="flex items-center gap-2">
                           {editingCategory?.old !== category && (
                                <>
                                    <button onClick={() => startEditing(category)} className="text-blue-600 p-2 hover:bg-blue-100 rounded-full transition-colors"><PencilIcon className="w-5 h-5"/></button>
                                    <button onClick={() => handleDeleteCategory(category)} className="text-red-600 p-2 hover:bg-red-100 rounded-full transition-colors"><TrashIcon className="w-5 h-5"/></button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
                 {categories.length === 0 && (
                    <div className="text-center py-10">
                        <p className="text-text-muted">لا توجد تصنيفات. ابدأ بإضافة تصنيفك الأول.</p>
                    </div>
                )}
            </div>
            <ConfirmationModal
                isOpen={!!categoryToDelete}
                onClose={() => setCategoryToDelete(null)}
                onConfirm={confirmDeleteCategory}
                title="تأكيد حذف التصنيف"
            >
                <p>هل أنت متأكد من حذف التصنيف: <strong>{categoryToDelete}</strong>؟ سيتم نقل المنتجات في هذا التصنيف إلى "غير مصنف".</p>
            </ConfirmationModal>
        </div>
    );
};

const SettingsManagement: React.FC<{ settings: StoreSettings }> = ({ settings: initialSettings }) => {
    const { dispatch } = useContext(StoreContext);
    const [settings, setSettings] = useState<StoreSettings>(initialSettings);
    const [newAdminPassword, setNewAdminPassword] = useState('');

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

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target && typeof event.target.result === 'string') {
                    setSettings(prev => ({...prev, logo: event.target.result as string}));
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const handleSave = () => {
        const payload = { ...settings };
        if (newAdminPassword) {
            payload.adminPassword = newAdminPassword;
        }
        dispatch({ type: 'UPDATE_SETTINGS', payload });
        alert('تم حفظ الإعدادات!');
        setNewAdminPassword(''); // Clear field after save
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
                <button onClick={handleSave} className="px-6 py-2 bg-primary text-white rounded font-bold hover:bg-opacity-90 transition-colors active:scale-95">حفظ الإعدادات</button>
            </div>
        </div>
    );
};

const ProductsAndCategoriesManagement = ({ products, categories }: { products: Product[], categories: string[] }) => {
    return (
        <div className="space-y-8 animate-fade-in-up">
            <ProductsManagement products={products} />
            <CategoriesManagement categories={categories} />
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
