import { User, Issue, Topic, Announcement, Comment, GovernmentReply, Vote, Attachment, UserFollowUpResponse, Survey } from '../types';

export const users: User[] = [
  {
    id: '1',
    firstName: 'Marie',
    lastName: 'Uwimana',
    name: 'Marie Uwimana',
    email: 'marie.uwimana@citizen.rw',
    phoneNumber: '+250788123456',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    location: {
      district: 'Gasabo',
      sector: 'Kacyiru',
      cell: 'Kamatamu',
      village: 'Nyarutarama'
    },
    isGovernment: false,
    role: 'citizen',
    verified: true,
    joinedAt: new Date('2023-01-15'),
    reportedIssues: ['1'],
    createdTopics: ['1'],
  },
  {
    id: '2',
    firstName: 'Jean Baptiste',
    lastName: 'Nzeyimana',
    name: 'Jean Baptiste Nzeyimana',
    email: 'jean.nzeyimana@citizen.rw',
    phoneNumber: '+250788234567',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
    location: {
      district: 'Nyarugenge',
      sector: 'Nyamirambo',
      cell: 'Biryogo',
      village: 'Biryogo I'
    },
    isGovernment: false,
    role: 'citizen',
    verified: true,
    joinedAt: new Date('2023-02-20'),
    reportedIssues: ['2'],
    createdTopics: [],
  },
  {
    id: '3',
    firstName: 'Alice',
    lastName: 'Mukamana',
    name: 'Dr. Alice Mukamana',
    email: 'alice.mukamana@health.gov.rw',
    phoneNumber: '+250788345678',
    avatar: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=150',
    location: {
      district: 'Kicukiro',
      sector: 'Niboye',
      cell: 'Kagugu',
      village: 'Kagugu I'
    },
    isGovernment: true,
    department: 'Ministry of Health',
    role: 'government_official',
    verified: true,
    joinedAt: new Date('2022-06-10'),
    reportedIssues: [],
    createdTopics: [],
  },
  {
    id: '4',
    firstName: 'Paul',
    lastName: 'Kagame',
    name: 'Paul Kagame Office',
    email: 'communications@presidency.gov.rw',
    phoneNumber: '+250788456789',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
    location: {
      district: 'Kicukiro',
      sector: 'Gatenga',
      cell: 'Gatenga',
      village: 'Gatenga I'
    },
    isGovernment: true,
    department: 'Office of the President',
    role: 'government_official',
    verified: true,
    joinedAt: new Date('2022-01-01'),
    reportedIssues: [],
    createdTopics: [],
  },
  {
    id: '5',
    firstName: 'Grace',
    lastName: 'Nyirahabimana',
    name: 'Grace Nyirahabimana',
    email: 'grace.nyirahabimana@citizen.rw',
    phoneNumber: '+250788567890',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150',
    location: {
      district: 'Bugesera',
      sector: 'Rweru',
      cell: 'Rweru',
      village: 'Rweru I'
    },
    isGovernment: false,
    role: 'citizen',
    verified: true,
    joinedAt: new Date('2023-03-05'),
    reportedIssues: ['3'],
    createdTopics: [],
  },
  {
    id: '6',
    firstName: 'Robert',
    lastName: 'Munyakazi',
    name: 'Eng. Robert Munyakazi',
    email: 'robert.munyakazi@infrastructure.gov.rw',
    phoneNumber: '+250788678901',
    avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=150',
    location: {
      district: 'Gasabo',
      sector: 'Remera',
      cell: 'Rukiri I',
      village: 'Rukiri Ia'
    },
    isGovernment: true,
    department: 'Ministry of Infrastructure',
    role: 'government_official',
    verified: true,
    joinedAt: new Date('2022-08-15'),
    reportedIssues: [],
    createdTopics: [],
  },
];

const createVotes = (count: number, targetId: string, targetType: 'issue' | 'government_reply' | 'comment'): Vote[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `vote_${targetId}_${i}`,
    userId: users[Math.floor(Math.random() * users.length)].id,
    targetId,
    targetType,
    type: Math.random() > 0.3 ? 'up' : 'down',
    createdAt: new Date(Date.now() - Math.random() * 10000000000),
  }));
};

const createAttachments = (count: number, uploaderId: string): Attachment[] => {
  const attachmentTypes = [
    { 
      name: 'road_damage_photo.jpg', 
      type: 'image' as const, 
      mimeType: 'image/jpeg',
      size: 2048576,
      thumbnail: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    { 
      name: 'water_quality_report.pdf', 
      type: 'pdf' as const, 
      mimeType: 'application/pdf',
      size: 1024000,
      thumbnail: 'https://via.placeholder.com/300x200/f3f4f6/6b7280?text=PDF'
    },
    { 
      name: 'infrastructure_plan.pdf', 
      type: 'pdf' as const, 
      mimeType: 'application/pdf',
      size: 3072000,
      thumbnail: 'https://via.placeholder.com/300x200/f3f4f6/6b7280?text=PDF'
    },
    { 
      name: 'community_meeting.jpg', 
      type: 'image' as const, 
      mimeType: 'image/jpeg',
      size: 1536000,
      thumbnail: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=300'
    },
    { 
      name: 'project_presentation.mp4', 
      type: 'video' as const, 
      mimeType: 'video/mp4',
      size: 15728640,
      thumbnail: 'https://via.placeholder.com/300x200/3b82f6/ffffff?text=VIDEO'
    },
    { 
      name: 'announcement_audio.mp3', 
      type: 'audio' as const, 
      mimeType: 'audio/mpeg',
      size: 5242880,
      thumbnail: 'https://via.placeholder.com/300x200/10b981/ffffff?text=AUDIO'
    },
  ];

  return Array.from({ length: count }, (_, i) => {
    const template = attachmentTypes[i % attachmentTypes.length];
    return {
      id: `attachment_${Date.now()}_${i}`,
      name: template.name,
      url: `https://example.com/attachments/${template.name}`,
      type: template.type,
      mimeType: template.mimeType,
      size: template.size,
      uploadedBy: uploaderId,
      uploadedAt: new Date(Date.now() - Math.random() * 5000000000),
      thumbnail: template.thumbnail,
    };
  });
};

const createComment = (
  id: string, 
  content: string, 
  authorId: string, 
  targetId: string, 
  targetType: 'issue' | 'government_reply',
  parentId?: string
): Comment => ({
  id,
  content,
  author: users.find(u => u.id === authorId)!,
  createdAt: new Date(Date.now() - Math.random() * 10000000000),
  updatedAt: new Date(Date.now() - Math.random() * 5000000000),
  votes: createVotes(Math.floor(Math.random() * 15), id, 'comment'),
  replies: [],
  targetId,
  targetType,
  parentId,
  isModerated: false,
});

const createGovernmentReply = (
  id: string,
  content: string,
  authorId: string,
  issueId: string,
  responseStatus: 'final' | 'followup' = 'final',
  replyType: 'followup' | 'progress' | 'resolve' | 'escalation' = 'progress'
): GovernmentReply => ({
  id,
  content,
  author: users.find(u => u.id === authorId)!,
  issueId,
  createdAt: new Date(Date.now() - Math.random() * 8000000000),
  updatedAt: new Date(Date.now() - Math.random() * 4000000000),
  votes: createVotes(Math.floor(Math.random() * 25), id, 'government_reply'),
  comments: [],
  attachments: Math.random() > 0.7 ? createAttachments(1, authorId) : undefined,
  isOfficial: true,
  status: 'published',
  priority: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)] as 'low' | 'medium' | 'high',
  replyType,
  responseStatus,
  followUpResponse: undefined, // Will be populated separately for followup responses
});

