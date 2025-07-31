import { describe, it, expect } from 'vitest';
import { UserSchema } from '../schemas/user';

describe('User Status Management', () => {
  describe('User Schema Status Validation', () => {
    it('should accept valid status values', () => {
      const validStatuses = ['pending', 'verified', 'flagged'];

      validStatuses.forEach(status => {
        const userData = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'test@example.com',
          fullName: 'Test User',
          phoneNumber: '+1234567890',
          role: 'help_seeker',
          description: 'Test description',
          status,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        expect(() => UserSchema.parse(userData)).not.toThrow();
      });
    });

    it('should reject invalid status values', () => {
      const invalidStatuses = ['invalid', 'approved', 'rejected', 'active'];

      invalidStatuses.forEach(status => {
        const userData = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'test@example.com',
          fullName: 'Test User',
          phoneNumber: '+1234567890',
          role: 'help_seeker',
          description: 'Test description',
          status,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        expect(() => UserSchema.parse(userData)).toThrow();
      });
    });

    it('should handle optional status field', () => {
      const userData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        fullName: 'Test User',
        phoneNumber: '+1234567890',
        role: 'help_seeker',
        description: 'Test description',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => UserSchema.parse(userData)).not.toThrow();
    });
  });

  describe('Status Transitions', () => {
    it('should validate status transition from pending to verified', () => {
      const pendingUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        fullName: 'Test User',
        phoneNumber: '+1234567890',
        role: 'help_seeker',
        description: 'Test description',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const verifiedUser = {
        ...pendingUser,
        status: 'verified',
        verifiedAt: new Date(),
        verifiedBy: '123e4567-e89b-12d3-a456-426614174001', // Valid UUID
      };

      expect(() => UserSchema.parse(pendingUser)).not.toThrow();
      expect(() => UserSchema.parse(verifiedUser)).not.toThrow();
    });

    it('should validate status transition from pending to flagged', () => {
      const pendingUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        fullName: 'Test User',
        phoneNumber: '+1234567890',
        role: 'help_seeker',
        description: 'Test description',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const flaggedUser = {
        ...pendingUser,
        status: 'flagged',
        verifiedAt: new Date(),
        verifiedBy: '123e4567-e89b-12d3-a456-426614174001', // Valid UUID
      };

      expect(() => UserSchema.parse(pendingUser)).not.toThrow();
      expect(() => UserSchema.parse(flaggedUser)).not.toThrow();
    });
  });

  describe('Description Field Validation', () => {
    it('should accept valid description', () => {
      const userData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        fullName: 'Test User',
        phoneNumber: '+1234567890',
        role: 'help_seeker',
        description: 'This is a valid description with sufficient detail about the help needed.',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => UserSchema.parse(userData)).not.toThrow();
    });

    it('should handle empty description', () => {
      const userData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        fullName: 'Test User',
        phoneNumber: '+1234567890',
        role: 'help_seeker',
        description: '',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => UserSchema.parse(userData)).not.toThrow();
    });

    it('should handle undefined description', () => {
      const userData = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        fullName: 'Test User',
        phoneNumber: '+1234567890',
        role: 'help_seeker',
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => UserSchema.parse(userData)).not.toThrow();
    });
  });
});
