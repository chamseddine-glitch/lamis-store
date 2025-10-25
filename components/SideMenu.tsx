

import React, { useContext } from 'react';
import { StoreContext } from '../context/StoreContext';
import { XMarkIcon, WhatsAppIcon, TagIcon, SunIcon, MoonIcon, SearchIcon } from './icons';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (category: string) => void;
  onShowOffers: () => void;
  activeCategory: string;
  showOffersOnly: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const ThemeToggleSideMenu = () => {
    const { state, dispatch } = useContext(StoreContext);
    const { themeMode } = state;

    const toggleTheme = () => {
        dispatch({ type: 'TOGGLE_THEME_MODE' });
    };

    return (
         <button
            onClick={toggleTheme}
            className={`w-full text-right flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors hover:bg-gray-100 dark:hover:bg-gray-700`}
          >
            {themeMode === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
            <span>{themeMode === 'light' ? 'الوضع الليلي' : 'الوضع النهاري'}</span>
          </button>
    );
};

export const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, onSelectCategory, onShowOffers, activeCategory, showOffersOnly, searchQuery, setSearchQuery }) => {
  const { state } = useContext(StoreContext);
  const { settings, categories } = state;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />
      {/* Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white dark:bg-gray-800 shadow-lg z-50 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="p-4 flex justify-between items-center border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-primary">{settings.storeName}</h2>
          <button onClick={onClose} className="p-1">
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="p-4 border-b dark:border-gray-700">
            <div className="relative">
                <SearchIcon className="w-5 h-5 text-gray-400 absolute top-1/2 right-3 transform -translate-y-1/2 pointer-events-none" />
                <input
                    type="text"
                    placeholder="ابحث عن منتج..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:border-primary focus:ring-0 rounded-lg py-2 pr-10 pl-4 transition-colors"
                />
            </div>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto flex-grow">
          <button
            onClick={onShowOffers}
            className={`w-full text-right flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors ${
              showOffersOnly ? 'bg-secondary text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <TagIcon className="w-6 h-6" />
            <span>أهم العروض</span>
          </button>
          
          <div className="pt-4">
              <h3 className="px-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">التصنيفات</h3>
              <div className="mt-2 space-y-1">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => onSelectCategory(category)}
                    className={`w-full text-right flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeCategory === category && !showOffersOnly ? 'bg-primary/10 text-primary' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span>{category}</span>
                  </button>
                ))}
              </div>
          </div>
        </nav>
        
        <div className="p-4 border-t dark:border-gray-700 mt-auto space-y-2">
            <ThemeToggleSideMenu />
            <a
            href={settings.contactInfo.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full text-right flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
            >
            <WhatsAppIcon className="w-6 h-6 text-green-500" />
            <span>الدعم والاتصال</span>
            </a>
        </div>
      </div>
    </>
  );
};