import React, { useState, useEffect } from 'react';
import { FingerprintIcon } from './icons';

interface BiometricPromptModalProps {
    onClose: () => void;
    onSuccess: () => Promise<void>;
    title: string;
    description: string;
}

const BiometricPromptModal: React.FC<BiometricPromptModalProps> = ({ onClose, onSuccess, title, description }) => {
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [authError, setAuthError] = useState('');
    
    // Auto-trigger simulation
    useEffect(() => {
        setIsAuthenticating(true);
        const timer = setTimeout(async () => {
            try {
                await onSuccess();
                // On success, parent component will handle closing the modal
            } catch (e: any) {
                setAuthError(e.message || "Authentication failed.");
                setIsAuthenticating(false);
            }
        }, 1500); // Simulate a 1.5 second scan

        return () => clearTimeout(timer);
    }, [onSuccess]);
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-sm m-4 text-center transform transition-all duration-300 scale-100">
                <div className="flex flex-col items-center">
                    <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
                    <p className="text-gray-400 mb-8">{description}</p>
                    
                    <div className="relative w-32 h-32 flex items-center justify-center">
                        <FingerprintIcon className={`w-24 h-24 text-blue-400 transition-colors duration-500 ${isAuthenticating ? 'animate-pulse' : ''} ${authError ? 'text-red-500' : ''}`} />
                    </div>

                    <p className="h-6 mt-6 text-lg font-medium text-gray-300">
                        {isAuthenticating && "Scanning..."}
                        {!isAuthenticating && !authError && "Authenticated!"}
                        {authError && <span className="text-red-400">{authError}</span>}
                    </p>

                    <div className="w-full mt-6">
                         <button 
                            type="button" 
                            onClick={onClose} 
                            className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors disabled:opacity-50"
                            disabled={isAuthenticating}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BiometricPromptModal;