// Create nested comments for government replies
const govReply1 = createGovernmentReply(
  'gr1',
  'Thank you for reporting this issue. We have inspected the road conditions on KG 15 Avenue and confirm that repair work is needed. Our infrastructure team has scheduled the repairs to begin next month. We will provide regular updates on the progress.',
  '3',
  '1',
  'final',
  'progress'
);

const govReply2 = createGovernmentReply(
  'gr2',
  'We need additional information about the specific locations and times when water supply is interrupted. Could you please provide more details about which areas are most affected and during which hours? This will help us prioritize our response.',
  '2',
  '2',
  'followup',
  'followup'
);

// Add follow-up response from user
govReply2.followUpResponse = {
  id: 'ufr1',
  content: 'The water supply is completely cut off in Nyamirambo center (near the market) every day from 6 AM to 10 AM and again from 6 PM to 10 PM. The residential areas around St. Famille Church are the worst affected. I have attached photos showing empty taps during these times.',
  author: users[1], // The user who reported the issue
  governmentReplyId: 'gr2',
  createdAt: new Date('2024-01-19'),
  attachments: createAttachments(2, '1'),
  isPrivate: true,
};

// Add comments to government replies
govReply1.comments = [
  createComment('gc1', 'Thank you for the quick response! When can we expect the repairs to be completed?', '1', 'gr1', 'government_reply'),
  createComment('gc2', 'This is exactly what we needed to hear. Great communication from the government!', '2', 'gr1', 'government_reply'),
];

govReply2.comments = [
  createComment('gc3', 'Where exactly are the temporary water distribution points? Can you provide more specific locations?', '5', 'gr2', 'government_reply'),
  createComment('gc4', 'My family has been affected by this. Thank you for setting up temporary distribution points.', '1', 'gr2', 'government_reply'),
];

// Add nested replies to comments
govReply1.comments[0].replies = [
  createComment('gcr1', 'Based on our current assessment, we estimate 3-4 weeks for complete repairs, weather permitting.', '6', 'gr1', 'government_reply', 'gc1'),
];

govReply2.comments[0].replies = [
  createComment('gcr2', 'The temporary distribution points are located at: 1) Nyamirambo Community Center 2) St. Paul Church 3) Nyamirambo Market. Operating hours: 6 AM - 8 PM daily.', '3', 'gr2', 'government_reply', 'gc3'),
];

export const issues: Issue[] = [
  {
    id: '1',
    title: 'Poor Road Conditions on KG 15 Ave',
    content: 'The road conditions on KG 15 Avenue have deteriorated significantly over the past few months. There are multiple large potholes causing damage to vehicles and making transportation extremely difficult. This affects daily commuters, businesses in the area, and emergency vehicle access. The situation has worsened after recent heavy rains, and immediate attention is needed.',
    author: users[0],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    status: 'in_progress',
    category: 'infrastructure',
    votes: createVotes(24, '1', 'issue'),
    followers: ['1', '2', '5'],
    comments: [
      createComment('c1', 'I completely agree! The situation has gotten much worse after the recent rains. My car was damaged last week.', '2', '1', 'issue'),
      createComment('c2', 'This road is a main artery for our community. The government needs to prioritize this repair.', '5', '1', 'issue'),
    ],
    governmentReplies: [govReply1],
    attachments: createAttachments(2, '1'),
    linkedIssues: ['2'],
    tags: ['roads', 'infrastructure', 'urgent', 'kg15'],
    priority: 'high',
    level: 'sector',
    location: {
      district: 'Gasabo',
      sector: 'Kacyiru',
      coordinates: { lat: -1.9441, lng: 30.0619 }
    },
    isModerated: false,
    viewCount: 156,
  },
  {
    id: '2',
    title: 'Water Supply Issues in Nyamirambo Sector',
    content: 'Residents in Nyamirambo sector have been experiencing irregular water supply for the past three weeks. Many households are completely without access to clean water during peak hours (6 AM - 10 AM and 6 PM - 10 PM). This is affecting families with young children and elderly residents the most. We need immediate intervention from WASAC and local authorities.',
    author: users[1],
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-22'),
    status: 'under_review',
    category: 'infrastructure',
    votes: createVotes(31, '2', 'issue'),
    followers: ['1', '2', '3', '5'],
    comments: [
      createComment('c3', 'My family has been buying water for three weeks now. This is becoming very expensive.', '5', '2', 'issue'),
      createComment('c4', 'The elderly in our community are struggling the most. We need emergency water distribution.', '1', '2', 'issue'),
    ],
    governmentReplies: [govReply2],
    attachments: createAttachments(1, '1'),
    linkedIssues: ['1'],
    tags: ['water', 'utilities', 'nyamirambo', 'wasac'],
    priority: 'urgent',
    level: 'district',
    location: {
      district: 'Nyarugenge',
      sector: 'Nyamirambo',
    },
    isModerated: false,
    viewCount: 203,
  },
  {
    id: '3',
    title: 'Need for More Healthcare Centers in Rural Areas',
    content: 'Many rural areas in our district lack adequate healthcare facilities, forcing residents to travel long distances for basic medical services. This is particularly challenging for elderly citizens, pregnant women, and families with young children. The nearest health center is over 15 kilometers away, and public transportation is limited. We propose establishing at least two additional health posts in our area.',
    author: users[4],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-25'),
    status: 'resolved',
    category: 'healthcare',
    votes: createVotes(18, '3', 'issue'),
    followers: ['1', '4', '5'],
    comments: [
      createComment('c5', 'This is a critical issue for our community. Pregnant women are at risk due to the distance.', '1', '3', 'issue'),
    ],
    governmentReplies: [
      createGovernmentReply(
        'gr3',
        'We are pleased to announce that funding has been approved for two new health centers in your area. Construction will begin in Q2 2024, with expected completion by end of year. In the meantime, we are arranging mobile health services to visit your community twice weekly.',
        '3',
        '3',
        'final',
        'resolve'
      ),
    ],
    linkedIssues: [],
    tags: ['healthcare', 'rural', 'access', 'health-centers'],
    priority: 'high',
    level: 'cell',
    location: {
      district: 'Bugesera',
      sector: 'Rweru',
    },
    isModerated: false,
    viewCount: 89,
  },
];

