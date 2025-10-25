import React, { useState, useEffect } from 'react';
import type { StoreSettings, ThemeColors } from '../types';

const InputField: React.FC<{ label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void; type?: string; placeholder?: string; isTextArea?: boolean }> = ({ label, name, value, onChange, type = 'text', placeholder, isTextArea = false }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{label}</label>
        {isTextArea ? (
            <textarea id={name} name={name} value={value} onChange={onChange} placeholder={placeholder || label} rows={3} className="w-full p-2 border rounded focus:ring-2 focus:ring-primary/80 focus:border-primary focus:shadow-lg focus:shadow-primary/20 transition-all bg-white text-gray-900 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600" />
        ) : (
            <input id={name} type={type} name={name} value={value} onChange={onChange} placeholder={placeholder || label} className="w-full p-2 border rounded focus:ring-2 focus:ring-primary/80 focus:border-primary focus:shadow-lg focus:shadow-primary/20 transition-all bg-white text-gray-900 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600" />
        )}
    </div>
);

const ColorPicker: React.FC<{ label: string; name: string; value: string; onChange: (name: string, value: string) => void }> = ({ label, name, value, onChange }) => (
    <div className="flex items-center gap-3">
        <label htmlFor={name} className="text-sm font-medium">{label}</label>
        <input 
            type="color" 
            id={name} 
            name={name} 
            value={value} 
            onChange={(e) => onChange(name, e.target.value)} 
            className="w-10 h-10 p-1 border rounded-md cursor-pointer dark:border-slate-600 bg-transparent"
        />
        <span className="font-mono text-sm text-text-muted">{value}</span>
    </div>
);


const resizeImageForLogo = (file: File, maxWidth: number, maxHeight: number): Promise<string> => {
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

        // Using webp for better compression
        resolve(canvas.toDataURL('image/webp', 0.9)); 
      };
      img.onerror = (err) => reject(new Error('Image failed to load. ' + String(err)));
    };
    reader.onerror = (err) => reject(new Error('An error occurred while reading the file. ' + String(err)));
  });
};

