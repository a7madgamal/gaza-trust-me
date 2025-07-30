# Progress - MVP Features

## Current Status: Backend Setup ✅

### Completed

- ✅ Basic Express server with tRPC
- ✅ Database schema and migrations
- ✅ Authentication middleware
- ✅ Basic validation utilities
- ✅ Test setup with Vitest
- ✅ ESLint and TypeScript configuration
- ✅ Git hooks with pre-commit checks

### Next: Core MVP Features

## 1. User Registration & Login ✅

**MVP Goal:** Users can create accounts and sign in

- ✅ Simple email/password registration
- ✅ Email verification (basic)
- ✅ Login/logout functionality
- ✅ Basic profile storage

## 2. Case Submission

**MVP Goal:** Help seekers can submit requests

- Simple form: name, email, phone, description
- Basic image upload (1-2 images max)
- Save to database with "pending" status
- No complex validation initially

## 3. Admin Review

**MVP Goal:** Admins can approve/reject cases

- Admin login (hardcoded admin account)
- List pending cases
- Approve or reject with simple reason
- Mark as "verified" or "flagged"

## 4. Public Case Display

**MVP Goal:** Anyone can view approved cases

- Simple list of verified cases
- Basic case details (no contact info initially)
- Simple image display
- No search/filtering initially

## 5. Basic Frontend

**MVP Goal:** Simple web interface

- Home page with case listings
- Registration/login forms
- Case submission form
- Admin review page
- Basic responsive design

## Technical Priorities

1. **Database**: Complete user and case tables
2. **API**: Basic CRUD endpoints for cases
3. **Auth**: Simple JWT-based authentication
4. **Frontend**: React app with basic routing
5. **Deployment**: Simple hosting setup

## Success Criteria

- Users can register and submit cases
- Admins can review and approve cases
- Public can view approved cases
- Basic security and validation
- Deployed and accessible online
