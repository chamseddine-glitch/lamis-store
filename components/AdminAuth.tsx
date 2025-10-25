
import React, { useState, useContext } from 'react';
import { StoreContext } from '../context/StoreContext';
import { ViewMode } from '../types';
import { UserShieldIcon } from './icons';

export const AdminAuth = () => {
    const { state, dispatch } = useContext(StoreContext);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (username === state.settings.adminUsername && password === state.settings.adminPassword) {
            setError('');
            dispatch({ type: 'LOGIN' });
        } else {
            setError('اسم المستخدم أو كلمة المرور غير صحيحة.');
        }
    };
    
    const backToStore = () => {
        dispatch({ type: 'SET_VIEW_MODE', payload: ViewMode.CUSTOMER });
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4" style={{ backgroundColor: 'var(--color-background)' }}>
            <div className="p-8 bg-white rounded-2xl shadow-xl w-full max-w-sm animate-fade-in-up border border-gray-200">
                <div className="text-center mb-8">
                    <div className="inline-block p-4 bg-primary/10 rounded-full">
                         <UserShieldIcon className="w-16 h-16 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold mt-4 text-gray-800">لوحة التحكم</h2>
                    <p className="text-gray-500 mt-1">مرحباً بعودتك! الرجاء تسجيل الدخول.</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700 sr-only">اسم المستخدم</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="اسم المستخدم"
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition"
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 sr-only">كلمة السر</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="كلمة السر"
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm transition"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center font-semibold animate-subtle-bounce">{error}</p>}
                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-md font-medium text-white bg-primary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all active:scale-95"
                    >
                        تسجيل الدخول
                    </button>
                </form>
                <div className="mt-6 text-center">
                    <button onClick={backToStore} className="text-sm text-primary hover:underline font-medium">
                        العودة إلى واجهة المتجر
                    </button>
                </div>
            </div>
        </div>
    );
};
