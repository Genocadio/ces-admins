import { Leader, IssueAssignment, EscalationAction, Survey } from '../types';

export const leaders: Leader[] = [
  {
    id: 'l1',
    firstName: 'Jean Pierre',
    lastName: 'Habimana',
    name: 'Jean Pierre Habimana',
    email: 'jp.habimana@cell.gov.rw',
    phoneNumber: '+250788111222',
    avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150',
    level: 'cell',
    location: {
      district: 'Gasabo',
      sector: 'Kacyiru',
      cell: 'Kamatamu'
    },
    department: 'Cell Administration',
    verified: true,
    joinedAt: new Date('2023-03-01'),
  },
  {
    id: 'l2',
    firstName: 'Marie Claire',
    lastName: 'Uwamahoro',
    name: 'Marie Claire Uwamahoro',
    email: 'mc.uwamahoro@sector.gov.rw',
    phoneNumber: '+250788333444',
    avatar: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=150',
    level: 'sector',
    location: {
      district: 'Gasabo',
      sector: 'Kacyiru'
    },
    department: 'Sector Administration',
    verified: true,
    joinedAt: new Date('2022-08-15'),
  },
  {
    id: 'l3',
    firstName: 'Emmanuel',
    lastName: 'Ntirenganya',
    name: 'Emmanuel Ntirenganya',
    email: 'e.ntirenganya@district.gov.rw',
    phoneNumber: '+250788555666',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
    level: 'district',
    location: {
      district: 'Gasabo'
    },
    department: 'District Administration',
    verified: true,
    joinedAt: new Date('2021-12-01'),
  },
  {
    id: 'l4',
    firstName: 'Claudine',
    lastName: 'Mukamana',
    name: 'Claudine Mukamana',
    email: 'c.mukamana@cell.gov.rw',
    phoneNumber: '+250788777888',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150',
    level: 'cell',
    location: {
      district: 'Nyarugenge',
      sector: 'Nyamirambo',
      cell: 'Biryogo'
    },
    department: 'Cell Administration',
    verified: true,
    joinedAt: new Date('2023-05-20'),
  },
  {
    id: 'l5',
    firstName: 'David',
    lastName: 'Nzeyimana',
    name: 'David Nzeyimana',
    email: 'd.nzeyimana@sector.gov.rw',
    phoneNumber: '+250788999000',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
    level: 'sector',
    location: {
      district: 'Nyarugenge',
      sector: 'Nyamirambo'
    },
    department: 'Sector Administration',
    verified: true,
    joinedAt: new Date('2022-11-10'),
  },
  {
    id: 'l6',
    firstName: 'Grace',
    lastName: 'Kayitesi',
    name: 'Grace Kayitesi',
    email: 'g.kayitesi@district.gov.rw',
    phoneNumber: '+250788111333',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    level: 'district',
    location: {
      district: 'Nyarugenge'
    },
    department: 'District Administration',
    verified: true,
    joinedAt: new Date('2021-07-01'),
  },
];

export const issueAssignments: IssueAssignment[] = [
  {
    id: 'ia1',
    issueId: '1', // Poor Road Conditions on KG 15 Ave
    assignedTo: 'l2', // Marie Claire (Sector level - Kacyiru)
    assignedBy: 'system',
    assignedAt: new Date('2024-01-15'),
    status: 'in_progress',
    priority: 'high',
    dueDate: new Date('2024-02-15'),
    notes: 'Road repairs require coordination with RTDA and budget approval.',
  },
  {
    id: 'ia2',
    issueId: '2', // Water Supply Issues in Nyamirambo Sector
    assignedTo: 'l6', // Grace (District level - Nyarugenge)
    assignedBy: 'system',
    assignedAt: new Date('2024-01-18'),
    status: 'in_progress',
    priority: 'urgent',
    dueDate: new Date('2024-02-01'),
    notes: 'Requires coordination with WASAC and emergency water distribution.',
  },
  {
    id: 'ia3',
    issueId: '3', // Need for More Healthcare Centers in Rural Areas
    assignedTo: 'l4', // Claudine (Cell level - Biryogo)
    assignedBy: 'l5', // Assigned by David (Sector level)
    assignedAt: new Date('2024-01-12'),
    status: 'resolved',
    priority: 'medium',
    dueDate: new Date('2024-03-01'),
    notes: 'Funding approved, construction plans finalized.',
  },
];

