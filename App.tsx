

import React, { useContext, useEffect, useState, useRef } from 'react';
import { StoreContext } from './context/StoreContext';
import { ViewMode } from './types';
import { AdminDashboard } from './components/AdminDashboard';
import { CustomerView } from './components/CustomerView';
import { AdminAuth } from './components/AdminAuth';
import { ShoppingCartIcon, UserShieldIcon, UserCircleIcon, WhatsAppIcon, LogoutIcon, ExclamationTriangleIcon, HamburgerIcon, SearchIcon, XMarkIcon } from './components/icons';
import { CartModal } from './components/CartModal';
import { SideMenu } from './components/SideMenu';

const Header = ({ onCartClick, onMenuClick, onSearchToggle, isSearchOpen, searchQuery, setSearchQuery }: { onCartClick: () => void; onMenuClick: () => void; onSearchToggle: () => void; isSearchOpen: boolean; searchQuery: string; setSearchQuery: (query: string) => void; }) => {
    const { state, dispatch } = useContext(StoreContext);
    const { settings, viewMode, cart, isLoggedIn } = state;

    const goToAdmin = () => dispatch({ type: 'SET_VIEW_MODE', payload: ViewMode.ADMIN });
    const goToCustomer = () => dispatch({ type: 'SET_VIEW_MODE', payload: ViewMode.CUSTOMER });
    const logout = () => {
        if (window.confirm('هل أنت متأكد من تسجيل الخروج؟')) {
            dispatch({ type: 'LOGOUT' });
        }
    };
    
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isSearchOpen) {
            // A short delay to allow the element to be rendered before focusing
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    }, [isSearchOpen]);

    return (
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm sticky top-0 z-40">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <div className="flex items-center gap-4">
                     <button onClick={onMenuClick} aria-label="فتح القائمة" className="group">
                        <HamburgerIcon className="h-7 w-7 text-text-muted group-hover:text-primary transition-all duration-200 transform group-hover:scale-110"/>
                    </button>
                    <img src={settings.logo} alt="Store Logo" className="h-10 w-auto"/>
                    <h1 className="text-xl md:text-2xl font-bold text-primary">{settings.storeName}</h1>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={onSearchToggle} className="group p-2" aria-label="بحث">
                        {isSearchOpen ? (
                             <XMarkIcon className="h-7 w-7 text-primary"/>
                        ) : (
                             <SearchIcon className="h-7 w-7 text-text-muted group-hover:text-primary transition-all duration-200 transform group-hover:scale-110"/>
                        )}
                    </button>
                    <button onClick={onCartClick} className="relative group p-2" aria-label={`عربة التسوق، ${cart.length} منتجات`}>
                        <ShoppingCartIcon className="h-7 w-7 text-text-muted group-hover:text-primary transition-all duration-200 transform group-hover:scale-110"/>
                        {cart.length > 0 && (
                             <span key={cart.length} className="absolute -top-1 -right-1 bg-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pop group-hover:scale-110 transition-transform">{cart.length}</span>
                        )}
                    </button>
                    
                    {/* Admin Actions */}
                    { isLoggedIn && viewMode === ViewMode.ADMIN ? (
                        <>
                            <button onClick={goToCustomer} title="عرض كزبون" aria-label="عرض كزبون" className="group p-2">
                                <UserCircleIcon className="h-7 w-7 text-text-muted group-hover:text-primary transition-all duration-200 transform group-hover:scale-110"/>
                            </button>
                            <button onClick={logout} title="تسجيل الخروج" aria-label="تسجيل الخروج" className="group p-2">
                                <LogoutIcon className="h-7 w-7 text-red-500 group-hover:text-red-600 transition-all duration-200 transform group-hover:scale-110"/>
                            </button>
                        </>
                    ) : isLoggedIn && viewMode === ViewMode.CUSTOMER ? (
                        <button onClick={goToAdmin} title="لوحة التحكم" aria-label="لوحة التحكم" className="group p-2">
                            <UserShieldIcon className="h-7 w-7 text-text-muted group-hover:text-primary transition-all duration-200 transform group-hover:scale-110"/>
                        </button>
                    ) : null }
                </div>
            </div>
            {isSearchOpen && (
                <div className="absolute top-full left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm p-4 shadow-lg border-t dark:border-slate-700 animate-fade-in-down">
                    <div className="relative container mx-auto">
                        <SearchIcon className="w-5 h-5 text-gray-400 absolute top-1/2 right-4 transform -translate-y-1/2 pointer-events-none" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="ابحث عن منتج..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:border-primary focus:ring-0 rounded-lg py-3 pr-11 pl-4 transition-colors"
                        />
                    </div>
                </div>
            )}
        </header>
    );
};