// Add nested replies to issue comments
issues[0].comments[0].replies = [
  createComment('cr1', 'Same here! I had to replace two tires because of the potholes.', '5', '1', 'issue', 'c1'),
];

issues[1].comments[0].replies = [
  createComment('cr2', 'Have you tried contacting WASAC directly? They have a hotline for emergencies.', '2', '2', 'issue', 'c3'),
];

export const topics: Topic[] = [
  {
    id: '1',
    content: 'Really excited about the new BRT system coming to Kigali! This will revolutionize public transport in our city and reduce traffic congestion significantly. #KigaliBRT #PublicTransport #SmartCity',
    author: users[0],
    createdAt: new Date('2024-01-20'),
    votes: createVotes(15, 't1', 'comment'),
    followers: ['2', '3'],
    replies: [
      {
        id: 'tr1',
        content: 'Absolutely! The traffic congestion will be significantly reduced. I can\'t wait to use it for my daily commute.',
        author: users[1],
        createdAt: new Date(Date.now() - 3600000),
        votes: createVotes(8, 'tr1', 'comment'),
        replies: [
          {
            id: 'tr1r1',
            content: 'Same here! My commute from Remera to town takes forever during rush hour.',
            author: users[3],
            createdAt: new Date(Date.now() - 3200000),
            votes: createVotes(4, 'tr1r1', 'comment'),
            replies: [],
            attachments: [
              {
                id: 'tr1r1_att1',
                name: 'traffic_photo.jpg',
                url: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=800',
                type: 'image',
                mimeType: 'image/jpeg',
                size: 1024000,
                uploadedBy: users[3].id,
                uploadedAt: new Date(Date.now() - 3200000),
                thumbnail: 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg?auto=compress&cs=tinysrgb&w=300'
              }
            ],
          },
          {
            id: 'tr1r2',
            content: 'The BRT will cut commute time by at least 40% according to the feasibility study.',
            author: users[4],
            createdAt: new Date(Date.now() - 2800000),
            votes: createVotes(6, 'tr1r2', 'comment'),
            replies: [
              {
                id: 'tr1r2r1',
                content: 'That\'s impressive! Do you have a link to that study?',
                author: users[2],
                createdAt: new Date(Date.now() - 2400000),
                votes: createVotes(2, 'tr1r2r1', 'comment'),
                replies: [],
              }
            ],
          }
        ],
      },
      {
        id: 'tr2',
        content: 'When is the expected launch date? I heard it might be delayed.',
        author: users[4],
        createdAt: new Date(Date.now() - 7200000),
        votes: createVotes(5, 'tr2', 'comment'),
        replies: [
          {
            id: 'trr1',
            content: 'According to the latest updates, Phase 1 should be operational by mid-2024.',
            author: users[0],
            createdAt: new Date(Date.now() - 3600000),
            votes: createVotes(3, 'trr1', 'comment'),
            replies: [],
          },
          {
            id: 'tr2r2',
            content: 'I work on the project. We\'re on track for Q2 2024 launch for the first route.',
            author: users[2],
            createdAt: new Date(Date.now() - 3000000),
            votes: createVotes(12, 'tr2r2', 'comment'),
            replies: [
              {
                id: 'tr2r2r1',
                content: 'That\'s great to hear from someone on the inside! Which route will be first?',
                author: users[1],
                createdAt: new Date(Date.now() - 2700000),
                votes: createVotes(3, 'tr2r2r1', 'comment'),
                replies: [],
              }
            ],
          }
        ],
      },
      {
        id: 'tr3new',
        content: 'What about accessibility features for people with disabilities?',
        author: users[5],
        createdAt: new Date(Date.now() - 5400000),
        votes: createVotes(7, 'tr3new', 'comment'),
        replies: [
          {
            id: 'tr3newr1',
            content: 'All BRT stations and buses will be fully wheelchair accessible with ramps and designated spaces.',
            author: users[2],
            createdAt: new Date(Date.now() - 4800000),
            votes: createVotes(9, 'tr3newr1', 'comment'),
            replies: [],
          }
        ],
      },
    ],
    hashtags: ['KigaliBRT', 'PublicTransport', 'SmartCity'],
    regionalRestriction: {
      level: 'district',
      district: 'Gasabo'
    }
  },
  {
    id: '2',
    content: 'Planning a community garden project in our sector. Who\'s interested in joining? We need volunteers for planning and implementation. #CommunityGarden #Agriculture #Sustainability',
    author: users[1],
    createdAt: new Date('2024-01-18'),
    votes: createVotes(12, 't2', 'comment'),
    followers: ['1', '5'],
    replies: [
      {
        id: 'tr3',
        content: 'Count me in! I have some experience with organic farming.',
        author: users[4],
        createdAt: new Date(Date.now() - 5400000),
        votes: createVotes(6, 'tr3', 'comment'),
        replies: [
          {
            id: 'tr3r1',
            content: 'Perfect! We definitely need someone with farming experience. Can you help with the soil preparation?',
            author: users[1],
            createdAt: new Date(Date.now() - 4800000),
            votes: createVotes(4, 'tr3r1', 'comment'),
            replies: [
              {
                id: 'tr3r1r1',
                content: 'Absolutely! I can also provide some seeds for vegetables and herbs.',
                author: users[4],
                createdAt: new Date(Date.now() - 4200000),
                votes: createVotes(5, 'tr3r1r1', 'comment'),
                replies: [],
              }
            ],
          }
        ],
      },
      {
        id: 'tr4new',
        content: 'This is a fantastic idea! I can contribute with tools and equipment.',
        author: users[0],
        createdAt: new Date(Date.now() - 4800000),
        votes: createVotes(8, 'tr4new', 'comment'),
        replies: [
          {
            id: 'tr4newr1',
            content: 'Thank you! Do you have shovels and watering cans?',
            author: users[1],
            createdAt: new Date(Date.now() - 4200000),
            votes: createVotes(3, 'tr4newr1', 'comment'),
            replies: [
              {
                id: 'tr4newr1r1',
                content: 'Yes, I have about 10 shovels and 5 watering cans. Also some wheelbarrows.',
                author: users[0],
                createdAt: new Date(Date.now() - 3600000),
                votes: createVotes(6, 'tr4newr1r1', 'comment'),
                replies: [],
              }
            ],
          }
        ],
      },
      {
        id: 'tr5new',
        content: 'Where exactly will this garden be located? I want to make sure I can participate regularly.',
        author: users[3],
        createdAt: new Date(Date.now() - 3600000),
        votes: createVotes(5, 'tr5new', 'comment'),
        replies: [
          {
            id: 'tr5newr1',
            content: 'We\'re looking at the empty lot behind the community center. Very accessible for everyone.',
            author: users[1],
            createdAt: new Date(Date.now() - 3000000),
            votes: createVotes(7, 'tr5newr1', 'comment'),
            replies: [],
          }
        ],
      }
    ],
    hashtags: ['CommunityGarden', 'Agriculture', 'Sustainability'],
    regionalRestriction: {
      level: 'sector',
      district: 'Nyarugenge',
      sector: 'Nyamirambo'
    }
  },
  {
    id: '3',
    content: 'Our cell is organizing a youth football tournament next month. Registration is now open! #YouthSports #Football #Community',
    author: users[5],
    createdAt: new Date('2024-01-22'),
    votes: createVotes(8, 't3', 'comment'),
    followers: ['2'],
    replies: [
      {
        id: 'tr4',
        content: 'Great initiative! When and where will the matches be held?',
        author: users[0],
        createdAt: new Date(Date.now() - 1800000),
        votes: createVotes(3, 'tr4', 'comment'),
        replies: [
          {
            id: 'tr4r1',
            content: 'Every Saturday and Sunday at the local stadium. Tournament runs for 3 weekends.',
            author: users[5],
            createdAt: new Date(Date.now() - 1200000),
            votes: createVotes(4, 'tr4r1', 'comment'),
            replies: [],
          }
        ],
      },
      {
        id: 'tr6new',
        content: 'What\'s the age limit? My son is 16, can he participate?',
        author: users[2],
        createdAt: new Date(Date.now() - 1500000),
        votes: createVotes(6, 'tr6new', 'comment'),
        replies: [
          {
            id: 'tr6newr1',
            content: 'Ages 14-18 are eligible. Your son can definitely join!',
            author: users[5],
            createdAt: new Date(Date.now() - 1200000),
            votes: createVotes(5, 'tr6newr1', 'comment'),
            replies: [
              {
                id: 'tr6newr1r1',
                content: 'Excellent! How do we register? Is there a fee?',
                author: users[2],
                createdAt: new Date(Date.now() - 900000),
                votes: createVotes(2, 'tr6newr1r1', 'comment'),
                replies: [],
              }
            ],
          }
        ],
      },
      {
        id: 'tr7new',
        content: 'Will there be prizes for the winners?',
        author: users[1],
        createdAt: new Date(Date.now() - 1200000),
        votes: createVotes(4, 'tr7new', 'comment'),
        replies: [
          {
            id: 'tr7newr1',
            content: 'Yes! Trophies for top 3 teams, plus sports equipment for the winning team.',
            author: users[5],
            createdAt: new Date(Date.now() - 900000),
            votes: createVotes(8, 'tr7newr1', 'comment'),
            replies: [],
          }
        ],
      }
    ],
    hashtags: ['YouthSports', 'Football', 'Community'],
    regionalRestriction: {
      level: 'cell',
      district: 'Bugesera',
      sector: 'Rweru',
      cell: 'Rweru'
    }
  },
  {
    id: '4',
    content: 'Digital literacy training sessions starting next week for all citizens. Free classes on basic computer skills and internet safety. #DigitalLiteracy #Education #Technology',
    author: users[2],
    createdAt: new Date('2024-01-25'),
    votes: createVotes(20, 't4', 'comment'),
    followers: ['1', '3', '4'],
    replies: [
      {
        id: 'tr8new',
        content: 'This is exactly what we needed! Where do I sign up?',
        author: users[0],
        createdAt: new Date(Date.now() - 2400000),
        votes: createVotes(12, 'tr8new', 'comment'),
        replies: [
          {
            id: 'tr8newr1',
            content: 'Registration is at the sector office or online at skills.gov.rw',
            author: users[2],
            createdAt: new Date(Date.now() - 2100000),
            votes: createVotes(8, 'tr8newr1', 'comment'),
            replies: [
              {
                id: 'tr8newr1r1',
                content: 'Just registered online! The interface is very user-friendly.',
                author: users[0],
                createdAt: new Date(Date.now() - 1800000),
                votes: createVotes(5, 'tr8newr1r1', 'comment'),
                replies: [],
                attachments: [
                  {
                    id: 'tr8newr1r1_att1',
                    name: 'registration_screenshot.pdf',
                    url: 'https://example.com/screenshots/registration_screenshot.pdf',
                    type: 'pdf',
                    mimeType: 'application/pdf',
                    size: 245000,
                    uploadedBy: users[0].id,
                    uploadedAt: new Date(Date.now() - 1800000),
                    thumbnail: 'https://via.placeholder.com/300x200/f3f4f6/6b7280?text=Screenshot'
                  }
                ],
              }
            ],
          }
        ],
      },
      {
        id: 'tr9new',
        content: 'What topics will be covered? I\'m particularly interested in internet safety.',
        author: users[3],
        createdAt: new Date(Date.now() - 2100000),
        votes: createVotes(9, 'tr9new', 'comment'),
        replies: [
          {
            id: 'tr9newr1',
            content: 'Topics include: Basic computing, internet browsing, email, online banking safety, and social media awareness.',
            author: users[2],
            createdAt: new Date(Date.now() - 1800000),
            votes: createVotes(11, 'tr9newr1', 'comment'),
            replies: [
              {
                id: 'tr9newr1r1',
                content: 'Perfect! Will there be separate sessions for seniors?',
                author: users[4],
                createdAt: new Date(Date.now() - 1500000),
                votes: createVotes(6, 'tr9newr1r1', 'comment'),
                replies: [],
              }
            ],
          }
        ],
      },
      {
        id: 'tr10new',
        content: 'How long is each session and how many sessions in total?',
        author: users[1],
        createdAt: new Date(Date.now() - 1800000),
        votes: createVotes(7, 'tr10new', 'comment'),
        replies: [
          {
            id: 'tr10newr1',
            content: '2-hour sessions, twice a week for 4 weeks. Total of 8 sessions per course.',
            author: users[2],
            createdAt: new Date(Date.now() - 1500000),
            votes: createVotes(9, 'tr10newr1', 'comment'),
            replies: [],
          }
        ],
      }
    ],
    hashtags: ['DigitalLiteracy', 'Education', 'Technology'],
    // No regional restriction - open to all
  },
];

