import React from 'react';
import { Heart, Loader2 } from 'lucide-react';

interface VoteButtonProps {
  votes: number;
  onVote: () => void;
  currentUserId: string;
  isLiked?: boolean;
  size?: 'sm' | 'md';
  disabled?: boolean;
}

export const VoteButton: React.FC<VoteButtonProps> = ({ 
  votes, 
  onVote, 
  currentUserId, 
  isLiked = false,
  size = 'md',
  disabled = false
}) => {
  const iconSize = size === 'sm' ? 14 : 18;
  const buttonClass = size === 'sm' ? 'p-1' : 'p-2';
  const textClass = size === 'sm' ? 'text-xs' : 'text-sm';
  const [voteCount, setVoteCount] = React.useState(votes);

  // Update local vote count when prop changes
  React.useEffect(() => {
    setVoteCount(votes);
  }, [votes]);

  const handleVote = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!disabled) {
      onVote();
    }
  };

  return (
    <div className={`flex ${size === 'sm' ? 'flex-row items-center space-x-2' : 'flex-col items-center space-y-1'}`}>
      <div className="relative group">
        <button
          onClick={handleVote}
          disabled={disabled}
                  className={`${buttonClass} rounded-full transition-all duration-200 ${
          isLiked
            ? 'bg-red-100 text-red-600 hover:bg-red-200 shadow-sm border-2 border-red-300'
            : 'text-gray-500 hover:bg-gray-100 hover:text-red-600 border-2 border-transparent'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 hover:text-red-600'}`}
          title={isLiked ? 'Click to unlike' : 'Click to like'}
          aria-label={isLiked ? 'Unlike this issue' : 'Like this issue'}
        >
        {disabled ? (
          <Loader2 size={iconSize} className="animate-spin" />
        ) : (
          <Heart 
            size={iconSize} 
            className={`transition-all duration-200 ${isLiked ? 'fill-current scale-110' : 'hover:scale-105'}`}
          />
        )}
        </button>
        

      </div>
      
      <span 
        key={voteCount} 
        className={`${textClass} font-medium ${isLiked ? 'text-red-600' : 'text-gray-600'} transition-all duration-200`}
      >
        {voteCount}
      </span>
    </div>
  );
};