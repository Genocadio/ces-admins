import React, { useState } from 'react';
import { User } from '../types';
import { users } from '../data/dummyData';
import UserProfile from './UserProfile';

interface UserDashboardProps {
  language: string;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ language }) => {
  const [currentUser] = useState<User>(users[0]); // For demo purposes, using first user
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUser.id);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">User Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} {user.id === currentUser.id && '(You)'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <UserProfile 
          userId={selectedUserId}
          currentUser={currentUser}
          language={language}
        />
      </div>
    </div>
  );
};

export default UserDashboard;