const Footer = () => {
    const { state } = useContext(StoreContext);
    const { settings } = state;

    return (
        <footer className="bg-gray-800 text-white dark:bg-black/80 dark:text-gray-300">
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
        <a href={state.settings.contactInfo.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="تواصل معنا عبر واتساب" className="fixed bottom-6 left-6 bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-all z-50 animate-subtle-bounce hover:animate-none transform hover:scale-110">
            <WhatsAppIcon className="w-8 h-8"/>
        </a>
    )
}

const ThemeInjector = () => {
  const { state } = useContext(StoreContext);
  const { settings, themeMode } = state;

  useEffect(() => {
    const root = document.documentElement;

    if (themeMode === 'dark') {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }

    root.style.setProperty('--color-primary', settings.theme.primary);
    root.style.setProperty('--color-secondary', settings.theme.secondary);
    root.style.setProperty('--color-accent', settings.theme.accent);
    root.style.setProperty('--color-background', settings.theme.background);
    root.style.setProperty('--color-text', settings.theme.text);
    root.style.setProperty('--color-text-muted', settings.theme.textMuted);
    
    // Dynamically update page title and favicon
    document.title = settings.storeName;
    const favicon = document.getElementById('favicon') as HTMLLinkElement | null;
    if (favicon && settings.logo) {
      favicon.href = settings.logo;
    }
  }, [settings, themeMode]);

  return null;
};

const MaintenanceScreen = () => {
    const { state } = useContext(StoreContext);
    const whatsappLink = state.settings?.contactInfo?.whatsapp;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4 text-center">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md w-full border border-red-200 dark:border-red-900">
                <ExclamationTriangleIcon className="w-20 h-20 mx-auto text-red-500 mb-4" />
                <h1 className="text-3xl font-bold text-red-600 mb-2">عذراً، حدث خطأ</h1>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                    فشل الاتصال بالخادم. قد يكون الموقع تحت الصيانة أو يواجه مشكلة تقنية.
                </p>
                <p className="text-gray-600 dark:text-gray-400">نحن نعمل على إصلاح المشكلة. يرجى المحاولة مرة أخرى لاحقاً.</p>
                {whatsappLink && (
                    <>
                        <p className="text-gray-600 dark:text-gray-400 mt-6">للاستفسارات العاجلة، يمكنك التواصل معنا مباشرة:</p>
                        <a 
                            href={whatsappLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="mt-4 inline-flex items-center gap-3 bg-green-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-green-600 transition-colors active:scale-95"
                        >
                            <WhatsAppIcon className="w-7 h-7"/>
                            <span>تواصل معنا عبر واتساب</span>
                        </a>
                    </>
                )}
            </div>
        </div>
    );
};

const LoadingScreen = () => (
    <div className="flex items-center justify-center min-h-screen bg-base-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
    </div>
);


function App() {
    const { state } = useContext(StoreContext);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    
    const [activeCategory, setActiveCategory] = useState('الكل');
    const [showOffersOnly, setShowOffersOnly] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        if (query) {
            setShowOffersOnly(false);
            setActiveCategory('الكل');
        }
    };
    
    if (state.dbStatus === 'loading') {
        return <LoadingScreen />;
    }

    if (state.dbStatus === 'error') {
        return <MaintenanceScreen />;
    }

    if (state.viewMode === ViewMode.ADMIN && !state.isLoggedIn) {
        return <AdminAuth />;
    }
    
    if (state.viewMode === ViewMode.ADMIN && state.isLoggedIn) {
        return (
            <>
                <ThemeInjector />
                <AdminDashboard />
            </>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-base-100 text-text-base dark:bg-gray-900 dark:text-gray-200 transition-colors duration-300">
            <ThemeInjector />
            <Header 
                onCartClick={() => setIsCartOpen(true)} 
                onMenuClick={() => setIsMenuOpen(true)}
                onSearchToggle={() => setIsSearchOpen(!isSearchOpen)}
                isSearchOpen={isSearchOpen}
                searchQuery={searchQuery}
                setSearchQuery={handleSearch}
            />
            <SideMenu 
                isOpen={isMenuOpen} 
                onClose={() => setIsMenuOpen(false)} 
                onSelectCategory={cat => {
                    setActiveCategory(cat);
                    setShowOffersOnly(false);
                    setSearchQuery('');
                    setIsMenuOpen(false);
                }}
                onShowOffers={() => {
                    setShowOffersOnly(true);
                    setActiveCategory('الكل');
                    setSearchQuery('');
                    setIsMenuOpen(false);
                }}
                activeCategory={activeCategory}
                showOffersOnly={showOffersOnly}
                searchQuery={searchQuery}
                setSearchQuery={handleSearch}
            />
            <main className="flex-grow">
                <CustomerView 
                    activeCategory={activeCategory} 
                    showOffersOnly={showOffersOnly} 
                    setActiveCategory={cat => {
                        setActiveCategory(cat);
                        setShowOffersOnly(false);
                        setSearchQuery('');
                    }}
                    searchQuery={searchQuery}
                />
            </main>
            <Footer />
            <FloatingWhatsApp/>
            <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </div>
    );
}

export default App;