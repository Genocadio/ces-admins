import React, { createContext, useContext, useState } from 'react';
import { X } from 'lucide-react';
import Login from '../components/Login';
import { useAuth } from './AuthContext';

interface LoginPromptContextType {
  showLoginPrompt: (message?: string, onSuccess?: () => void) => void;
  hideLoginPrompt: () => void;
}

const LoginPromptContext = createContext<LoginPromptContextType | undefined>(undefined);

export const useLoginPrompt = () => {
  const context = useContext(LoginPromptContext);
  if (!context) {
    throw new Error('useLoginPrompt must be used within a LoginPromptProvider');
  }
  return context;
};

interface LoginPromptProviderProps {
  children: React.ReactNode;
}

export const LoginPromptProvider: React.FC<LoginPromptProviderProps> = ({ children }) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [promptMessage, setPromptMessage] = useState<string>('');
  const [onSuccessCallback, setOnSuccessCallback] = useState<(() => void) | null>(null);
  const [isShowingPrompt, setIsShowingPrompt] = useState(false);
  const { isAuthenticated } = useAuth();

  const showLoginPrompt = (message = 'Please log in to continue', onSuccess?: () => void) => {
    if (isAuthenticated) {
      // If already authenticated, just call the success callback
      if (onSuccess) onSuccess();
      return;
    }
    
    // Prevent multiple prompts from being shown simultaneously
    if (isShowingPrompt) {
      console.log('Login prompt already showing, ignoring duplicate call');
      return;
    }
    
    setIsShowingPrompt(true);
    setPromptMessage(message);
    setOnSuccessCallback(() => onSuccess || null);
    setShowPrompt(true);
  };

  const hideLoginPrompt = () => {
    setShowPrompt(false);
    setPromptMessage('');
    setOnSuccessCallback(null);
    setIsShowingPrompt(false);
  };

  const handleLoginSuccess = () => {
    const callback = onSuccessCallback;
    hideLoginPrompt();
    
    // Execute the callback after a small delay to ensure state updates
    if (callback) {
      setTimeout(callback, 100);
    }
  };

  return (
    <LoginPromptContext.Provider value={{ showLoginPrompt, hideLoginPrompt }}>
      {children}
      
      {/* Login Modal */}
      {showPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Login Required</h2>
                <p className="text-sm text-gray-600 mt-1">{promptMessage}</p>
              </div>
              <button
                onClick={hideLoginPrompt}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4">
              <Login 
                language="ENGLISH"
                onSuccess={handleLoginSuccess}
                onCancel={hideLoginPrompt}
                isModal={true}
              />
            </div>
          </div>
        </div>
      )}
    </LoginPromptContext.Provider>
  );
};