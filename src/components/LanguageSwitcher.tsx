import React from 'react';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
}

const languages = [
  { code: 'ENGLISH', name: 'English' },
  { code: 'KINYARWANDA', name: 'Kinyarwanda' },
  { code: 'FRENCH', name: 'Français' },
];

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  currentLanguage,
  onLanguageChange,
}) => {
  return (
    <div className="relative group">
      <button className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors">
        <Globe size={20} />
        <span className="text-sm font-medium">
          {languages.find(lang => lang.code === currentLanguage)?.name}
        </span>
      </button>
      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => onLanguageChange(language.code)}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors ${
              currentLanguage === language.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
            }`}
          >
            {language.name}
          </button>
        ))}
      </div>
    </div>
  );
};