export const announcements: Announcement[] = [
  {
    id: '1',
    title: 'New Digital ID Card Registration Opens',
    content: 'The Government of Rwanda announces the opening of digital ID card registration for all citizens. This new system will streamline identification processes and improve access to government services. Registration starts on February 1st, 2024, and will be available at all sector offices and online through the national portal.',
    author: users[3],
    createdAt: new Date('2024-01-25'),
    category: 'government',
    priority: 'important',
    targetAudience: ['all_citizens'],
    readBy: [], // No one has read this yet
    attachments: [
      {
        id: 'ann_att_1',
        name: 'digital_id_registration_guide.pdf',
        url: 'https://example.com/attachments/digital_id_registration_guide.pdf',
        type: 'pdf',
        mimeType: 'application/pdf',
        size: 2560000,
        uploadedBy: users[3].id,
        uploadedAt: new Date('2024-01-25'),
        thumbnail: 'https://via.placeholder.com/300x200/f3f4f6/6b7280?text=Registration+Guide'
      },
      {
        id: 'ann_att_2',
        name: 'id_card_sample.jpg',
        url: 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=800',
        type: 'image',
        mimeType: 'image/jpeg',
        size: 1024000,
        uploadedBy: users[3].id,
        uploadedAt: new Date('2024-01-25'),
        thumbnail: 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=300'
      }
    ],
  },
  {
    id: '2',
    title: 'COVID-19 Vaccination Campaign Update',
    content: 'The Ministry of Health announces a new phase of COVID-19 vaccination targeting children aged 5-11. Vaccination will be available at all health centers starting next week. Parents are encouraged to bring their children for vaccination. Please bring birth certificates and health insurance cards.',
    author: users[2],
    createdAt: new Date('2024-01-23'),
    category: 'healthcare',
    priority: 'urgent',
    targetAudience: ['parents', 'guardians'],
    expiresAt: new Date('2024-03-01'),
    readBy: ['1'], // User 1 has already read this
    attachments: [
      {
        id: 'ann_att_3',
        name: 'vaccination_centers_map.jpg',
        url: 'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=800',
        type: 'image',
        mimeType: 'image/jpeg',
        size: 1536000,
        uploadedBy: users[2].id,
        uploadedAt: new Date('2024-01-23'),
        thumbnail: 'https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=300'
      },
      {
        id: 'ann_att_4',
        name: 'vaccination_info_video.mp4',
        url: 'https://example.com/videos/vaccination_info.mp4',
        type: 'video',
        mimeType: 'video/mp4',
        size: 25165824,
        uploadedBy: users[2].id,
        uploadedAt: new Date('2024-01-23'),
        thumbnail: 'https://via.placeholder.com/300x200/3b82f6/ffffff?text=Vaccination+Info+Video'
      },
      {
        id: 'ann_att_5',
        name: 'vaccination_schedule.pdf',
        url: 'https://example.com/attachments/vaccination_schedule.pdf',
        type: 'pdf',
        mimeType: 'application/pdf',
        size: 512000,
        uploadedBy: users[2].id,
        uploadedAt: new Date('2024-01-23'),
        thumbnail: 'https://via.placeholder.com/300x200/f3f4f6/6b7280?text=Vaccination+Schedule'
      }
    ],
  },
  {
    id: '3',
    title: 'Road Construction Project - Phase 2',
    content: 'The Ministry of Infrastructure announces the commencement of Phase 2 of the national road construction project. This phase will focus on improving rural connectivity and will affect several districts over the next 18 months.',
    author: users[5],
    createdAt: new Date('2024-01-20'),
    category: 'infrastructure',
    priority: 'normal',
    targetAudience: ['rural_communities', 'transport_operators'],
    readBy: ['1', '2', '3'], // Multiple users have read this
    attachments: [
      {
        id: 'ann_att_6',
        name: 'project_overview_presentation.mp4',
        url: 'https://example.com/videos/road_project_overview.mp4',
        type: 'video',
        mimeType: 'video/mp4',
        size: 52428800,
        uploadedBy: users[5].id,
        uploadedAt: new Date('2024-01-20'),
        thumbnail: 'https://via.placeholder.com/300x200/3b82f6/ffffff?text=Project+Overview'
      },
      {
        id: 'ann_att_7',
        name: 'construction_timeline.pdf',
        url: 'https://example.com/attachments/construction_timeline.pdf',
        type: 'pdf',
        mimeType: 'application/pdf',
        size: 1048576,
        uploadedBy: users[5].id,
        uploadedAt: new Date('2024-01-20'),
        thumbnail: 'https://via.placeholder.com/300x200/f3f4f6/6b7280?text=Timeline'
      }
    ],
  },
];

