// Types for the application

// Core user and authentication types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  phoneNumber: string;
  email: string;
  profileUrl?: string;
  role: Role | UserRole; // Accept both Role object and UserRole string
  location?: Location;
  language?: Language;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface Location {
  district: string;
  sector: string;
  cell: string;
  village: string;
  latitude?: number;
  longitude?: number;
}

// Authentication types
export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserResponseDto;
}

export interface TokenRefreshRequestDto {
  refreshToken: string;
}

export interface TokenRefreshResponseDto {
  accessToken: string;
  refreshToken: string;
}

export interface UserResponseDto {
  id: number;
  firstName: string;
  lastName: string;
  middleName?: string;
  phoneNumber: string;
  email: string;
  profileUrl?: string;
  role: UserRole;
  accountStatus?: AccountStatus;
  canLogin: boolean;
  department?: DepartmentResponseDto;
  location?: LocationResponseDto;
  leadershipLevelName?: string;
}

export interface LocationResponseDto {
  id: number;
  district: string;
  sector?: string;
  cell?: string;
  village?: string;
  latitude?: number;
  longitude?: number;
}

export interface LoginRequestDto {
  emailOrPhone: string;
  password: string;
}

export interface RegisterRequestDto {
  email: string;
  password: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  middleName?: string;
}

// Profile completion types
export interface UserProfileCompletionRequestDto {
  profileUrl?: string;
  level?: Level | null;
  location: LocationRequestDto;
}

export interface LocationRequestDto {
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
  latitude?: number;
  longitude?: number;
}

// New response-related types
export enum PostType {
  ISSUE = 'ISSUE',
  RESPONSE = 'RESPONSE',
  COMMENT = 'COMMENT',
  TOPIC = 'TOPIC',
  TOPIC_REPLY = 'TOPIC_REPLY',
  POLL = 'POLL',
  SURVEY = 'SURVEY',
  SURVEY_QUESTION = 'SURVEY_QUESTION'
}

export enum ResponseStatus {
  FOLLOW_UP = 'FOLLOW_UP',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  REJECTED = 'REJECTED',
  ESCALATED = 'ESCALATED'
}

export enum AttachmentType {
  PHOTO = 'PHOTO',
  PDF = 'PDF',
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO'
}

export interface AttachmentRequestDto {
  url: string;
  type: AttachmentType;
  description?: string;
}

export interface AttachmentResponseDto {
  id: number;
  url: string;
  type: AttachmentType;
  description?: string;
  uploadedAt?: string;
}

export interface ResponseRequestDto {
  postType: PostType;
  postId: number;
  message?: string;
  language?: Language;
  isPublic?: boolean;
  status?: ResponseStatus;
  attachments?: AttachmentRequestDto[];
}

export interface ResponseResponseDto {
  id: number;
  postType: PostType;
  postId: number;
  responder: UserResponseDto;
  message?: string;
  language?: Language;
  isPublic: boolean;
  createdAt: string;
  status: ResponseStatus;
  attachments: AttachmentResponseDto[];
  comments: CommentResponseDto[];
  children?: ResponseResponseDto[]; // Child responses (responses to responses)
  parent?: ResponseResponseDto; // Parent response
  upvoteCount: number;
  downvoteCount: number;
  hasUpvoted: boolean;
  hasDownvoted: boolean;
  averageRating?: number; // Rating from 1-5, null if user hasn't rated yet
}

// Core data types
export interface Vote {
  id: string;
  userId: string;
  targetId: string;
  targetType: 'issue' | 'government_reply' | 'comment';
  type: 'up' | 'down';
  createdAt: Date;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'pdf' | 'document' | 'audio';
  mimeType?: string;
  size: number;
  uploadedBy: string;
  uploadedAt: Date;
  thumbnail?: string;
}

// Comment types
export interface CommentRequestDto {
  text: string;
  isPrivate: boolean;
  userId: number;
  postId: number;
  postType: PostType;
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  postId: number;
  postType: PostType;
  user: UserResponseDto;
  children: Comment[];
  hasvoted: boolean;
  upvotes: number;
  downvotes: number;
}

