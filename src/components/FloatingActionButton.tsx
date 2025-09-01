import React, { useState, useEffect } from 'react';
import { Plus, MessageCircle } from 'lucide-react';

interface FloatingActionButtonProps {
  type: 'issue' | 'topic';
  onClick: () => void;
  isVisible: boolean;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ type, onClick, isVisible }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  const isIssue = type === 'issue';
  const Icon = isIssue ? Plus : MessageCircle;
  const bgColor = isIssue ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700';
  const text = isIssue ? 'Create Issue' : 'Create Topic';

  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 ${isIssue ? 'right-6' : 'right-20'} z-50 ${bgColor} text-white rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 ${
        isScrolled ? 'w-12 h-12 p-0' : 'px-4 py-3'
      }`}
      title={text}
    >
      <div className="flex items-center justify-center">
        <Icon size={isScrolled ? 24 : 20} className={isScrolled ? '' : 'mr-2'} />
        {!isScrolled && <span className="font-medium">{text}</span>}
      </div>
    </button>
  );
};

export default FloatingActionButton;