// Follow-up responses for government replies
export const userFollowUpResponses: UserFollowUpResponse[] = [
  {
    id: '1',
    content: 'Thank you for the quick response! The traffic lights have indeed helped with safety. However, we still need better street lighting in the evenings.',
    author: users[0],
    governmentReplyId: '1',
    createdAt: new Date('2024-02-28T18:30:00Z'),
    isPrivate: true,
  },
  {
    id: '2',
    content: 'The temporary repairs were helpful, but we need a permanent solution. The road still has many deep potholes.',
    author: users[1],
    governmentReplyId: '2',
    createdAt: new Date('2024-02-29T09:15:00Z'),
    isPrivate: true,
  },
];

// Surveys data
export const surveys: Survey[] = [
  {
    id: '1',
    title: 'Community Healthcare Needs Assessment',
    description: 'Help us understand the healthcare needs in our community. Your responses will help shape future healthcare initiatives and improve access to medical services in our area.',
    author: users[3], // Government official
    createdAt: new Date('2024-02-15T10:00:00Z'),
    updatedAt: new Date('2024-02-15T10:00:00Z'),
    status: 'active',
    category: 'government_survey',
    targetAudience: ['general_public'],
    isPublic: true,
    viewCount: 234,
    questions: [
      {
        id: '1',
        type: 'multiple_choice',
        title: 'What is your age range?',
        required: true,
        options: ['18-25', '26-35', '36-45', '46-55', '56-65', '65+']
      },
      {
        id: '2',
        type: 'multiple_choice',
        title: 'How would you rate the availability of healthcare services in your area?',
        required: true,
        options: ['Excellent', 'Good', 'Fair', 'Poor', 'Very Poor']
      },
      {
        id: '3',
        type: 'checkbox',
        title: 'What types of healthcare services do you think are most needed in our community? (Select all that apply)',
        required: true,
        options: [
          'Primary Care Physicians',
          'Specialists',
          'Mental Health Services',
          'Emergency Care',
          'Dental Services',
          'Vision Care',
          'Pharmacy Services',
          'Home Care Services'
        ]
      },
      {
        id: '4',
        type: 'rating',
        title: 'How satisfied are you with the current wait times for appointments?',
        required: true,
        maxRating: 5
      },
      {
        id: '5',
        type: 'yes_no',
        title: 'Do you have health insurance coverage?',
        required: true
      },
      {
        id: '6',
        type: 'long_text',
        title: 'What specific improvements would you like to see in our local healthcare system?',
        required: false,
        description: 'Please share any specific suggestions or concerns you have about healthcare in our community.'
      }
    ],
    settings: {
      allowAnonymous: false,
      allowMultipleResponses: false,
      requireLogin: true,
      showResults: false,
      expiresAt: new Date('2024-04-15T23:59:59Z')
    },
    responses: [
      {
        id: '1',
        surveyId: '1',
        userId: '1',
        submittedAt: new Date('2024-02-20T14:30:00Z'),
        answers: {
          '1': '26-35',
          '2': 'Fair',
          '3': ['Primary Care Physicians', 'Mental Health Services', 'Dental Services'],
          '4': 2,
          '5': 'yes',
          '6': 'We desperately need more mental health professionals and shorter wait times for appointments.'
        }
      },
      {
        id: '2',
        surveyId: '1',
        userId: '2',
        submittedAt: new Date('2024-02-22T09:15:00Z'),
        answers: {
          '1': '36-45',
          '2': 'Poor',
          '3': ['Specialists', 'Emergency Care', 'Pharmacy Services'],
          '4': 1,
          '5': 'no',
          '6': 'More specialists are needed. I had to wait 3 months to see a cardiologist.'
        }
      }
    ],
    attachments: [
      {
        id: '1',
        name: 'Healthcare Statistics 2024.pdf',
        url: '/api/files/healthcare-stats-2024.pdf',
        type: 'document',
        size: 2500000,
        uploadedBy: users[3].id,
        uploadedAt: new Date('2024-02-15T10:00:00Z'),
      }
    ]
  },
  {
    id: '2',
    title: 'Public Transportation Feedback',
    description: 'We want to improve our public transportation system. Please share your experiences and suggestions for better bus routes, schedules, and services.',
    author: users[3], // Government official
    createdAt: new Date('2024-02-20T16:00:00Z'),
    updatedAt: new Date('2024-02-20T16:00:00Z'),
    status: 'active',
    category: 'community_feedback',
    targetAudience: ['commuters', 'general_public'],
    isPublic: true,
    viewCount: 156,
    questions: [
      {
        id: '1',
        type: 'multiple_choice',
        title: 'How often do you use public transportation?',
        required: true,
        options: ['Daily', 'Weekly', 'Monthly', 'Rarely', 'Never']
      },
      {
        id: '2',
        type: 'rating',
        title: 'Rate your overall satisfaction with current bus services',
        required: true,
        maxRating: 10
      },
      {
        id: '3',
        type: 'checkbox',
        title: 'What are the main issues you face with public transportation? (Select all that apply)',
        required: false,
        options: [
          'Long wait times',
          'Crowded buses',
          'Poor route coverage',
          'Unreliable schedules',
          'High fares',
          'Uncomfortable buses',
          'Safety concerns',
          'Limited weekend/night service'
        ]
      },
      {
        id: '4',
        type: 'short_text',
        title: 'Which area do you think needs better bus coverage?',
        required: false
      },
      {
        id: '5',
        type: 'long_text',
        title: 'Any additional suggestions for improving public transportation?',
        required: false
      }
    ],
    settings: {
      allowAnonymous: true,
      allowMultipleResponses: true,
      requireLogin: true,
      showResults: true,
      expiresAt: new Date('2024-05-20T23:59:59Z')
    },
    responses: [
      {
        id: '3',
        surveyId: '2',
        userId: '1',
        submittedAt: new Date('2024-02-25T11:20:00Z'),
        answers: {
          '1': 'Daily',
          '2': 6,
          '3': ['Long wait times', 'Crowded buses', 'Limited weekend/night service'],
          '4': 'Downtown area needs more frequent buses',
          '5': 'Consider adding express routes during rush hours and improve real-time bus tracking.'
        }
      }
    ]
  },
  {
    id: '3',
    title: 'Community Safety Survey',
    description: 'Help us understand safety concerns in our neighborhood and identify areas that need improvement for better community security.',
    author: users[0], // Regular user
    createdAt: new Date('2024-02-25T12:00:00Z'),
    updatedAt: new Date('2024-02-25T12:00:00Z'),
    status: 'active',
    category: 'public_opinion',
    targetAudience: ['residents', 'community_members'],
    isPublic: true,
    viewCount: 89,
    questions: [
      {
        id: '1',
        type: 'rating',
        title: 'How safe do you feel in your neighborhood during the day?',
        required: true,
        maxRating: 5
      },
      {
        id: '2',
        type: 'rating',
        title: 'How safe do you feel in your neighborhood at night?',
        required: true,
        maxRating: 5
      },
      {
        id: '3',
        type: 'checkbox',
        title: 'What safety improvements would you like to see? (Select all that apply)',
        required: true,
        options: [
          'Better street lighting',
          'More police patrols',
          'Security cameras',
          'Neighborhood watch programs',
          'Better maintained sidewalks',
          'Traffic calming measures',
          'Emergency call boxes'
        ]
      },
      {
        id: '4',
        type: 'yes_no',
        title: 'Have you experienced or witnessed any safety incidents in the past year?',
        required: true
      },
      {
        id: '5',
        type: 'long_text',
        title: 'Please describe any specific safety concerns or incidents (optional)',
        required: false,
        description: 'Your responses will help us prioritize safety improvements.'
      }
    ],
    settings: {
      allowAnonymous: false,
      allowMultipleResponses: false,
      requireLogin: true,
      showResults: false
    },
    responses: []
  },
  {
    id: '4',
    title: 'Local Business Support Initiative',
    description: 'We are exploring ways to support local businesses. Your input will help us develop programs that benefit our local economy and business community.',
    author: users[1], // Another user
    createdAt: new Date('2024-02-28T09:00:00Z'),
    updatedAt: new Date('2024-02-28T09:00:00Z'),
    status: 'draft',
    category: 'research',
    targetAudience: ['business_owners', 'entrepreneurs', 'residents'],
    isPublic: true,
    viewCount: 45,
    questions: [
      {
        id: '1',
        type: 'multiple_choice',
        title: 'Are you a local business owner?',
        required: true,
        options: ['Yes, I own a business', 'Yes, I work for a local business', 'No, but I support local businesses', 'No, I rarely shop locally']
      },
      {
        id: '2',
        type: 'checkbox',
        title: 'What types of support do you think local businesses need most?',
        required: true,
        options: [
          'Financial assistance/grants',
          'Marketing support',
          'Training programs',
          'Networking opportunities',
          'Reduced regulations',
          'Better parking/accessibility',
          'Online presence help',
          'Tax incentives'
        ]
      },
      {
        id: '3',
        type: 'rating',
        title: 'How would you rate the current business climate in our area?',
        required: true,
        maxRating: 5
      },
      {
        id: '4',
        type: 'long_text',
        title: 'What specific programs or initiatives would you like to see to support local businesses?',
        required: false
      }
    ],
    settings: {
      allowAnonymous: true,
      allowMultipleResponses: false,
      requireLogin: true,
      showResults: true
    },
    responses: []
  },
  {
    id: '5',
    title: 'Parks and Recreation Needs',
    description: 'Help us plan future park developments and recreational activities. Tell us what facilities and programs you\'d like to see in our community parks.',
    author: users[3], // Government official
    createdAt: new Date('2024-01-15T14:00:00Z'),
    updatedAt: new Date('2024-01-15T14:00:00Z'),
    status: 'closed',
    category: 'government_survey',
    targetAudience: ['families', 'residents', 'youth'],
    isPublic: true,
    viewCount: 312,
    questions: [
      {
        id: '1',
        type: 'checkbox',
        title: 'What recreational facilities are you most interested in?',
        required: true,
        options: [
          'Playground equipment',
          'Sports courts (basketball, tennis)',
          'Walking/jogging trails',
          'Dog park',
          'Picnic areas',
          'Community garden',
          'Fitness equipment',
          'Swimming pool'
        ]
      },
      {
        id: '2',
        type: 'multiple_choice',
        title: 'How often do you visit local parks?',
        required: true,
        options: ['Daily', 'Weekly', 'Monthly', 'Rarely', 'Never']
      },
      {
        id: '3',
        type: 'rating',
        title: 'Rate the current condition of our parks',
        required: true,
        maxRating: 5
      }
    ],
    settings: {
      allowAnonymous: false,
      allowMultipleResponses: false,
      requireLogin: true,
      showResults: true,
      expiresAt: new Date('2024-02-15T23:59:59Z')
    },
    responses: [
      {
        id: '4',
        surveyId: '5',
        userId: '2',
        submittedAt: new Date('2024-02-10T16:45:00Z'),
        answers: {
          '1': ['Walking/jogging trails', 'Dog park', 'Playground equipment'],
          '2': 'Weekly',
          '3': 3
        }
      },
      {
        id: '5',
        surveyId: '5',
        userId: '1',
        submittedAt: new Date('2024-02-12T10:30:00Z'),
        answers: {
          '1': ['Community garden', 'Picnic areas', 'Fitness equipment'],
          '2': 'Monthly',
          '3': 4
        }
      }
    ]
  },
  {
    id: '6',
    title: 'Which public transport improvement should be prioritized?',
    description: 'Quick poll: Help us decide which transportation improvement project should receive funding priority this year.',
    author: users[3], // Government official
    createdAt: new Date('2024-03-01T09:00:00Z'),
    updatedAt: new Date('2024-03-01T09:00:00Z'),
    status: 'active',
    category: 'poll',
    targetAudience: ['commuters', 'general_public'],
    isPublic: true,
    viewCount: 89,
    questions: [
      {
        id: '1',
        type: 'multiple_choice',
        title: 'Which improvement should be our top priority?',
        required: true,
        options: [
          'More bus routes to suburban areas',
          'Extended operating hours (24/7 service)',
          'New light rail system',
          'Better bus stops with shelters',
          'Real-time arrival information system'
        ]
      }
    ],
    settings: {
      allowAnonymous: true,
      allowMultipleResponses: false,
      requireLogin: false,
      showResults: true,
      expiresAt: new Date('2024-03-31T23:59:59Z')
    },
    responses: [
      {
        id: '6',
        surveyId: '6',
        userId: '1',
        submittedAt: new Date('2024-03-02T14:20:00Z'),
        answers: {
          '1': 'Extended operating hours (24/7 service)'
        }
      },
      {
        id: '7',
        surveyId: '6',
        userId: '2',
        submittedAt: new Date('2024-03-02T16:35:00Z'),
        answers: {
          '1': 'New light rail system'
        }
      },
      {
        id: '8',
        surveyId: '6',
        userId: '4',
        submittedAt: new Date('2024-03-03T11:10:00Z'),
        answers: {
          '1': 'More bus routes to suburban areas'
        }
      }
    ]
  },
  {
    id: '7',
    title: 'Best Time for Community Events',
    description: 'When should we schedule our monthly community gatherings? Your vote will help us pick the most convenient time for everyone.',
    author: users[1], // Community member
    createdAt: new Date('2024-03-05T15:00:00Z'),
    updatedAt: new Date('2024-03-05T15:00:00Z'),
    status: 'active',
    category: 'poll',
    targetAudience: ['residents', 'families'],
    isPublic: true,
    viewCount: 156,
    questions: [
      {
        id: '1',
        type: 'multiple_choice',
        title: 'What day of the week works best for you?',
        required: true,
        options: ['Saturday Morning', 'Saturday Evening', 'Sunday Afternoon', 'Friday Evening', 'Weekday Evening']
      },
      {
        id: '2',
        type: 'yes_no',
        title: 'Would you attend if childcare was provided?',
        required: false
      }
    ],
    settings: {
      allowAnonymous: true,
      allowMultipleResponses: false,
      requireLogin: false,
      showResults: true,
      expiresAt: new Date('2024-03-20T23:59:59Z')
    },
    responses: [
      {
        id: '9',
        surveyId: '7',
        userId: '1',
        submittedAt: new Date('2024-03-06T10:15:00Z'),
        answers: {
          '1': 'Saturday Morning',
          '2': 'yes'
        }
      },
      {
        id: '10',
        surveyId: '7',
        userId: '5',
        submittedAt: new Date('2024-03-06T18:45:00Z'),
        answers: {
          '1': 'Sunday Afternoon',
          '2': 'no'
        }
      }
    ]
  },
  {
    id: '8',
    title: 'Favorite Local Business Type',
    description: 'Quick poll: What type of business would you most like to see open in our downtown area?',
    author: users[0], // Community member
    createdAt: new Date('2024-03-08T12:30:00Z'),
    updatedAt: new Date('2024-03-08T12:30:00Z'),
    status: 'active',
    category: 'poll',
    targetAudience: ['residents', 'business_owners'],
    isPublic: true,
    viewCount: 203,
    questions: [
      {
        id: '1',
        type: 'multiple_choice',
        title: 'Which business would benefit our community most?',
        required: true,
        options: [
          'Coffee Shop/Café',
          'Bookstore',
          'Fitness Center/Gym',
          'Art Gallery',
          'Farmers Market Space',
          'Coworking Space',
          'Restaurant',
          'Retail Store'
        ]
      }
    ],
    settings: {
      allowAnonymous: true,
      allowMultipleResponses: false,
      requireLogin: false,
      showResults: true
    },
    responses: [
      {
        id: '11',
        surveyId: '8',
        userId: '2',
        submittedAt: new Date('2024-03-08T14:20:00Z'),
        answers: {
          '1': 'Coffee Shop/Café'
        }
      },
      {
        id: '12',
        surveyId: '8',
        userId: '3',
        submittedAt: new Date('2024-03-09T09:15:00Z'),
        answers: {
          '1': 'Bookstore'
        }
      },
      {
        id: '13',
        surveyId: '8',
        userId: '4',
        submittedAt: new Date('2024-03-09T16:30:00Z'),
        answers: {
          '1': 'Coffee Shop/Café'
        }
      },
      {
        id: '14',
        surveyId: '8',
        userId: '5',
        submittedAt: new Date('2024-03-10T11:45:00Z'),
        answers: {
          '1': 'Farmers Market Space'
        }
      }
    ]
  },
  {
    id: '9',
    title: 'Weekend Activity Preference',
    description: 'Help us plan community weekend activities! Vote for your preferred type of weekend event.',
    author: users[2], // Community member
    createdAt: new Date('2024-03-12T10:00:00Z'),
    updatedAt: new Date('2024-03-12T10:00:00Z'),
    status: 'closed',
    category: 'poll',
    targetAudience: ['families', 'youth', 'seniors'],
    isPublic: true,
    viewCount: 178,
    questions: [
      {
        id: '1',
        type: 'multiple_choice',
        title: 'What type of weekend activity interests you most?',
        required: true,
        options: [
          'Outdoor Sports Tournaments',
          'Arts and Crafts Workshops',
          'Live Music Performances',
          'Food Festivals',
          'Educational Seminars',
          'Movie Nights',
          'Fitness Classes'
        ]
      },
      {
        id: '2',
        type: 'rating',
        title: 'How likely are you to attend community events?',
        required: true,
        maxRating: 5
      }
    ],
    settings: {
      allowAnonymous: true,
      allowMultipleResponses: false,
      requireLogin: false,
      showResults: true,
      expiresAt: new Date('2024-03-25T23:59:59Z')
    },
    responses: [
      {
        id: '15',
        surveyId: '9',
        userId: '1',
        submittedAt: new Date('2024-03-13T15:20:00Z'),
        answers: {
          '1': 'Food Festivals',
          '2': 4
        }
      },
      {
        id: '16',
        surveyId: '9',
        userId: '2',
        submittedAt: new Date('2024-03-14T12:10:00Z'),
        answers: {
          '1': 'Live Music Performances',
          '2': 5
        }
      },
      {
        id: '17',
        surveyId: '9',
        userId: '3',
        submittedAt: new Date('2024-03-15T09:30:00Z'),
        answers: {
          '1': 'Arts and Crafts Workshops',
          '2': 3
        }
      },
      {
        id: '18',
        surveyId: '9',
        userId: '4',
        submittedAt: new Date('2024-03-16T17:45:00Z'),
        answers: {
          '1': 'Food Festivals',
          '2': 4
        }
      },
      {
        id: '19',
        surveyId: '9',
        userId: '5',
        submittedAt: new Date('2024-03-18T14:25:00Z'),
        answers: {
          '1': 'Outdoor Sports Tournaments',
          '2': 5
        }
      }
    ]
  }
];