export const escalationActions: EscalationAction[] = [
  {
    id: 'ea1',
    issueId: '1',
    fromLeader: 'l1', // Jean Pierre (Cell) escalating to sector
    toLeader: 'l2', // Marie Claire (Sector)
    escalationType: 'up',
    reason: 'Road repair requires sector-level coordination and budget approval. Beyond cell capabilities.',
    createdAt: new Date('2024-01-16'),
    status: 'accepted',
  },
  {
    id: 'ea2',
    issueId: '2',
    fromLeader: 'l5', // David (Sector) escalating to district
    toLeader: 'l6', // Grace (District)
    escalationType: 'up',
    reason: 'Water supply issue affects multiple sectors and requires district-level coordination with WASAC.',
    createdAt: new Date('2024-01-19'),
    status: 'accepted',
  },
];

// Helper function to get issues assigned to a specific leader
export const getIssuesForLeader = (leaderId: string): IssueAssignment[] => {
  return issueAssignments.filter(assignment => assignment.assignedTo === leaderId);
};

// Helper function to check if a leader can handle issues at a specific level
export const canHandleIssueLevel = (leaderLevel: 'cell' | 'sector' | 'district', issueLevel: 'village' | 'cell' | 'sector' | 'district'): boolean => {
  const levels = {
    village: 1,
    cell: 2,
    sector: 3,
    district: 4,
  };
  
  const leaderLevelNum = levels[leaderLevel] || 0;
  const issueLevelNum = levels[issueLevel] || 0;
  
  return leaderLevelNum >= issueLevelNum;
};

// Helper function to get possible escalation targets for a leader
export const getEscalationTargets = (fromLeader: Leader): Leader[] => {
  // Get leaders at higher levels in the same geographic area
  return leaders.filter(leader => {
    // Can't escalate to self
    if (leader.id === fromLeader.id) return false;
    
    // Must be in same district
    if (leader.location.district !== fromLeader.location.district) return false;
    
    if (fromLeader.level === 'cell') {
      // Cell leader can escalate to sector (same sector) or district
      return (leader.level === 'sector' && leader.location.sector === fromLeader.location.sector) ||
             leader.level === 'district';
    } else if (fromLeader.level === 'sector') {
      // Sector leader can only escalate to district
      return leader.level === 'district';
    }
    
    // District leaders can't escalate higher in this system
    return false;
  });
};

// Helper function to get announcements for a specific leader's region
export const getAnnouncementsForLeader = (leader: Leader, allAnnouncements: any[]): any[] => {
  return allAnnouncements.filter(announcement => {
    // If announcement has no regional focus, show to all leaders
    if (!announcement.targetAudience || announcement.targetAudience.length === 0) {
      return true;
    }
    
    // Check for regional focus announcements
    const regionalAnnouncements = announcement.targetAudience.filter((audience: string) => 
      audience.startsWith('regional_')
    );
    
    if (regionalAnnouncements.length > 0) {
      // Check if the leader can see this regional announcement
      return regionalAnnouncements.some((regional: string) => {
        const parts = regional.split('_');
        if (parts.length < 3) return false;
        
        const level = parts[1];
        const scope = parts[2]; // default, all_sectors, all_cells, or specific_cell
        const district = parts[3];
        const sector = parts[4];
        const cell = parts[5];
        
        // District level leaders can see all regional announcements in their district
        if (leader.level === 'district') {
          return district === leader.location.district;
        }
        
        // Sector level leaders can see sector-wide and cell-specific announcements in their sector
        if (leader.level === 'sector') {
          if (district !== leader.location.district) return false;
          if (sector !== leader.location.sector) return false;
          
          if (level === 'sector') {
            // Can see sector-wide announcements (all cells in their sector)
            return scope === 'default' || scope === 'all_cells';
          } else if (level === 'cell') {
            // Can see cell-specific announcements in their sector
            return true;
          }
          return false;
        }
        
        // Cell level leaders can only see cell-specific announcements in their cell
        if (leader.level === 'cell') {
          if (district !== leader.location.district) return false;
          if (sector !== leader.location.sector) return false;
          if (level === 'cell' && cell === leader.location.cell) {
            return scope === 'default' || scope === 'specific_cell';
          }
          return false;
        }
        
        return false;
      });
    }
    
    // Check if announcement targets the leader's region (legacy support)
    const hasRegionalFocus = announcement.targetAudience.some((audience: string) => 
      audience === leader.location.district ||
      audience === leader.location.sector ||
      audience === leader.location.cell
    );
    
    return hasRegionalFocus;
  });
};

