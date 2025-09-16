import React, { useState } from 'react';
import type { User } from '../types';
import { api } from '../services/api';
import { UserIcon } from './icons';

interface ProfileSettingsModalProps {
  user: User;
  onClose: () => void;
  onUpdateUser: (user: User) => void;
  addNotification: (message: string) => void;
}

const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ user, onClose, onUpdateUser, addNotification }) => {
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(!!user.isBiometricEnabled);
  const [isSaving, setIsSaving] = useState(false);

  const handleToggleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const isEnabled = e.target.checked;
    setIsSaving(true);
    try {
        const updatedUser = await api.updateBiometricSetting(user.id, isEnabled);
        onUpdateUser(updatedUser);
        setIsBiometricEnabled(isEnabled);
        addNotification(`Biometric authentication has been ${isEnabled ? 'enabled' : 'disabled'}.`);
    } catch (error) {
        console.error("Failed to update biometric setting", error);
        addNotification("Failed to update setting. Please try again.");
        // Revert UI state on failure
        setIsBiometricEnabled(!isEnabled);
    } finally {
        setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md m-4 transform transition-all duration-300 scale-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Profile & Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-3xl">&times;</button>
        </div>
        
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-blue-500/20">
                    <UserIcon className="w-8 h-8 text-blue-400" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">{user.name}</h3>
                    <p className="text-gray-400">{user.email}</p>
                    <p className="text-sm font-mono text-gray-500 mt-1">{user.accountNumber}</p>
                </div>
            </div>

            <div className="bg-gray-700/50 p-4 rounded-lg">
                <h4 className="font-bold text-white mb-3">Security Settings</h4>
                <div className="flex justify-between items-center">
                    <label htmlFor="biometric-toggle" className="text-gray-300">
                        Enable Biometric Authentication
                        <p className="text-xs text-gray-500">Use Face ID or fingerprint for login and high-value transactions.</p>
                    </label>
                    <div className="relative inline-block w-12 ml-4 align-middle select-none transition duration-200 ease-in">
                        {/* FIX: Replaced unsupported <style jsx> tag with Tailwind CSS classes to style the toggle switch. Used the 'peer' utility for checked state styling. */}
                        <input
                            type="checkbox"
                            name="biometric-toggle"
                            id="biometric-toggle"
                            checked={isBiometricEnabled}
                            onChange={handleToggleChange}
                            disabled={isSaving}
                            className="toggle-checkbox peer absolute left-0 block w-6 h-6 rounded-full bg-white border-4 border-gray-300 appearance-none cursor-pointer transition-transform duration-200 ease-in-out checked:translate-x-full checked:border-blue-500"
                        />
                        <label htmlFor="biometric-toggle" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-600 cursor-pointer transition-colors duration-200 ease-in-out peer-checked:bg-blue-500"></label>
                    </div>
                </div>
            </div>

             <div className="flex justify-end pt-2">
                <button onClick={onClose} className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-500 transition-colors">
                    Close
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsModal;