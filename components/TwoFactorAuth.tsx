import React, { useState, useRef } from 'react';
import { LogoIcon } from './icons';

interface TwoFactorAuthProps {
    email: string;
    onSubmit: (code: string) => void;
    onBack: () => void;
    error: string | null;
    isLoading: boolean;
}

const CORRECT_CODE = "123456"; // Dummy code for simulation

const TwoFactorAuth: React.FC<TwoFactorAuthProps> = ({ email, onSubmit, onBack, error, isLoading }) => {
    const [code, setCode] = useState<string[]>(new Array(6).fill(''));
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const value = e.target.value;
        if (isNaN(Number(value))) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Move to next input
        if (value && index < 5) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const enteredCode = code.join('');
        if (enteredCode !== CORRECT_CODE) {
             onSubmit(''); // Pass incorrect code to trigger error in parent
        } else {
             onSubmit(enteredCode);
        }
    };
    
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-8">
                    <LogoIcon className="w-12 h-12 text-blue-500"/>
                </div>
                <div className="bg-gray-800 shadow-2xl rounded-2xl p-8">
                    <h2 className="text-center text-3xl font-extrabold text-white mb-2">Two-Factor Authentication</h2>
                    <p className="text-center text-gray-400 mb-8">
                        A verification code has been sent to {email}. <br /> (Hint: it's {CORRECT_CODE})
                    </p>
                    <form onSubmit={handleSubmit}>
                        <div className="flex justify-center gap-2 sm:gap-4 mb-6">
                            {code.map((digit, index) => (
                                <input
                                    key={index}
                                    // FIX: The ref callback should not return a value. Using a block body for the arrow function ensures it returns undefined.
                                    ref={(el) => { inputsRef.current[index] = el; }}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(e, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            ))}
                        </div>
                         {error && <p className="text-red-400 text-center text-sm mb-4">{error}</p>}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-500 transition-colors duration-300 disabled:bg-blue-800"
                        >
                            {isLoading ? 'Verifying...' : 'Verify Code'}
                        </button>
                    </form>
                    <div className="text-center mt-6">
                        <button onClick={onBack} className="text-sm text-blue-400 hover:underline">
                           Go back to login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TwoFactorAuth;