// Helper function to check if a leader can create announcements for a specific region
export const canCreateAnnouncementForRegion = (leader: Leader, targetLevel: string, targetDistrict: string, targetSector?: string, targetCell?: string): boolean => {
  // District leaders can create announcements for any level in their district
  if (leader.level === 'district') {
    return targetDistrict === leader.location.district;
  }
  
  // Sector leaders can create sector-wide (all cells) or cell-specific announcements in their sector
  if (leader.level === 'sector') {
    if (targetDistrict !== leader.location.district) return false;
    if (targetLevel === 'district') return false; // Can't target district-wide
    if (targetLevel === 'sector') return targetSector === leader.location.sector;
    if (targetLevel === 'cell') return targetSector === leader.location.sector;
    return false;
  }
  
  // Cell leaders can only create cell-specific announcements in their cell
  if (leader.level === 'cell') {
    if (targetDistrict !== leader.location.district) return false;
    if (targetSector !== leader.location.sector) return false;
    if (targetLevel === 'cell') return targetCell === leader.location.cell;
    return false; // Can't target sector or district-wide
  }
  
  return false;
};

// Helper function to get surveys for a specific leader's region
export const getSurveysForLeader = (leader: Leader, allSurveys: Survey[]): Survey[] => {
  return allSurveys.filter(survey => {
    // If survey has no regional focus, show to all leaders
    if (!survey.targetAudience || survey.targetAudience.length === 0) {
      return true;
    }
    
    // Check for regional focus surveys
    const regionalSurveys = survey.targetAudience.filter(audience => 
      audience.startsWith('regional_')
    );
    
    if (regionalSurveys.length > 0) {
      // Check if the leader can see this regional survey
      return regionalSurveys.some(regional => {
        const parts = regional.split('_');
        if (parts.length < 3) return false;
        
        const level = parts[1];
        const scope = parts[2]; // default, all_sectors, all_cells, or specific_cell
        const district = parts[3];
        const sector = parts[4];
        const cell = parts[5];
        
        // District level leaders can see all regional surveys in their district
        if (leader.level === 'district') {
          return district === leader.location.district;
        }
        
        // Sector level leaders can see sector-wide and cell-specific surveys in their sector
        if (leader.level === 'sector') {
          if (district !== leader.location.district) return false;
          if (sector !== leader.location.sector) return false;
          
          if (level === 'sector') {
            // Can see sector-wide surveys (all cells in their sector)
            return scope === 'default' || scope === 'all_cells';
          } else if (level === 'cell') {
            // Can see cell-specific surveys in their sector
            return true;
          }
          return false;
        }
        
        // Cell level leaders can only see cell-specific surveys in their cell
        if (leader.level === 'cell') {
          if (district !== leader.location.district) return false;
          if (sector !== leader.location.sector) return false;
          if (level === 'cell' && cell === leader.location.cell) {
            return scope === 'default' || scope === 'specific_cell';
          }
          return false;
        }
        
        return false;
      });
    }
    
    // Check if survey targets the leader's region (legacy support)
    const hasRegionalFocus = survey.targetAudience.some(audience => 
      audience === leader.location.district ||
      audience === leader.location.sector ||
      audience === leader.location.cell
    );
    
    return hasRegionalFocus;
  });
};

