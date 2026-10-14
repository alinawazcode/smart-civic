export type UserRole = 'resident' | 'staff' | 'admin';
export type AdminLevel = 'super_admin' | 'district_admin';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_super_admin: boolean;
  department: string;
  title: string;
  district: string;
  phone: string;
  cnic: string;
  badge_number: string;
  secret_key: string;
  status: 'active' | 'pending_approval' | 'rejected' | 'suspended';
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
  rejection_reason?: string;
}

export interface UserPermissions {
  isSuperAdmin: boolean;
  isDistrictAdmin: boolean;
  canManageAdmins: boolean;
  canModifySystemSettings: boolean;
  canManageAllDepartments: boolean;
  canDeleteUsers: boolean;
  allowedDepartment: string;
  allowedDistrict: string;
}

export function getUserPermissions(user?: Partial<UserRecord>): UserPermissions {
  if (!user || user.role !== 'admin') {
    return {
      isSuperAdmin: false,
      isDistrictAdmin: false,
      canManageAdmins: false,
      canModifySystemSettings: false,
      canManageAllDepartments: false,
      canDeleteUsers: false,
      allowedDepartment: user?.department || '',
      allowedDistrict: user?.district || ''
    };
  }

  const isSuper = Boolean(user.is_super_admin);
  return {
    isSuperAdmin: isSuper,
    isDistrictAdmin: !isSuper,
    canManageAdmins: isSuper,
    canModifySystemSettings: isSuper,
    canManageAllDepartments: isSuper,
    canDeleteUsers: isSuper,
    allowedDepartment: isSuper ? 'ALL' : user.department || '',
    allowedDistrict: isSuper ? 'ALL' : user.district || ''
  };
}
