# Help-Seeking Platform - Product Requirements Document

## Document Update Guidelines

**Important:** When updating this document, maintain the hierarchical numbering system:

1. Keep existing numbering for unchanged items
2. When adding new items, insert them with appropriate numbering
3. When removing items, update all subsequent numbering in that section
4. Maintain consistent indentation levels for sub-items
5. Always verify that the numbering sequence is complete and logical after changes

## Project Overview

**Product Name:** Help-Seeking Platform  
**Type:** Production-ready web application  
**Purpose:** Connect people in need with potential helpers through a human verified, secure platform

## User Roles & Permissions

### 1. Help Seekers (Registration Required)

**Core Features:**

1.1. User registration with email verification (Supabase Auth)
1.2. Profile creation with personal information (Supabase Storage)
1.3. Profile management with:
1.3.1. Description
1.3.2. Image uploads (multiple images supported)
1.4. View profile status (pending, verified, flagged)
1.5. Edit profile information
1.6. Delete account

**Data Requirements:**

1.7. Email address (verified)
1.8. Full name
1.9. Phone number
1.10. Profile description
1.11. LinkedIn profile URL (optional)
1.12. Campaign/fundraising URL (optional)

### 2. Help Providers (Optional Registration)

**Core Features:**

2.1. Browse verified help seeker profiles
2.2. Search and filter profiles by:
2.2.1. Category/type of help needed
2.3. View profile details including:
2.3.1. Seeker's basic information
2.3.2. Profile description
2.3.3. Images

### 3. Admins (Secure Login Required)

**Core Features:**

3.1. Secure login with email/password
3.2. Review pending help seeker submissions
3.3. Verify or flag profiles with:
3.3.1. Approval/rejection decision
3.3.2. Remarks/notes for each action
3.3.3. Timestamp and admin identification
3.4. View verified and flagged profiles
3.5. Search and filter profiles by status
3.6. Bulk operations for multiple profiles
3.7. View admin activity history

**Permissions:**

3.8. Can verify/flag profiles
3.9. Can view all profile details
3.10. Can leave remarks
3.11. Cannot assign other admins
3.12. Cannot view audit logs

### 4. Super Admins (Secure Login Required)

**Core Features:**

4.1. All Admin features plus:
4.2. User role management:
4.2.1. Assign admin roles by email
4.2.2. Remove admin roles
4.2.3. View all users and their roles
4.3. Comprehensive audit logging:
4.3.1. View all system actions
4.3.2. Filter by user, action type, date range
4.3.3. Export audit logs
4.4. System-wide settings management
4.5. Database maintenance tools
4.6. User account management

**Permissions:**

4.7. Full system access
4.8. Can assign/remove admin roles
4.9. Can view all audit logs
4.10. Can manage system settings
4.11. Can delete user accounts

**Implemented Features:**

4.12. ✅ **User role management** - Upgrade help seekers to admin, downgrade admins to help seekers
4.13. ✅ **Super admin middleware** - Secure role-based access control
4.14. ✅ **Security checks** - Prevent self-modification and super admin downgrades
4.15. ✅ **Admin dashboard integration** - Role management UI in existing admin interface
4.16. ✅ **Confirmation dialogs** - Secure role change confirmations with remarks
4.17. ❌ **Comprehensive audit logging** - Not yet implemented
4.18. ❌ **System-wide settings management** - Not yet implemented
4.19. ❌ **Database maintenance tools** - Not yet implemented
4.20. ❌ **User account management** - Not yet implemented

## Core Features & Requirements

### Authentication & Security

5.1. Multi-factor authentication for admin and super admin accounts
5.2. Role-based access control (RBAC) with JWT tokens
5.3. Session management with secure token refresh
5.4. Password policies for admin accounts
5.5. Rate limiting on authentication endpoints
5.6. Audit logging for all authentication events

### User Profile Management

5.7. Profile submission workflow:
5.7.1. User registers/logs in
5.7.2. Fills profile details form
5.7.3. Uploads images (max 5 images, 5MB each)
5.7.4. Submits for admin review
5.7.5. Receives status updates
5.8. Profile verification process:
5.8.1. Admin reviews submission
5.8.2. Checks images and details
5.8.3. Approves or flags with remarks
5.8.4. System logs action with timestamp
5.9. Profile display:
5.9.1. Public listing of verified profiles only
5.9.2. Responsive card layout
5.9.3. Image gallery with lazy loading
5.9.4. Contact information display
5.9.5. LinkedIn profile links (when provided)
5.9.6. Campaign/fundraising links (when provided)
5.9.5. Search and filter functionality

### Image Management

5.10. Upload requirements:
5.10.1. Supported formats: JPG, PNG, WebP
5.10.2. Maximum file size: 5MB per image
5.10.3. Maximum images per profile: 5
5.10.4. Automatic image optimization
5.11. Storage:
5.11.1. Supabase Storage with RLS policies
5.11.2. Signed URLs for secure access
5.11.3. Image transformations (resize, compress)
5.12. Security:
5.12.1. Virus scanning on upload
5.12.2. Content validation
5.12.3. Access control via RLS

### Database Requirements

#### Core Tables

5.13. Users Table: Store user accounts with roles, authentication data, and profile information
5.14. User Profiles Table: Store help requests with status, verification data, and contact information
5.15. User Images Table: Store uploaded images with metadata and file information
5.16. Audit Logs Table: Track all system actions for security and compliance

