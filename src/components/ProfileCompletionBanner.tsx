import React from 'react';
import { AlertTriangle, MapPin, X } from 'lucide-react';
import { getTranslation } from '../i18n/translations';

interface ProfileCompletionBannerProps {
  language: string;
  onDismiss: () => void;
  onCompleteProfile: () => void;
  isVisible: boolean;
}

const ProfileCompletionBanner: React.FC<ProfileCompletionBannerProps> = ({
  language,
  onDismiss,
  onCompleteProfile,
  isVisible
}) => {
  if (!isVisible) return null;

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 text-yellow-400 mr-2" />
              <h3 className="text-sm font-medium text-yellow-800">
                {getTranslation('profileIncomplete', language)}
              </h3>
            </div>
            <button
              onClick={onDismiss}
              className="text-yellow-400 hover:text-yellow-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-2 text-sm text-yellow-700">
            <p>{getTranslation('profileIncompleteMessage', language)}</p>
          </div>
          <div className="mt-3">
            <button
              onClick={onCompleteProfile}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              {getTranslation('completeProfile', language)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCompletionBanner;


