
import React, { useState, useEffect, useCallback } from 'react';
import AuthForm from './components/AuthForm';
import Dashboard from './components/Dashboard';
import TwoFactorAuth from './components/TwoFactorAuth';
import BiometricPromptModal from './components/BiometricPromptModal';
import NotificationComponent from './components/Notification';
import { api } from './services/api';
import type { User, Notification } from './types';
import { View, NotificationType } from './types';

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>(View.LOGIN);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [pendingUser, setPendingUser] = useState<{email: string; passwordHash: string} | null>(null);

    const [authError, setAuthError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = useCallback((message: string, type: NotificationType) => {
        const newNotification: Notification = {
            id: Date.now(),
            message,
            type,
        };
        setNotifications(prev => [...prev, newNotification]);
    }, []);

    const dismissNotification = (id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    useEffect(() => {
        // This could be where you check for a session token in a real app
        const loggedInUser = localStorage.getItem('currentUser');
        if (loggedInUser) {
            setCurrentUser(JSON.parse(loggedInUser));
            setCurrentView(View.DASHBOARD);
        }
    }, []);

    const handleLogin = async ({ email, password }: Record<string, string>) => {
        setIsLoading(true);
        setAuthError(null);
        try {
            const user = await api.getUserByEmail(email);
            if (user && user.passwordHash === password) {
                setPendingUser({ email: user.email, passwordHash: password });
                if (user.isBiometricEnabled) {
                    setCurrentView(View.BIOMETRIC);
                } else {
                    setCurrentView(View.TFA);
                }
            } else {
                setAuthError('Invalid email or password.');
            }
        } catch (error) {
            setAuthError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleBiometricLogin = async () => {
        setIsLoading(true);
        setAuthError(null);
        if (pendingUser) {
            const user = await api.getUserByEmail(pendingUser.email);
            if (user) {
                setCurrentUser(user);
                localStorage.setItem('currentUser', JSON.stringify(user));
                setCurrentView(View.DASHBOARD);
                addNotification('Successfully logged in!', NotificationType.SUCCESS);
            } else {
                setAuthError('User not found after biometric auth.');
                setCurrentView(View.LOGIN);
            }
        }
        setIsLoading(false);
        setPendingUser(null);
    };

    const handleTFA = async (code: string) => {
        setIsLoading(true);
        setAuthError(null);
        // In a real app, you'd verify the code with the backend
        if (code === "123456" && pendingUser) {
            const user = await api.getUserByEmail(pendingUser.email);
            if (user) {
                setCurrentUser(user);
                localStorage.setItem('currentUser', JSON.stringify(user));
                setCurrentView(View.DASHBOARD);
                addNotification('Successfully logged in!', NotificationType.SUCCESS);
            } else {
                 setAuthError('User not found after TFA.');
                 setCurrentView(View.LOGIN);
            }
        } else {
            setAuthError("Invalid verification code.");
        }
        setIsLoading(false);
        setPendingUser(null);
    };

    const handleRegister = async ({ name, email, password }: Record<string, string>) => {
        setIsLoading(true);
        setAuthError(null);
        try {
            await api.registerUser(name, email, password);
            addNotification('Registration successful! Please log in.', NotificationType.SUCCESS);
            setCurrentView(View.LOGIN);
        } catch (error: any) {
            setAuthError(error.message || 'Registration failed.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleLogout = () => {
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
        setCurrentView(View.LOGIN);
        addNotification('You have been logged out.', NotificationType.SUCCESS);
    };

    const updateUserInState = (user: User) => {
        setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    const renderView = () => {
        switch (currentView) {
            case View.LOGIN:
                return <AuthForm isRegister={false} onSubmit={handleLogin} onToggle={() => {setCurrentView(View.REGISTER); setAuthError(null);}} error={authError} isLoading={isLoading} />;
            case View.REGISTER:
                return <AuthForm isRegister={true} onSubmit={handleRegister} onToggle={() => {setCurrentView(View.LOGIN); setAuthError(null);}} error={authError} isLoading={isLoading} />;
            case View.TFA:
                 if (!pendingUser) {
                     setCurrentView(View.LOGIN);
                     return null;
                 }
                return <TwoFactorAuth email={pendingUser.email} onSubmit={handleTFA} onBack={() => {setCurrentView(View.LOGIN); setAuthError(null);}} error={authError} isLoading={isLoading} />;
            case View.BIOMETRIC:
                if (!pendingUser) {
                     setCurrentView(View.LOGIN);
                     return null;
                }
                return <BiometricPromptModal
                        onClose={() => {setCurrentView(View.LOGIN); setPendingUser(null);}}
                        onSuccess={handleBiometricLogin}
                        title="Biometric Sign In"
                        description={`Authenticate as ${pendingUser.email} to access your account.`}
                    />;
            case View.DASHBOARD:
                if (currentUser) {
                    return <Dashboard 
                        user={currentUser} 
                        onLogout={handleLogout} 
                        onTransaction={(msg) => addNotification(msg, NotificationType.SUCCESS)}
                        onTransactionError={(msg) => addNotification(msg, NotificationType.ERROR)}
                        updateUser={updateUserInState}
                        />;
                }
                // Fallback to login if user is somehow null
                setCurrentView(View.LOGIN);
                return null;
            default:
                return <AuthForm isRegister={false} onSubmit={handleLogin} onToggle={() => setCurrentView(View.REGISTER)} error={authError} isLoading={isLoading} />;
        }
    };

    return (
        <div>
            {notifications.map(n => (
                <NotificationComponent key={n.id} notification={n} onDismiss={dismissNotification} />
            ))}
            {renderView()}
        </div>
    );
};

export default App;