export interface CommentResponseDto {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  postId: number;
  postType: PostType;
  user: UserResponseDto;
  children: CommentResponseDto[];
  hasvoted: boolean;
  upvotes: number;
  downvotes: number;
}

export interface GovernmentReply {
  id: string;
  content: string;
  author: User;
  issueId: string;
  createdAt: Date;
  updatedAt: Date;
  votes: Vote[];
  comments: Comment[];
  attachments?: Attachment[];
  isOfficial: boolean;
  status: 'draft' | 'published' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  replyType: 'followup' | 'progress' | 'resolve' | 'escalation';
  responseStatus: 'final' | 'followup';
  followUpResponse?: UserFollowUpResponse;
  escalationReason?: string;
  escalationTarget?: string;
}

export interface UserFollowUpResponse {
  id: string;
  content: string;
  author: User;
  governmentReplyId: string;
  createdAt: Date;
  attachments?: Attachment[];
  isPrivate: boolean;
}

// Issue types
export type IssueType = 'POSITIVE_REVIEW' | 'NEGATIVE_ISSUE' | 'SUGGESTION';

export interface IssueRequestDto {
  title: string;
  description: string;
  language: Language;
  issueType: IssueType;
  category: string;
  isPrivate?: boolean;
  createdById: number;
  assignedToId?: number;
  location?: LocationRequestDto;
  attachments?: AttachmentRequestDto[];
}

// Pagination types
export interface Page<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  empty: boolean;
}

// Backend DTO types
export interface IssueResponseDto {
  id: number;
  title: string;
  description: string;
  language: Language;
  category: string;
  issueType: IssueType;
  ticketId: string;
  createdBy: UserResponseDto;
  assignedTo?: UserResponseDto;
  location?: LocationResponseDto;
  attachments: AttachmentResponseDto[];
  responses: ResponseResponseDto[];
  comments: CommentResponseDto[];
  parent?: IssueResponseDto;
  links: IssueResponseDto[];
  status: string;
  urgency: string;
  level: string | null;
  likes: number;
  followers: number;
  likedByUser: boolean; // Backend returns this field name
  followedByUser: boolean; // Backend returns this field name
  private: boolean; // Backend returns this field name
  createdAt: string;
  updatedAt: string;
}

export interface CommentResponseDto {
  id: number;
  content: string;
  author: UserResponseDto;
  createdAt: string;
  updatedAt: string;
  parentId?: number;
  replies: CommentResponseDto[];
  likes: number;
  isLikedByUser: boolean;
}

// Frontend Issue interface (compatible with backend DTO)
export interface Issue {
  id: number;
  title: string;
  description: string;
  language: Language;
  category: string;
  issueType: IssueType;
  ticketId?: string;
  createdBy: UserResponseDto;
  assignedTo?: UserResponseDto;
  location: LocationResponseDto;
  attachments: AttachmentResponseDto[];
  responses: ResponseResponseDto[];
  comments: CommentResponseDto[];
  parent?: Issue;
  links?: Issue[];
  status: string; // Use string to match backend DTO
  urgency: string; // Use string to match backend DTO
  level: string | null;
  likes: number;
  followers: number;
  likedByUser: boolean; // Match backend field name
  followedByUser: boolean; // Match backend field name
  private: boolean; // Match backend field name
  createdAt: string;
  updatedAt: string;
}

// Topic types
export interface Topic {
  id: string;
  title: string;
  description: string;
  content?: string; // Legacy field for backward compatibility
  author: User;
  createdAt: Date;
  votes: Vote[];
  followers: string[];
  replies: TopicReply[];
  attachments?: Attachment[];
  tags: string[];
  hashtags?: string[]; // Legacy field for backward compatibility
  language: Language;
  regionalRestriction?: {
    level: 'district' | 'sector' | 'cell';
    district?: string;
    sector?: string;
    cell?: string;
  };
  focusLocation?: LocationRequestDto;
  upvoteCount?: number;
  downvoteCount?: number;
  followerCount?: number;
  replycount?: number;
}

