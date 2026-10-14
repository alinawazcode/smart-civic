import React, { createContext, useContext, useState, useEffect } from 'react';
import { Role } from '../types';

export interface UserProfile {
  role: Role;
  isLoggedIn?: boolean;
  name: string;
  email: string;
  phone?: string;
  cnic?: string;
  district?: string;
  address?: string;
  badge?: string;
  department?: string;
  isSuperAdmin?: boolean;
}

interface RoleContextType {
  role: Role;
  isLoggedIn: boolean;
  setRole: (role: Role) => void;
  userName: string;
  userEmail: string;
  userPhone?: string;
  userCnic?: string;
  userDistrict?: string;
  userAddress?: string;
  userBadge?: string;
  userDepartment?: string;
  isSuperAdmin?: boolean;
  setCurrentUser: (profile: UserProfile) => void;
  logout: () => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'smart_civic_auth_user_v2';

const DEFAULT_USERS: Record<Role, UserProfile> = {
  resident: {
    role: 'resident',
    isLoggedIn: true,
    name: 'Ayesha Siddiqui',
    email: 'ayesha.resident@civiccare.org',
    phone: '0300-2918273',
    cnic: '42101-8392183-2',
    district: 'Karachi East (Gulshan-e-Iqbal)',
    address: 'Block 13-D, University Road'
  },
  staff: {
    role: 'staff',
    isLoggedIn: true,
    name: 'Rashid Minhas',
    email: 'rashid.field@kwsb.gov.pk',
    phone: '0301-8291044',
    cnic: '42101-7291024-3',
    badge: 'KWSB-8821',
    district: 'Karachi Central',
    department: 'KW&SB Water & Sanitation'
  },
  admin: {
    role: 'admin',
    isLoggedIn: true,
    name: 'Director Tariq Jameel',
    email: 'admin.tariq@karachicity.gov.pk',
    department: 'Karachi Municipal Corporation',
    isSuperAdmin: true
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
            return {
              ...parsed,
              isLoggedIn: parsed.isLoggedIn !== false
            };
          }
        }
      } catch {
        // fallback
      }
    }
    // Default to guest resident (not logged in by default until they click sign in or resident test login)
    return {
      role: 'resident',
      isLoggedIn: false,
      name: 'Guest Citizen',
      email: 'guest@civic.pk'
    };
  });

  const setRole = (newRole: Role) => {
    const template = DEFAULT_USERS[newRole] || { role: newRole, name: 'User', email: 'user@civic.pk' };
    const updated: UserProfile = {
      ...template,
      isLoggedIn: true
    };
    setCurrentUserState(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
    }
  };

  const setCurrentUser = (profile: UserProfile) => {
    const updated: UserProfile = {
      ...profile,
      isLoggedIn: profile.isLoggedIn !== false
    };
    setCurrentUserState(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updated));
    }
  };

  const logout = () => {
    const guestUser: UserProfile = {
      role: 'resident',
      isLoggedIn: false,
      name: 'Guest Citizen',
      email: 'guest@civic.pk'
    };
    setCurrentUserState(guestUser);
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
        isLoggedIn: currentUser.isLoggedIn === true,
        setRole,
        userName: currentUser.name,
        userEmail: currentUser.email,
        userPhone: currentUser.phone,
        userCnic: currentUser.cnic,
        userDistrict: currentUser.district,
        userAddress: currentUser.address,
        userBadge: currentUser.badge,
        userDepartment: currentUser.department,
        isSuperAdmin: currentUser.isSuperAdmin,
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
