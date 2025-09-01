import React from 'react';
import { MapPin } from 'lucide-react';

interface RegionalBadgeProps {
  regionalRestriction: {
    level: 'district' | 'sector' | 'cell';
    district?: string;
    sector?: string;
    cell?: string;
  };
}

const RegionalBadge: React.FC<RegionalBadgeProps> = ({ regionalRestriction }) => {
  const getDisplayText = () => {
    const { level, district, sector, cell } = regionalRestriction;
    
    switch (level) {
      case 'district':
        return `${district} District Only`;
      case 'sector':
        return `${sector} Sector Only`;
      case 'cell':
        return `${cell} Cell Only`;
      default:
        return 'Regional';
    }
  };

  const getBadgeColor = () => {
    switch (regionalRestriction.level) {
      case 'district':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'sector':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cell':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBadgeColor()}`}>
      <MapPin size={12} />
      <span>{getDisplayText()}</span>
    </div>
  );
};

export default RegionalBadge;