// Helper function to check if a leader can create surveys for a specific region
export const canCreateSurveyForRegion = (leader: Leader, targetLevel: string, targetDistrict: string, targetSector?: string, targetCell?: string): boolean => {
  // District leaders can create surveys for any level in their district
  if (leader.level === 'district') {
    return targetDistrict === leader.location.district;
  }
  
  // Sector leaders can create sector-wide (all cells) or cell-specific surveys in their sector
  if (leader.level === 'sector') {
    if (targetDistrict !== leader.location.district) return false;
    if (targetLevel === 'district') return false; // Can't target district-wide
    if (targetLevel === 'sector') return targetSector === leader.location.sector;
    if (targetLevel === 'cell') return targetSector === leader.location.sector;
    return false;
  }
  
  // Cell leaders can only create cell-specific surveys in their cell
  if (leader.level === 'cell') {
    if (targetDistrict !== leader.location.district) return false;
    if (targetSector !== leader.location.sector) return false;
    if (targetLevel === 'cell') return targetCell === leader.location.cell;
    return false; // Can't target sector or district-wide
  }
  
  return false;
};

// Topic-related functions for leaders
import { Topic } from '../types';

// Get topics that are relevant to a leader based on their level and location
export const getTopicsForLeader = (leader: Leader, allTopics: Topic[]): Topic[] => {
  return allTopics.filter(topic => {
    // If topic has no regional restriction, show to all leaders
    if (!topic.regionalRestriction) {
      return true;
    }
    
    const { level, district, sector, cell } = topic.regionalRestriction;
    const leaderLocation = leader.location;
    
    switch (level) {
      case 'district':
        return leaderLocation.district === district;
      case 'sector':
        return leaderLocation.district === district && leaderLocation.sector === sector;
      case 'cell':
        return leaderLocation.district === district && 
               leaderLocation.sector === sector && 
               leaderLocation.cell === cell;
      default:
        return true;
    }
  });
};

// Get topics created by a specific leader
export const getTopicsByLeader = (leaderId: string, allTopics: Topic[]): Topic[] => {
  return allTopics.filter(topic => topic.author.id === leaderId);
};

// Get trending topics for a leader's region
export const getTrendingTopicsForLeader = (leader: Leader, allTopics: Topic[]): Topic[] => {
  const relevantTopics = getTopicsForLeader(leader, allTopics);
  return relevantTopics.filter(topic => 
    topic.votes.length > 10 || topic.replies.length > 5
  ).sort((a, b) => 
    (b.votes.length + b.replies.length) - (a.votes.length + a.replies.length)
  );
};

// Check if a leader can create topics for a specific region
export const canCreateTopicForRegion = (leader: Leader, targetLevel: string, targetDistrict: string, targetSector?: string, targetCell?: string): boolean => {
  // District leaders can create topics for any level in their district
  if (leader.level === 'district') {
    return targetDistrict === leader.location.district;
  }
  
  // Sector leaders can create sector-wide or cell-specific topics in their sector
  if (leader.level === 'sector') {
    if (targetDistrict !== leader.location.district) return false;
    if (targetLevel === 'district') return false; // Can't target district-wide
    if (targetLevel === 'sector') return targetSector === leader.location.sector;
    if (targetLevel === 'cell') return targetSector === leader.location.sector;
    return false;
  }
  
  // Cell leaders can only create cell-specific topics in their cell
  if (leader.level === 'cell') {
    if (targetDistrict !== leader.location.district) return false;
    if (targetSector !== leader.location.sector) return false;
    if (targetLevel === 'cell') return targetCell === leader.location.cell;
    return false; // Can't target sector or district-wide
  }
  
  return false;
};

// Get topic statistics for a leader's region
export const getTopicStatsForLeader = (leader: Leader, allTopics: Topic[]) => {
  const relevantTopics = getTopicsForLeader(leader, allTopics);
  const leaderTopics = getTopicsByLeader(leader.id, allTopics);
  
  return {
    totalTopics: relevantTopics.length,
    leaderTopics: leaderTopics.length,
    activeDiscussions: relevantTopics.filter(t => t.replies.length > 5).length,
    totalReplies: relevantTopics.reduce((sum, t) => sum + t.replies.length, 0),
    totalVotes: relevantTopics.reduce((sum, t) => sum + t.votes.length, 0),
    trendingTopics: getTrendingTopicsForLeader(leader, allTopics).length
  };
};
