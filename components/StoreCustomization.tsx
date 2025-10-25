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

const ColorPicker: React.FC<{ label: string; name: keyof ThemeColors; value: string; onChange: (name: keyof ThemeColors, value: string) => void }> = ({ label, name, value, onChange }) => (
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

export const StoreCustomization: React.FC<{ settings: StoreSettings; onSave: (newSettings: StoreSettings) => Promise<void> }> = ({ settings: initialSettings, onSave }) => {
    const [settings, setSettings] = useState<StoreSettings>(initialSettings);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setSettings(initialSettings);
    }, [initialSettings]);

    const handleBasicChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

    const handleThemeChange = (name: keyof ThemeColors, value: string) => {
        setSettings(prev => ({
            ...prev,
            theme: { ...prev.theme, [name]: value }
        }));
    };

    const handleCardStyleChange = (style: 'default' | 'minimal' | 'overlay') => {
        setSettings(prev => ({ ...prev, productCardStyle: style }));
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

    return (
        <div className="animate-fade-in-up space-y-8">
            <h3 className="text-3xl font-bold mb-6 text-gray-700 dark:text-gray-300 border-b pb-2 border-gray-200 dark:border-slate-700">تخصيص المتجر</h3>
            
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md space-y-6">
                <h4 className="text-xl font-bold">المعلومات الأساسية</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="اسم المتجر" name="storeName" value={settings.storeName} onChange={handleBasicChange} />
                    <InputField label="رابط الشعار (Logo URL)" name="logo" value={settings.logo} onChange={handleBasicChange} />
                </div>
                <InputField label="وصف المتجر" name="storeDescription" value={settings.storeDescription} onChange={handleBasicChange} isTextArea />
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md space-y-6">
                <h4 className="text-xl font-bold">ألوان المتجر</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 p-4 border rounded-lg bg-gray-50 dark:bg-slate-900/50 dark:border-slate-700">
                    <ColorPicker label="اللون الأساسي" name="primary" value={settings.theme.primary} onChange={handleThemeChange} />
                    <ColorPicker label="اللون الثانوي" name="secondary" value={settings.theme.secondary} onChange={handleThemeChange} />
                    <ColorPicker label="لون التنبيه" name="accent" value={settings.theme.accent} onChange={handleThemeChange} />
                    <ColorPicker label="لون الخلفية" name="background" value={settings.theme.background} onChange={handleThemeChange} />
                    <ColorPicker label="لون النص" name="text" value={settings.theme.text} onChange={handleThemeChange} />
                    <ColorPicker label="لون النص الباهت" name="textMuted" value={settings.theme.textMuted} onChange={handleThemeChange} />
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
