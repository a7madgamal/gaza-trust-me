import { describe, it, expect } from 'vitest';
import {
  AdminUserListInputSchema,
  AdminUserActionInputSchema,
  USER_ROLES,
  SEEKER_STATUSES,
} from '../types/supabase-types';

describe('Admin System', () => {
  describe('Admin User List Schema Validation', () => {
    it('should validate admin user list input with no filters', () => {
      const validInput = {
        limit: 20,
        offset: 0,
      };

      const result = AdminUserListInputSchema.parse(validInput);
      expect(result).toEqual({
        ...validInput,
        sortOrder: 'desc', // Default value from schema
      });
    });

    it('should validate admin user list input with status filter', () => {
      const validInput = {
        status: 'pending' as const,
        limit: 10,
        offset: 0,
      };

      const result = AdminUserListInputSchema.parse(validInput);
      expect(result).toEqual({
        ...validInput,
        sortOrder: 'desc', // Default value from schema
      });
    });

    it('should reject invalid status in admin user list input', () => {
      const invalidInput = {
        status: 'invalid_status',
        limit: 10,
        offset: 0,
      };

      expect(() => {
        AdminUserListInputSchema.parse(invalidInput);
      }).toThrow();
    });

    it('should reject negative limit in admin user list input', () => {
      const invalidInput = {
        limit: -1,
        offset: 0,
      };

      expect(() => {
        AdminUserListInputSchema.parse(invalidInput);
      }).toThrow();
    });

    it('should reject limit over 100 in admin user list input', () => {
      const invalidInput = {
        limit: 101,
        offset: 0,
      };

      expect(() => {
        AdminUserListInputSchema.parse(invalidInput);
      }).toThrow();
    });

    it('should reject negative offset in admin user list input', () => {
      const invalidInput = {
        limit: 20,
        offset: -1,
      };

      expect(() => {
        AdminUserListInputSchema.parse(invalidInput);
      }).toThrow();
    });
  });

  describe('Admin User Action Schema Validation', () => {
    it('should validate verify action input', () => {
      const validInput = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        action: 'verify' as const,
        remarks: 'User looks legitimate',
      };

      const result = AdminUserActionInputSchema.parse(validInput);
      expect(result).toEqual(validInput);
    });

    it('should validate flag action input', () => {
      const validInput = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        action: 'flag' as const,
        remarks: 'Suspicious activity detected',
      };

      const result = AdminUserActionInputSchema.parse(validInput);
      expect(result).toEqual(validInput);
    });

    it('should validate action input without remarks', () => {
      const validInput = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        action: 'verify' as const,
      };

      const result = AdminUserActionInputSchema.parse(validInput);
      expect(result).toEqual(validInput);
    });

    it('should reject invalid action', () => {
      const invalidInput = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        action: 'invalid_action',
      };

      expect(() => {
        AdminUserActionInputSchema.parse(invalidInput);
      }).toThrow();
    });

    it('should reject empty user ID', () => {
      const invalidInput = {
        userId: '',
        action: 'verify' as const,
      };

      expect(() => {
        AdminUserActionInputSchema.parse(invalidInput);
      }).toThrow();
    });
  });

  describe('Admin Schema Constants', () => {
    it('should have correct user roles', () => {
      expect(USER_ROLES).toEqual(['help_seeker', 'admin', 'super_admin']);
    });

    it('should have correct seeker statuses', () => {
      expect(SEEKER_STATUSES).toEqual(['pending', 'verified', 'flagged']);
    });
  });
});
