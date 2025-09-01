import React, { useState } from 'react';
import { User } from '../types';
import { users, issues, topics } from '../data/dummyData';
import { IssueCard } from './IssueCard';
import { TopicCard } from './TopicCard';

interface UserProfileProps {
  userId: string;
  currentUser?: User;
  language?: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ userId, currentUser, language = 'ENGLISH' }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'issues' | 'topics'>('profile');
  
  const user = users.find(u => u.id === userId);
  const userIssues = issues.filter(issue => user?.reportedIssues?.includes(issue.id));
  const userTopics = topics.filter(topic => user?.createdTopics?.includes(topic.id));
  
  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">User not found</p>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === userId;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
        <div className="flex items-start space-x-6">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
          />
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm opacity-90">
              <div>
                <p><span className="font-medium">Email:</span> {user.email}</p>
                <p><span className="font-medium">Phone:</span> {user.phoneNumber}</p>
                <p><span className="font-medium">Role:</span> {user.role.replace('_', ' ')}</p>
              </div>
              <div>
                <p><span className="font-medium">District:</span> {user.location.district}</p>
                <p><span className="font-medium">Sector:</span> {user.location.sector}</p>
                <p><span className="font-medium">Cell:</span> {user.location.cell}</p>
                <p><span className="font-medium">Village:</span> {user.location.village}</p>
              </div>
            </div>
            {user.department && (
              <p className="mt-2"><span className="font-medium">Department:</span> {user.department}</p>
            )}
            <div className="flex items-center space-x-4 mt-3">
              {user.verified && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified
                </span>
              )}
              <span className="text-sm opacity-75">
                Member since {user.joinedAt.toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {[
            { key: 'profile', label: 'Profile', count: null },
            { key: 'issues', label: 'Reported Issues', count: userIssues.length },
            { key: 'topics', label: 'Created Topics', count: userTopics.length }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count !== null && (
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === tab.key
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-4">Personal Information</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">First Name:</span> {user.firstName}</p>
                  <p><span className="font-medium">Last Name:</span> {user.lastName}</p>
                  <p><span className="font-medium">Email:</span> {user.email}</p>
                  <p><span className="font-medium">Phone:</span> {user.phoneNumber}</p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-4">Location Details</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">District:</span> {user.location.district}</p>
                  <p><span className="font-medium">Sector:</span> {user.location.sector}</p>
                  <p><span className="font-medium">Cell:</span> {user.location.cell}</p>
                  <p><span className="font-medium">Village:</span> {user.location.village}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-4">Account Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-blue-600">{userIssues.length}</div>
                  <div className="text-sm text-gray-600">Issues Reported</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-green-600">{userTopics.length}</div>
                  <div className="text-sm text-gray-600">Topics Created</div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-purple-600">
                    {userIssues.filter(i => i.status === 'resolved').length}
                  </div>
                  <div className="text-sm text-gray-600">Issues Resolved</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'issues' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">
                {isOwnProfile ? 'Your Reported Issues' : `Issues Reported by ${user.name}`}
              </h3>
              <span className="text-sm text-gray-500">{userIssues.length} total</span>
            </div>
            
            {userIssues.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500">
                  {isOwnProfile ? 'You haven\'t reported any issues yet.' : 'No issues reported yet.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {userIssues.map((issue) => (
                  <IssueCard 
                    key={issue.id} 
                    issue={issue} 
                    language={language}
                    currentUser={user}
                    onClick={() => {}}
                    onIssueUpdate={(updatedIssue) => {
                      // Update the issue in the local state
                      setUserIssues(prevIssues => 
                        prevIssues.map(i => 
                          i.id === updatedIssue.id ? updatedIssue : i
                        )
                      );
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'topics' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">
                {isOwnProfile ? 'Your Created Topics' : `Topics Created by ${user.name}`}
              </h3>
              <span className="text-sm text-gray-500">{userTopics.length} total</span>
            </div>
            
            {userTopics.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-gray-500">
                  {isOwnProfile ? 'You haven\'t created any topics yet.' : 'No topics created yet.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {userTopics.map((topic) => (
                  <TopicCard 
                    key={topic.id} 
                    topic={topic}
                    language={language}
                    onClick={() => {}}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