#### Data Relationships

5.17. Users can have multiple profiles (one-to-many)
5.18. Profiles can have multiple images (one-to-many)
5.19. All actions are logged in audit table with user and resource references
5.20. Role-based access control enforced at database level

### API Endpoints

#### Authentication

5.21. POST /auth/register - User registration
5.22. POST /auth/login - User login
5.23. POST /auth/logout - User logout
5.24. POST /auth/refresh - Refresh token
5.25. POST /auth/verify-email - Email verification

#### User Profiles

5.26. GET /profiles - List verified profiles (public)
5.27. POST /profiles - Create new profile (authenticated)
5.28. GET /profiles/:id - Get profile details
5.29. PUT /profiles/:id - Update profile (owner only)
5.30. DELETE /profiles/:id - Delete profile (owner only)
5.31. POST /profiles/:id/images - Upload profile images
5.32. DELETE /profiles/:id/images/:imageId - Delete profile image

#### Admin

5.33. GET /admin/profiles - List all profiles (admin only)
5.34. PUT /admin/profiles/:id/verify - Verify profile (admin only)
5.35. PUT /admin/profiles/:id/flag - Flag profile (admin only)
5.36. GET /admin/audit-logs - View audit logs (super admin only)
5.37. PUT /admin/users/:id/role - Upgrade/downgrade user role (super admin only)

#### Users

5.37. GET /users/profile - Get user profile
5.38. PUT /users/profile - Update user profile
5.39. GET /admin/users - List all users (super admin only)
5.40. PUT /admin/users/:id/role - Assign user role (super admin only)

## UI/UX Requirements

### Design System

6.1. Material UI v5 with custom theme
6.2. Responsive design (mobile-first approach)
6.3. Accessibility compliance (WCAG 2.1 AA)
6.4. Dark/Light mode support
6.5. Consistent spacing and typography

### Key Pages

#### Public Pages

6.6. Home/Landing Page: Introduction, featured profiles, call-to-action
6.7. Profiles Listing: Grid/list view of verified profiles with filters
6.8. Profile Detail: Full profile information with images and contact details
6.9. Registration: User registration form
6.10. Login: Authentication form

#### Authenticated Pages

6.11. Dashboard: User's profiles and status
6.12. Profile Submission: Multi-step form for creating profiles
6.13. Profile Management: Edit personal information
6.14. Admin Panel: Profile review interface
6.15. Super Admin Panel: User and system management

### Responsive Breakpoints

6.16. Mobile: 320px - 768px
6.17. Tablet: 768px - 1024px
6.18. Desktop: 1024px+

## Performance Requirements

### Frontend

7.1. Initial load time: < 3 seconds
7.2. Image loading: Lazy loading with placeholders
7.3. Bundle size: < 500KB gzipped
7.4. Core Web Vitals: Pass all metrics

### Backend

7.5. API response time: < 200ms for most endpoints
7.6. Database queries: Optimized with proper indexing
7.7. File uploads: Progress indicators and validation
7.8. Rate limiting: Prevent abuse

## Security Requirements

### Data Protection

8.1. Encryption at rest for sensitive data
8.2. HTTPS only in production
8.3. Input sanitization and validation
8.4. XSS protection on all user inputs
8.5. CSRF protection for forms

### Access Control

8.6. JWT token validation on all protected routes
8.7. Role-based permissions enforced at API level
8.8. Row-level security in database
8.9. Audit logging for all sensitive operations

### File Security

8.10. Virus scanning on uploads
8.11. File type validation
8.12. Size limits enforcement
8.13. Secure file serving with signed URLs

## Deployment & DevOps

### Environment Configuration

9.1. Development: Local development setup
9.2. Staging: Pre-production testing
9.3. Production: Live environment

### Monitoring & Logging

9.4. Application logs with structured logging
9.5. Error tracking and alerting
9.6. Performance monitoring
9.7. Health checks for all services

### Backup & Recovery

9.8. Database backups (daily)
9.9. File storage backups (daily)
9.10. Disaster recovery procedures
9.11. Point-in-time recovery capability

## Testing Strategy

### Unit Testing

10.1. Frontend: React components and utilities
10.2. Backend: API endpoints and business logic
10.3. Coverage target: > 80%

### Integration Testing

10.4. API testing with real database
10.5. Authentication flows
10.6. File upload scenarios

### End-to-End Testing

10.7. User registration and profile submission
10.8. Admin verification workflow
10.9. Super admin role management
10.10. Type-safe test utilities with generated Supabase types
10.11. Service role key authentication for test database access
10.12. RLS policy bypass for test isolation
10.13. Card interface testing (LinkedIn/campaign links, WhatsApp integration)
10.14. URL routing and navigation testing

## Success Metrics

### User Engagement

11.1. Registration rate for help seekers
11.2. Profile submission completion rate
11.3. Admin response time for verifications
11.4. User retention rates

### Platform Performance

11.5. System uptime > 99.9%
11.6. API response times < 200ms
11.7. Error rates < 1%
11.8. Security incidents = 0

### Business Impact

11.9. Number of verified profiles published
11.10. Help provider engagement with profiles
11.11. Successful connections made through platform