export const StoreCustomization: React.FC<{ settings: StoreSettings; onSave: (newSettings: StoreSettings) => Promise<void> }> = ({ settings: initialSettings, onSave }) => {
    const [settings, setSettings] = useState<StoreSettings>(initialSettings);
    const [isSaving, setIsSaving] = useState(false);
    const [editingThemeMode, setEditingThemeMode] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        setSettings(initialSettings);
    }, [initialSettings]);

    const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
    };
    
    const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            try {
                const resizedBase64 = await resizeImageForLogo(file, 256, 256);
                setSettings(prev => ({ ...prev, logo: resizedBase64 }));
            } catch (error) {
                console.error("Error resizing logo:", error);
                alert("حدث خطأ أثناء معالجة الشعار. يرجى التأكد من أن الملف هو صورة صالحة.");
            }
        }
    };

    const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({
            ...prev,
            contactInfo: { ...prev.contactInfo, [name]: value }
        }));
    };

    const handleThemeChange = (name: keyof ThemeColors, value: string) => {
        setSettings(prev => ({
            ...prev,
            theme: {
                ...prev.theme,
                [editingThemeMode]: {
                    ...prev.theme[editingThemeMode],
                    [name]: value
                }
            }
        }));
    };
    
    const handleStoreNameStyleChange = (prop: keyof NonNullable<StoreSettings['storeNameStyle']>, value: string | 'default' | 'gradient') => {
        setSettings(prev => ({
            ...prev,
            storeNameStyle: {
                ...prev.storeNameStyle,
                [prop]: value,
            } as StoreSettings['storeNameStyle'],
        }));
    };

    const handleCardStyleChange = (style: 'default' | 'minimal' | 'overlay') => {
        setSettings(prev => ({ ...prev, productCardStyle: style }));
    };

    const handleGridLayoutChange = (layout: 'default' | 'condensed' | 'large') => {
        setSettings(prev => ({ ...prev, productGridLayout: layout }));
    };
    
    const handleAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setSettings(prev => ({...prev, [name]: value}));
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            await onSave(settings);
            // using alert for simplicity, could use toast context
            alert('تم حفظ إعدادات التخصيص!');
        } catch (error) {
            console.error("Error saving customization settings: ", error);
            alert("حدث خطأ أثناء حفظ الإعدادات.");
        } finally {
            setIsSaving(false);
        }
    };
    
    const cardStyles: {id: 'default' | 'minimal' | 'overlay'; label: string; desc: string}[] = [
        {id: 'default', label: 'افتراضي', desc: 'تصميم متوازن وجذاب يعرض التفاصيل بوضوح.'},
        {id: 'minimal', label: 'بسيط', desc: 'تصميم نظيف يركز على الصورة والسعر.'},
        {id: 'overlay', label: 'متراكب', desc: 'تصميم عصري يعرض التفاصيل فوق الصورة.'}
    ];

    const gridLayouts: {id: 'default' | 'condensed' | 'large'; label: string; desc: string}[] = [
        {id: 'default', label: 'افتراضي', desc: 'عرض متوازن ومناسب لمعظم الشاشات.'},
        {id: 'condensed', label: 'مكثف', desc: 'عرض عدد أكبر من المنتجات في صف واحد.'},
        {id: 'large', label: 'واسع', desc: 'عرض منتجات أقل مع صور أكبر وتركيز أعلى.'}
    ];


    return (
        <div className="animate-fade-in-up space-y-8">
            <h3 className="text-3xl font-bold mb-6 text-gray-700 dark:text-gray-300 border-b pb-2 border-gray-200 dark:border-slate-700">تخصيص المتجر</h3>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md space-y-6">
                <h4 className="text-xl font-bold">المعلومات الأساسية</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="اسم المتجر" name="storeName" value={settings.storeName} onChange={handleBasicChange} />
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">شعار المتجر</label>
                        <div className="flex items-center gap-4">
                            <img src={settings.logo} alt="Store Logo" className="w-16 h-16 rounded-full object-cover bg-gray-100 dark:bg-slate-700 border dark:border-slate-600 shadow-sm" />
                            <label htmlFor="logo-upload" className="cursor-pointer bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 text-sm font-semibold px-4 py-2 border dark:border-slate-600 rounded-md transition-colors">
                                تغيير الصورة
                            </label>
                            <input 
                                id="logo-upload" 
                                type="file" 
                                accept="image/*" 
                                onChange={handleLogoChange} 
                                className="hidden" 
                            />
                        </div>
                    </div>
                </div>
                <InputField label="وصف المتجر" name="storeDescription" value={settings.storeDescription} onChange={handleBasicChange} isTextArea />
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md space-y-6">
                <h4 className="text-xl font-bold">جماليات اسم المتجر</h4>
                <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                        <input
                            type="radio"
                            name="storeNameStyle"
                            value="default"
                            checked={settings.storeNameStyle?.style === 'default'}
                            onChange={() => handleStoreNameStyleChange('style', 'default')}
                            className="text-primary focus:ring-primary"
                        />
                        <div>
                            <span className="font-semibold">اللون الأساسي</span>
                            <p className="text-sm text-text-muted">يستخدم اللون الأساسي المحدد للمتجر.</p>
                        </div>
                    </label>
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:border-primary/50 transition-colors">
                        <input
                            type="radio"
                            name="storeNameStyle"
                            value="gradient"
                            checked={settings.storeNameStyle?.style === 'gradient'}
                            onChange={() => handleStoreNameStyleChange('style', 'gradient')}
                            className="text-primary focus:ring-primary"
                        />
                        <div>
                            <span className="font-semibold">تدرج لوني</span>
                            <p className="text-sm text-text-muted">يضيف تدرجًا لونيًا جذابًا لاسم المتجر.</p>
                        </div>
                    </label>
                </div>
                {settings.storeNameStyle?.style === 'gradient' && (
                    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-slate-900/50 dark:border-slate-700 animate-fade-in-up">
                        <h5 className="font-bold mb-3">ألوان التدرج:</h5>
                        <div className="flex flex-col md:flex-row gap-6">
                            <ColorPicker 
                                label="من" 
                                name="gradientFrom" 
                                value={settings.storeNameStyle?.gradientFrom || '#818cf8'} 
                                onChange={(_, value) => handleStoreNameStyleChange('gradientFrom', value)} 
                            />
                            <ColorPicker 
                                label="إلى" 
                                name="gradientTo" 
                                value={settings.storeNameStyle?.gradientTo || '#4f46e5'} 
                                onChange={(_, value) => handleStoreNameStyleChange('gradientTo', value)} 
                            />
                        </div>
                    </div>
                )}
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md space-y-6">
                <div className="flex justify-between items-center">
                    <h4 className="text-xl font-bold">ألوان المتجر</h4>
                    <div className="flex items-center bg-gray-200 dark:bg-slate-700 p-1 rounded-full">
                        <button onClick={() => setEditingThemeMode('light')} className={`px-4 py-1 text-sm font-semibold rounded-full transition-colors ${editingThemeMode === 'light' ? 'bg-white dark:bg-slate-800 shadow' : ''}`}>
                            الوضع النهاري
                        </button>
                        <button onClick={() => setEditingThemeMode('dark')} className={`px-4 py-1 text-sm font-semibold rounded-full transition-colors ${editingThemeMode === 'dark' ? 'bg-white dark:bg-slate-800 shadow' : ''}`}>
                            الوضع الليلي
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-4 border rounded-lg bg-gray-50 dark:bg-slate-900/50 dark:border-slate-700">
                    <ColorPicker label="اللون الأساسي" name="primary" value={settings.theme[editingThemeMode].primary} onChange={handleThemeChange as any} />
                    <ColorPicker label="اللون الثانوي" name="secondary" value={settings.theme[editingThemeMode].secondary} onChange={handleThemeChange as any} />
                    <ColorPicker label="لون التنبيه" name="accent" value={settings.theme[editingThemeMode].accent} onChange={handleThemeChange as any} />
                    <ColorPicker label="لون الخلفية" name="background" value={settings.theme[editingThemeMode].background} onChange={handleThemeChange as any} />
                    <ColorPicker label="لون النص" name="text" value={settings.theme[editingThemeMode].text} onChange={handleThemeChange as any} />
                    <ColorPicker label="لون النص الباهت" name="textMuted" value={settings.theme[editingThemeMode].textMuted} onChange={handleThemeChange as any} />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md space-y-6">
                <h4 className="text-xl font-bold">تقسيم عرض المنتجات</h4>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {gridLayouts.map(layout => (
                        <label key={layout.id} className={`flex flex-col text-center p-4 bg-white dark:bg-slate-800 rounded-lg border-2 transition-all cursor-pointer ${settings.productGridLayout === layout.id ? 'border-primary shadow-md' : 'border-gray-200 dark:border-slate-700 hover:border-primary/50'}`}>
                            <input
                                type="radio"
                                name="productGridLayout"
                                value={layout.id}
                                checked={settings.productGridLayout === layout.id}
                                onChange={() => handleGridLayoutChange(layout.id)}
                                className="absolute w-0 h-0 opacity-0"
                            />
                            <span className="font-bold text-lg">{layout.label}</span>
                            <span className="text-sm text-text-muted mt-1">{layout.desc}</span>
                        </label>
                    ))}
                </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md space-y-6">
                <h4 className="text-xl font-bold">شكل بطاقة المنتج</h4>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {cardStyles.map(style => (
                        <label key={style.id} className={`flex flex-col text-center p-4 bg-white dark:bg-slate-800 rounded-lg border-2 transition-all cursor-pointer ${settings.productCardStyle === style.id ? 'border-primary shadow-md' : 'border-gray-200 dark:border-slate-700 hover:border-primary/50'}`}>
                            <input
                                type="radio"
                                name="productCardStyle"
                                value={style.id}
                                checked={settings.productCardStyle === style.id}
                                onChange={() => handleCardStyleChange(style.id)}
                                className="absolute w-0 h-0 opacity-0"
                            />
                            <span className="font-bold text-lg">{style.label}</span>
                            <span className="text-sm text-text-muted mt-1">{style.desc}</span>
                        </label>
                    ))}
                </div>
            </div>
            
             <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md space-y-6">
                <h4 className="text-xl font-bold">معلومات التواصل</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <InputField label="الهاتف" name="phone" value={settings.contactInfo.phone} onChange={handleContactChange} />
                   <InputField label="البريد الإلكتروني" name="email" value={settings.contactInfo.email} onChange={handleContactChange} type="email" />
                   <InputField label="رابط واتساب" name="whatsapp" value={settings.contactInfo.whatsapp} onChange={handleContactChange} />
                   <InputField label="رابط فيسبوك" name="facebook" value={settings.contactInfo.facebook} onChange={handleContactChange} />
                   <InputField label="رابط انستغرام" name="instagram" value={settings.contactInfo.instagram} onChange={handleContactChange} />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md space-y-6">
                <h4 className="text-xl font-bold">بيانات الدخول للوحة التحكم</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <InputField label="اسم المستخدم" name="adminUsername" value={settings.adminUsername} onChange={handleAdminChange} />
                   <InputField label="كلمة المرور" name="adminPassword" value={settings.adminPassword} onChange={handleAdminChange} type="password"/>
                </div>
                 <p className="text-sm text-yellow-700 bg-yellow-100 dark:text-yellow-200 dark:bg-yellow-900/50 p-2 rounded">
                    <strong>تنبيه:</strong> تغيير هذه البيانات سيتطلب منك تسجيل الدخول مجدداً في المرة القادمة.
                </p>
            </div>


            <div className="flex justify-end pt-4">
                <button onClick={handleSaveSettings} className="px-6 py-2 bg-secondary text-white rounded hover:bg-opacity-90 transition-colors active:scale-95 shadow-lg shadow-secondary/30" disabled={isSaving}>
                    {isSaving ? '...جاري الحفظ' : 'حفظ التغييرات'}
                </button>
            </div>
        </div>
    );
};