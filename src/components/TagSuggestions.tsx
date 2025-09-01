import React, { useState, useEffect } from 'react';
import { Hash, X, RefreshCw } from 'lucide-react';

interface TagSuggestionsProps {
  selectedTags: string[];
  onTagSelect: (tag: string) => void;
  onTagRemove: (tag: string) => void;
  maxTags?: number;
  className?: string;
}

// All available tags organized by categories for smart suggestions
const ALL_TAGS = {
  'development': ['infrastructure', 'roads', 'water', 'electricity', 'construction', 'planning'],
  'health': ['medical', 'healthcare', 'hospital', 'clinic', 'sanitation', 'hygiene', 'wellness'],
  'education': ['school', 'university', 'learning', 'training', 'skills', 'literacy'],
  'security': ['safety', 'police', 'emergency', 'crime', 'protection', 'surveillance'],
  'environment': ['cleanliness', 'waste', 'recycling', 'green', 'sustainability', 'pollution', 'nature'],
  'business': ['economy', 'jobs', 'entrepreneurship', 'market', 'trade', 'investment', 'employment'],
  'technology': ['digital', 'internet', 'mobile', 'innovation', 'connectivity', 'IT', 'software'],
  'social': ['welfare', 'poverty', 'unemployment', 'housing', 'family', 'youth', 'elderly', 'community'],
  'culture': ['heritage', 'tradition', 'arts', 'festivals', 'history', 'identity', 'music', 'dance'],
  'governance': ['leadership', 'transparency', 'accountability', 'participation', 'rights', 'democracy'],
  'transport': ['traffic', 'roads', 'public-transport', 'vehicles', 'parking', 'mobility'],
  'finance': ['budget', 'funding', 'taxes', 'banking', 'loans', 'savings'],
  'agriculture': ['farming', 'crops', 'livestock', 'irrigation', 'food-security', 'rural'],
  'energy': ['electricity', 'solar', 'renewable', 'power', 'lighting', 'fuel'],
  'water': ['sanitation', 'clean-water', 'sewage', 'drainage', 'wells', 'supply']
};

// Popular starter tags to show initially
const STARTER_TAGS = ['health', 'education', 'development', 'security', 'environment'];

export const TagSuggestions: React.FC<TagSuggestionsProps> = ({
  selectedTags,
  onTagSelect,
  onTagRemove,
  maxTags = 10,
  className = ""
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const canAddMoreTags = selectedTags.length < maxTags;

  // Generate smart suggestions based on selected tags
  const generateSuggestions = () => {
    if (selectedTags.length === 0) {
      // Show starter tags when no tags selected
      return STARTER_TAGS.filter(tag => !selectedTags.includes(tag));
    }

    const relatedTags: string[] = [];
    
    // Find related tags based on selected tags
    selectedTags.forEach(selectedTag => {
      if (ALL_TAGS[selectedTag]) {
        ALL_TAGS[selectedTag].forEach(relatedTag => {
          if (!selectedTags.includes(relatedTag) && !relatedTags.includes(relatedTag)) {
            relatedTags.push(relatedTag);
          }
        });
      }
    });

    // Add some random popular tags if we don't have enough suggestions
    const allAvailableTags = Object.keys(ALL_TAGS).filter(tag => 
      !selectedTags.includes(tag) && !relatedTags.includes(tag)
    );
    
    // Shuffle and take random tags to reach 5 suggestions
    const shuffledRandomTags = allAvailableTags.sort(() => Math.random() - 0.5);
    const neededTags = Math.max(0, 5 - relatedTags.length);
    
    return [...relatedTags.slice(0, 5), ...shuffledRandomTags.slice(0, neededTags)].slice(0, 5);
  };

  // Update suggestions when selected tags change
  useEffect(() => {
    setSuggestions(generateSuggestions());
  }, [selectedTags]);

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagRemove(tag);
    } else if (canAddMoreTags) {
      onTagSelect(tag);
    }
  };

  const refreshSuggestions = () => {
    setSuggestions(generateSuggestions());
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Selected Tags Display */}
      {selectedTags.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Hash size={16} className="text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Selected Tags ({selectedTags.length}/{maxTags})</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => onTagRemove(tag)}
                  className="ml-2 text-blue-600 hover:text-blue-800 transition-colors"
                  title="Remove tag"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Smart Tag Suggestions */}
      {canAddMoreTags && suggestions.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Hash size={16} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-700">
                {selectedTags.length === 0 ? 'Popular tags' : 'Related suggestions'}
              </span>
            </div>
            <button
              type="button"
              onClick={refreshSuggestions}
              className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 rounded transition-colors"
              title="Get new suggestions"
            >
              <RefreshCw size={12} />
              <span>Refresh</span>
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {suggestions.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className="px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 bg-white text-gray-700 border border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                title="Click to add"
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}



      {/* Show message when max tags reached */}
      {!canAddMoreTags && (
        <div className="text-center py-2">
          <span className="text-sm text-gray-500">Maximum tags reached ({maxTags})</span>
        </div>
      )}
    </div>
  );
};