export interface TopicRequestDto {
  title: string;
  description: string;
  tags?: string[];
  language: Language;
  focusLocation?: LocationRequestDto;
  taggedUserIds?: number[];
  attachments?: AttachmentRequestDto[];
}

export interface TopicResponseDto {
  id: number;
  title: string;
  description: string;
  tags: string[];
  createdBy: UserResponseDto;
  language: Language;
  focusLocation?: LocationResponseDto;
  taggedUsers: UserResponseDto[];
  createdAt: string;
  updatedAt: string;
  focusLevel: string;
  location: LocationResponseDto;
  attachments: AttachmentResponseDto[];
  upvoteCount: number;
  downvoteCount: number;
  hasUpvoted: boolean;
  hasDownvoted: boolean;
  followerCount: number;
  hasRegionalFocus: boolean;
  replycount: number;
}

export interface PaginatedTopicsResponse {
  content: TopicResponseDto[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  empty: boolean;
}

export interface TopicReply {
  id: string;
  content: string;
  author: User;
  createdAt: Date;
  votes: Vote[];
  replies: TopicReply[];
  attachments?: Attachment[];
  parentId?: string;
}

// New API DTOs for topic replies
export interface TopicReplyRequestDto {
  description: string;
  tags?: string[];
  language: Language;
  topicId: number;
  parentReplyId?: number;
  attachments?: AttachmentRequestDto[];
}

export interface TopicReplyResponseDto {
  id: number;
  description: string;
  tags: string[];
  createdBy: UserResponseDto;
  language: Language;
  topicId: number;
  parentReplyId?: number;
  childReplies: TopicReplyResponseDto[];
  createdAt: string;
  updatedAt: string;
  attachments: AttachmentResponseDto[];
  upvoteCount: number;
  downvoteCount: number;
  replyDepth: number;
  hasUpvoted: boolean;
  hasDownvoted: boolean;
}

// Announcement DTOs
export interface AnnouncementRequestDto {
  title: string;
  description: string;
  language: Language;
  endTime: string; // ISO string
  attachments?: AttachmentRequestDto[];
}

export interface AnnouncementResponseDto {
  id: number;
  title: string;
  description: string;
  language: Language;
  viewCount: number;
  hasViewed: boolean;
  attachments: AttachmentResponseDto[];
  createdAt: string;
  updatedAt: string;
  endTime: string;
  active: boolean;
}

export interface PaginatedAnnouncementsResponse {
  content: AnnouncementResponseDto[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  empty: boolean;
}

// Dashboard types
export interface LeaderDashboardData {
  leaderInfo: {
    id: number;
    name: string;
  };
  issueMetrics: {
    totalAssigned: number;
    resolved: number;
    inProgress: number;
    pending: number;
    escalated: number;
    resolutionRate: number;
  };
  topicMetrics: {
    created: number;
    participating: number;
    following: number;
    totalUpvotesReceived: number;
  };
  announcementMetrics: {
    created: number;
    totalViews: number;
    averageViews: number;
    active: number;
  };
  responseMetrics: {
    totalGiven: number;
    recentResponses: number;
    averageResponseTimeHours: number;
  };
  performanceScores: Record<string, any>;
}

export interface PaginatedTopicRepliesResponse {
  content: TopicReplyResponseDto[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  empty: boolean;
}

// Announcement types
export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: User;
  createdAt: Date;
  category: string;
  priority: 'normal' | 'important' | 'urgent';
  attachments?: Attachment[];
  targetAudience: string[];
  expiresAt?: Date;
  readBy: string[];
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: 'vote' | 'comment' | 'reply' | 'follow' | 'government_response' | 'status_update';
  title: string;
  message: string;
  relatedId: string;
  relatedType: 'issue' | 'topic' | 'comment' | 'government_reply';
  isRead: boolean;
  createdAt: Date;
}

// Language and translation types
export type Language = 'ENGLISH' | 'KINYARWANDA' | 'FRENCH';

export type Level = 'CELL' | 'SECTOR' | 'DISTRICT';

export interface LocationRequestDto {
  district: string;
  sector?: string;
  cell?: string;
  village?: string;
  latitude?: number;
  longitude?: number;
}

export interface AddLeaderRequestDto {
  firstName: string;
  lastName?: string;
  middleName?: string;
  phoneNumber: string;
  email?: string;
  role: UserRole;
  departmentId: number;
  leadershipLevel: Level;
  leadershipPlaceName: string;
  location: LocationRequestDto;
}

export interface AddLeaderResponseDto {
  userId: number;
  firstName: string;
  lastName?: string;
  middleName?: string;
  phoneNumber: string;
  email?: string;
  role: UserRole;
  accountStatus: AccountStatus;
  leadershipLevel: string;
  leadershipPlaceName: string;
  location: LocationResponseDto;
  generatedPassword?: string;
  message: string;
}

export interface LeaderSearchResponseDto {
  userId: number;
  firstName: string;
  lastName: string;
  middleName?: string;
  phoneNumber: string;
  email: string;
  role: UserRole;
  accountStatus: AccountStatus;
  leadershipLevel: string;
  leadershipPlaceName: string;
  departmentName: string;
  fullName: string;
}

export type UserRole = 'CITIZEN' | 'DISTRICT_LEADER' | 'SECTOR_LEADER' | 'CELL_LEADER' | 'DISTRICT_ADMIN' | 'SECTOR_ADMIN' | 'CELL_ADMIN' | 'ADMIN';

export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING';

export interface DepartmentResponseDto {
  id: number;
  nameEn: string;
  nameRw: string;
  nameFr: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export type Urgency = 'LOW' | 'MEDIUM' | 'URGENT';

export type IssueStatus = 'RECEIVED' | 'ESCALATED' | 'WAITING_FOR_USER_RESPONSE' | 'CLOSED' | 'OVERDUE' | 'RESOLVED';

export interface Translation {
  ENGLISH: string;
  KINYARWANDA: string;
  FRENCH: string;
}

// Admin and moderation types
export interface ModerationAction {
  id: string;
  moderatorId: string;
  targetId: string;
  targetType: 'issue' | 'comment' | 'government_reply';
  action: 'approve' | 'reject' | 'flag' | 'remove';
  reason: string;
  createdAt: Date;
}

export interface Leader {
  id: string;
  userId: number; // Backend returns userId
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phoneNumber: string;
  avatar?: string;
  profileUrl?: string;
  level: 'cell' | 'sector' | 'district';
  location: {
    district: string;
    sector?: string;
    cell?: string;
  };
  department?: DepartmentResponseDto;
  departmentName?: string; // For display purposes
  leadershipLevelName?: string;
  role: UserRole;
  accountStatus?: AccountStatus;
  canLogin: boolean;
  verified?: boolean;
  joinedAt: Date;
  language?: Language;
}

export interface IssueAssignment {
  id: string;
  issueId: string;
  assignedTo: string;
  assignedBy: string;
  assignedAt: Date;
  status: 'pending' | 'in_progress' | 'resolved' | 'escalated' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: Date;
  notes?: string;
}

export interface EscalationAction {
  id: string;
  issueId: string;
  fromLeader: string;
  toLeader?: string;
  escalationType: 'up' | 'down' | 'lateral';
  reason: string;
  createdAt: Date;
  status: 'pending' | 'accepted' | 'rejected';
}

export interface FileUploadConfig {
  maxSize: number;
  allowedTypes: string[];
  maxFiles: number;
}

// Survey types
export interface SurveyQuestion {
  id: string;
  type: 'multiple_choice' | 'short_text' | 'long_text' | 'checkbox' | 'radio' | 'rating' | 'yes_no';
  title: string;
  description?: string;
  required: boolean;
  options?: string[];
  maxRating?: number;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  userId: string;
  answers: { [questionId: string]: string | string[] | number };
  submittedAt: Date;
  ipAddress?: string;
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  author: User;
  createdAt: Date;
  updatedAt: Date;
  questions: SurveyQuestion[];
  responses: SurveyResponse[];
  isActive: boolean;
  expiresAt?: Date;
  targetAudience: string[];
  regionalRestriction?: {
    level: 'district' | 'sector' | 'cell';
    district?: string;
    sector?: string;
    cell?: string;
  };
}