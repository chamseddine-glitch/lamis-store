

import React, { useState, useContext } from 'react';
import { StoreContext } from '../context/StoreContext';
import { ViewMode } from '../types';
import { UserShieldIcon, MailIcon, LockClosedIcon } from './icons';

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
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 p-4 transition-colors duration-300">
            <div className="p-8 bg-white dark:bg-slate-800/90 dark:backdrop-blur-sm rounded-2xl shadow-2xl shadow-slate-500/10 dark:shadow-black/20 w-full max-w-sm animate-fade-in-up border border-gray-200 dark:border-slate-700">
                <div className="text-center mb-8">
                    <div className="inline-block p-4 bg-primary/10 rounded-full">
                         <UserShieldIcon className="w-16 h-16 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold mt-4 text-gray-800 dark:text-gray-100">لوحة التحكم</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">مرحباً بعودتك! الرجاء تسجيل الدخول.</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="relative">
                        <MailIcon className="w-5 h-5 text-gray-400 absolute top-1/2 right-4 transform -translate-y-1/2 pointer-events-none" />
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="اسم المستخدم"
                            className="mt-1 block w-full px-4 py-3 pr-11 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/80 focus:border-primary focus:shadow-lg focus:shadow-primary/20 sm:text-sm transition-all"
                            required
                        />
                    </div>
                    <div className="relative">
                        <LockClosedIcon className="w-5 h-5 text-gray-400 absolute top-1/2 right-4 transform -translate-y-1/2 pointer-events-none" />
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="كلمة السر"
                            className="mt-1 block w-full px-4 py-3 pr-11 border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/80 focus:border-primary focus:shadow-lg focus:shadow-primary/20 sm:text-sm transition-all"
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center font-semibold animate-subtle-bounce">{error}</p>}
                    <button
                        type="submit"
                        className="w-full relative overflow-hidden flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-md font-medium text-white bg-primary hover:bg-opacity-95 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-800 focus:ring-primary transition-all active:scale-95 hover:shadow-lg hover:shadow-primary/40 transform hover:-translate-y-0.5"
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