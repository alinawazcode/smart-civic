import React, { createContext, useContext, useState, useEffect } from 'react';
import { Role } from '../types';

export interface UserProfile {
  role: Role;
  name: string;
  email: string;
  badge?: string;
  department?: string;
}

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
  userName: string;
  userEmail: string;
  userBadge?: string;
  userDepartment?: string;
  setCurrentUser: (profile: UserProfile) => void;
  logout: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'smart_civic_auth_user_v1';

const DEFAULT_USERS: Record<Role, UserProfile> = {
  resident: { role: 'resident', name: 'Ayesha Siddiqui', email: 'ayesha.resident@civiccare.org' },
  staff: {
    role: 'staff',
    name: 'Rashid Minhas',
    email: 'rashid.field@kwsb.gov.pk',
    badge: 'KWSB-8821',
    department: 'KW&SB Water & Sanitation'
  },
  admin: {
    role: 'admin',
    name: 'Director Tariq Jameel',
    email: 'admin.tariq@karachicity.gov.pk',
    department: 'Karachi Municipal Corporation'
  }
};

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<UserProfile>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(CURRENT_USER_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && ['resident', 'staff', 'admin'].includes(parsed.role)) {
            return parsed;
          }
        }
      } catch {
        // fallback
      }
    }
    return DEFAULT_USERS.resident;
  });

  const setRole = (newRole: Role) => {
    const updated = DEFAULT_USERS[newRole] || { role: newRole, name: 'User', email: 'user@civic.pk' };
    setCurrentUserState(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
    }
  };

  const setCurrentUser = (profile: UserProfile) => {
    setCurrentUserState(profile);
    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
    }
  };

  const logout = () => {
    const defaultRes = DEFAULT_USERS.resident;
    setCurrentUserState(defaultRes);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
    }
  }, [currentUser]);

  return (
    <RoleContext.Provider
      value={{
        role: currentUser.role,
        setRole,
        userName: currentUser.name,
        userEmail: currentUser.email,
        userBadge: currentUser.badge,
        userDepartment: currentUser.department,
        setCurrentUser,
        logout
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
