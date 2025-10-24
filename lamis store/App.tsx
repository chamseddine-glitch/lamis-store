
import React, { useContext, useEffect, useState } from 'react';
import { StoreContext } from './context/StoreContext';
import { ViewMode } from './types';
import { AdminDashboard } from './components/AdminDashboard';
import { CustomerView } from './components/CustomerView';
import { AdminAuth } from './components/AdminAuth';
import { ShoppingCartIcon, UserShieldIcon, UserCircleIcon, WhatsAppIcon, LogoutIcon } from './components/icons';
import { CartModal } from './components/CartModal';

const Header = ({ onCartClick }: { onCartClick: () => void }) => {
    const { state, dispatch } = useContext(StoreContext);
    const { settings, viewMode, cart, isLoggedIn } = state;

    const goToAdmin = () => dispatch({ type: 'SET_VIEW_MODE', payload: ViewMode.ADMIN });
    const goToCustomer = () => dispatch({ type: 'SET_VIEW_MODE', payload: ViewMode.CUSTOMER });
    const logout = () => {
        if (window.confirm('هل أنت متأكد من تسجيل الخروج؟')) {
            dispatch({ type: 'LOGOUT' });
        }
    };

    return (
        <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-40">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <img src={settings.logo} alt="Store Logo" className="h-10 w-auto"/>
                    <h1 className="text-xl md:text-2xl font-bold text-primary">{settings.storeName}</h1>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={onCartClick} className="relative" aria-label={`عربة التسوق، ${cart.length} منتجات`}>
                        <ShoppingCartIcon className="h-7 w-7 text-text-muted hover:text-text-base transition-colors"/>
                        {cart.length > 0 && (
                             <span key={cart.length} className="absolute -top-2 -right-2 bg-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pop">{cart.length}</span>
                        )}
                    </button>
                    
                    {/* Admin Actions */}
                    { isLoggedIn && viewMode === ViewMode.ADMIN ? (
                        <>
                            <button onClick={goToCustomer} title="عرض كزبون" aria-label="عرض كزبون">
                                <UserCircleIcon className="h-7 w-7 text-text-muted hover:text-text-base transition-colors"/>
                            </button>
                            <button onClick={logout} title="تسجيل الخروج" aria-label="تسجيل الخروج">
                                <LogoutIcon className="h-7 w-7 text-red-500 hover:text-red-700 transition-colors"/>
                            </button>
                        </>
                    ) : isLoggedIn && viewMode === ViewMode.CUSTOMER ? (
                        <button onClick={goToAdmin} title="لوحة التحكم" aria-label="لوحة التحكم">
                            <UserShieldIcon className="h-7 w-7 text-text-muted hover:text-text-base transition-colors"/>
                        </button>
                    ) : (
                        // Not logged in
                        <button onClick={goToAdmin} title="دخول المدير" aria-label="دخول المدير">
                            <UserShieldIcon className="h-7 w-7 text-text-muted hover:text-text-base transition-colors"/>
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

const Footer = () => {
    const { state } = useContext(StoreContext);
    const { settings } = state;

    return (
        <footer className="bg-gray-800 text-white mt-auto">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-right">
                    <div>
                        <h4 className="font-bold text-lg mb-2">تواصل معنا</h4>
                        <p>الهاتف: <a href={`tel:${settings.contactInfo.phone}`} className="hover:underline">{settings.contactInfo.phone}</a></p>
                        <p>البريد: <a href={`mailto:${settings.contactInfo.email}`} className="hover:underline">{settings.contactInfo.email}</a></p>
                    </div>
                    <div>
                        <h4 className="font-bold text-lg mb-2">تابعنا</h4>
                        <div className="flex justify-center md:justify-start gap-4">
                            <a href={settings.contactInfo.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">فيسبوك</a>
                            <a href={settings.contactInfo.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">انستغرام</a>
                            <a href={settings.contactInfo.whatsapp} target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors">واتساب</a>
                        </div>
                    </div>
                     <div>
                        <h4 className="font-bold text-lg mb-2">عن المتجر</h4>
                        <p>{settings.storeDescription}</p>
                    </div>
                </div>
                <div className="text-center border-t border-gray-700 mt-8 pt-4">
                    <p>By Chames Eddine Nouah</p>
                </div>
            </div>
        </footer>
    );
};

const FloatingWhatsApp = () => {
    const { state } = useContext(StoreContext);
    return (
        <a href={state.settings.contactInfo.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="تواصل معنا عبر واتساب" className="fixed bottom-6 left-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-all z-50 animate-subtle-bounce hover:animate-none">
            <WhatsAppIcon className="w-8 h-8"/>
        </a>
    )
}

const ThemeInjector = () => {
  const { state } = useContext(StoreContext);
  const { theme } = state.settings;

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-secondary', theme.secondary);
    root.style.setProperty('--color-accent', theme.accent);
    root.style.setProperty('--color-background', theme.background);
    root.style.setProperty('--color-text', theme.text);
    root.style.setProperty('--color-text-muted', theme.textMuted);
    
    document.body.style.backgroundColor = theme.background;
    document.body.style.color = theme.text;
  }, [theme]);

  return null;
};


function App() {
    const { state } = useContext(StoreContext);
    const [isCartOpen, setIsCartOpen] = useState(false);

    return (
        <div className="flex flex-col min-h-screen bg-base-100 text-text-base">
            <ThemeInjector />
            {state.viewMode === ViewMode.ADMIN && !state.isLoggedIn ? (
                <AdminAuth />
            ) : (
                <>
                    <Header onCartClick={() => setIsCartOpen(true)} />
                    <main className="flex-grow">
                        {state.viewMode === ViewMode.ADMIN ? <AdminDashboard /> : <CustomerView />}
                    </main>
                    <Footer />
                    {state.viewMode === ViewMode.CUSTOMER && <FloatingWhatsApp/>}
                </>
            )}
            <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </div>
    );
}

export default App;
