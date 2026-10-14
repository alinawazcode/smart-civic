/**
 * Role-Based Access Control (RBAC) & District Governance Model
 * Enforces strict boundary segregation between Super Admins and District Admins.
 * 
 * Rules:
 * 1. Super Admin has sovereign global access across all municipal districts, system database,
 *    global audit logs, and account creation/deletion for any role.
 * 2. District Admin is strictly constrained to their designated district (e.g., Karachi East, Karachi Central).
 *    They can ONLY triage tickets in their district, manage field staff assigned to their district,
 *    and view district-specific audit events. They CANNOT create/edit/delete admins or alter global SLA/database settings.
 */

import { Role } from '../types';
import { UserProfile } from '../context/RoleContext';

export type AdminTier = 'super_admin' | 'district_admin' | 'department_head';

export interface DistrictScope {
  code: string;
  name: string;
  zones: string[];
}

export const MUNICIPAL_DISTRICTS: DistrictScope[] = [
  { code: 'DIST-EAST', name: 'Karachi East', zones: ['Gulshan-e-Iqbal', 'Block 4', 'Block 13-D', 'University Road', 'Jauhar'] },
  { code: 'DIST-CENTRAL', name: 'Karachi Central', zones: ['Nazimabad', 'North Nazimabad', 'Liaquatabad', 'Federal B Area'] },
  { code: 'DIST-SOUTH', name: 'Karachi South', zones: ['Saddar', 'Clifton', 'DHA Phase 5 & 6', 'I.I. Chundrigar Road'] },
  { code: 'DIST-WEST', name: 'Karachi West', zones: ['SITE Area', 'Orangi Town', 'Manghopir', 'Baldia'] },
  { code: 'DIST-KORANGI', name: 'Korangi', zones: ['Korangi Industrial Area', 'Landhi', 'Shah Faisal Colony'] },
  { code: 'DIST-MALIR', name: 'Malir', zones: ['Malir Cantt', 'Model Colony', 'Airport Corridor', 'Gadap'] },
  { code: 'DIST-KEAMARI', name: 'Keamari', zones: ['Harbour', 'Mauripur', 'Hawkesbay', 'Baldia North'] }
];

export interface PermissionCheckResult {
  allowed: boolean;
  reason?: string;
}

export const RBACModel = {
  /**
   * Determine if a user is a Sovereign Super Admin
   */
  isSuperAdmin(user?: Partial<UserProfile> | null): boolean {
    if (!user) return false;
    return user.role === 'admin' && user.isSuperAdmin === true;
  },

  /**
   * Determine if a user is a District-Restricted Administrator
   */
  isDistrictAdmin(user?: Partial<UserProfile> | null): boolean {
    if (!user) return false;
    return user.role === 'admin' && user.isSuperAdmin !== true;
  },

  /**
   * Get the administrative tier of a user
   */
  getAdminTier(user?: Partial<UserProfile> | null): AdminTier | 'none' {
    if (!user || user.role !== 'admin') return 'none';
    if (user.isSuperAdmin) return 'super_admin';
    return 'district_admin';
  },

  /**
   * Check if user can create, edit, or delete another administrative account
   */
  canManageAdmins(actor?: Partial<UserProfile> | null): PermissionCheckResult {
    if (this.isSuperAdmin(actor)) {
      return { allowed: true };
    }
    return {
      allowed: false,
      reason: 'Administrative account management is restricted to Central Command Super Administrators.'
    };
  },

  /**
   * Check if user can access / triage a ticket based on district zoning
   */
  canAccessTicket(
    actor?: Partial<UserProfile> | null,
    ticketArea?: string
  ): PermissionCheckResult {
    if (!actor) return { allowed: false, reason: 'Authentication required' };
    if (this.isSuperAdmin(actor) || actor.role === 'resident') {
      return { allowed: true };
    }

    if (this.isDistrictAdmin(actor)) {
      if (!actor.district) return { allowed: true };
      if (!ticketArea) return { allowed: true };

      // Normalization check
      const userDist = actor.district.toLowerCase();
      const area = ticketArea.toLowerCase();

      // Check if ticket area is in district or district name matches
      const isMatch =
        area.includes(userDist) ||
        userDist.includes(area) ||
        this.isAreaInDistrict(ticketArea, actor.district);

      if (isMatch) return { allowed: true };

      return {
        allowed: false,
        reason: `District Admin access is restricted to ${actor.district}. Ticket is located in ${ticketArea}.`
      };
    }

    return { allowed: true };
  },

  /**
   * Check if user can manage a specific staff member
   */
  canManageStaff(
    actor?: Partial<UserProfile> | null,
    staffDistrict?: string
  ): PermissionCheckResult {
    if (!actor) return { allowed: false, reason: 'Authentication required' };
    if (this.isSuperAdmin(actor)) return { allowed: true };

    if (this.isDistrictAdmin(actor)) {
      if (!actor.district || !staffDistrict) return { allowed: true };
      const actorDist = actor.district.toLowerCase();
      const staffDist = staffDistrict.toLowerCase();

      if (actorDist.includes(staffDist) || staffDist.includes(actorDist)) {
        return { allowed: true };
      }
      return {
        allowed: false,
        reason: `District Admins can only supervise staff assigned to ${actor.district}.`
      };
    }

    return { allowed: false, reason: 'Staff management requires administrative privileges' };
  },

  /**
   * Check if user can modify global system settings (AI weights, SLAs, DB backup)
   */
  canEditSystemSettings(actor?: Partial<UserProfile> | null): PermissionCheckResult {
    if (this.isSuperAdmin(actor)) return { allowed: true };
    return {
      allowed: false,
      reason: 'System settings & SLA weight calibration are restricted to Super Administrators.'
    };
  },

  /**
   * Check if user can export or sync the live SQLite database
   */
  canSyncDatabase(actor?: Partial<UserProfile> | null): PermissionCheckResult {
    if (this.isSuperAdmin(actor)) return { allowed: true };
    return {
      allowed: false,
      reason: 'Direct SQLite database synchronization & backup requires Super Admin credentials.'
    };
  },

  /**
   * Helper to check if an area belongs to a given district
   */
  isAreaInDistrict(areaName: string, districtName: string): boolean {
    const cleanArea = areaName.toLowerCase();
    const cleanDist = districtName.toLowerCase();

    for (const d of MUNICIPAL_DISTRICTS) {
      if (cleanDist.includes(d.name.toLowerCase())) {
        return d.zones.some((z) => cleanArea.includes(z.toLowerCase()));
      }
    }
    return false;
  }
};
